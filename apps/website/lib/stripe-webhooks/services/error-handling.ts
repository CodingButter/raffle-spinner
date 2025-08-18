/**
 * Webhook Error Handling and Retry Service
 * Comprehensive error management with exponential backoff retry logic
 */

import { WebhookError, RetryConfig } from '../types';

// Default retry configuration following exponential backoff
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  max_attempts: 3,
  initial_delay_ms: 1000,
  backoff_multiplier: 2,
  max_delay_ms: 30000,
};

// Error classification for retry decisions
const RETRYABLE_ERROR_CODES = [
  'NETWORK_ERROR',
  'DIRECTUS_TIMEOUT',
  'STRIPE_RATE_LIMIT',
  'TEMPORARY_SERVICE_UNAVAILABLE',
];

const NON_RETRYABLE_ERROR_CODES = [
  'INVALID_WEBHOOK_SIGNATURE',
  'CUSTOMER_NOT_FOUND',
  'SUBSCRIPTION_NOT_FOUND',
  'INVALID_PRICE_ID',
  'DIRECTUS_AUTH_FAILED',
];

/**
 * Classify error to determine if it's retryable
 */
export function classifyError(error: Error): WebhookError {
  const message = error.message.toLowerCase();

  // Network and timeout errors
  if (message.includes('timeout') || message.includes('econnreset') || message.includes('socket')) {
    return {
      code: 'NETWORK_ERROR',
      message: error.message,
      retryable: true,
    };
  }

  // Directus authentication issues
  if (message.includes('failed to authenticate') || message.includes('401')) {
    return {
      code: 'DIRECTUS_AUTH_FAILED',
      message: error.message,
      retryable: false,
    };
  }

  // Stripe rate limiting
  if (message.includes('rate limit') || message.includes('429')) {
    return {
      code: 'STRIPE_RATE_LIMIT',
      message: error.message,
      retryable: true,
    };
  }

  // Customer or subscription not found
  if (
    message.includes('not found') &&
    (message.includes('customer') || message.includes('subscription'))
  ) {
    return {
      code: 'RESOURCE_NOT_FOUND',
      message: error.message,
      retryable: false,
    };
  }

  // Service unavailable
  if (message.includes('503') || message.includes('service unavailable')) {
    return {
      code: 'TEMPORARY_SERVICE_UNAVAILABLE',
      message: error.message,
      retryable: true,
    };
  }

  // Default to non-retryable for unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message,
    retryable: false,
  };
}

/**
 * Execute function with retry logic and exponential backoff
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  eventId?: string
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: WebhookError;

  for (let attempt = 1; attempt <= retryConfig.max_attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error as Error);

      // Log the attempt
      console.error(`Webhook operation failed (attempt ${attempt}/${retryConfig.max_attempts}):`, {
        eventId,
        error: lastError,
        attempt,
      });

      // Don't retry if error is non-retryable or we've exhausted attempts
      if (!lastError.retryable || attempt === retryConfig.max_attempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        retryConfig.initial_delay_ms * Math.pow(retryConfig.backoff_multiplier, attempt - 1),
        retryConfig.max_delay_ms
      );

      console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${retryConfig.max_attempts})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Wrap webhook handler with comprehensive error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  handlerName: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      const webhookError = classifyError(error as Error);

      console.error(`Webhook handler ${handlerName} failed:`, {
        error: webhookError,
        args: args.map((arg) =>
          typeof arg === 'object' && arg !== null
            ? { type: arg.constructor.name, id: (arg as any).id }
            : arg
        ),
      });

      // For critical errors, we might want to send alerts
      if (!webhookError.retryable) {
        await sendCriticalErrorAlert(handlerName, webhookError);
      }

      throw webhookError;
    }
  };
}

/**
 * Send alert for critical webhook errors
 * TODO: Integrate with monitoring service (e.g., Sentry, DataDog)
 */
async function sendCriticalErrorAlert(handlerName: string, error: WebhookError): Promise<void> {
  try {
    // For now, just log the critical error
    // In production, this should send to monitoring service
    console.error('🚨 CRITICAL WEBHOOK ERROR - Manual intervention required:', {
      handler: handlerName,
      error,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to Slack/PagerDuty/monitoring service
    // await sendSlackAlert(`Critical webhook error in ${handlerName}: ${error.message}`);
  } catch (alertError) {
    console.error('Failed to send critical error alert:', alertError);
  }
}

/**
 * Create a circuit breaker for webhook operations
 * Prevents cascading failures when external services are down
 */
export class WebhookCircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeMs: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - operation blocked');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error(`🔥 Circuit breaker OPENED after ${this.failures} failures`);
    }
  }

  getState(): string {
    return this.state;
  }
}

// Global circuit breaker for Directus operations
export const directusCircuitBreaker = new WebhookCircuitBreaker(5, 60000);
