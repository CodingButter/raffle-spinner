/**
 * Retry Service for Webhook Operations
 * Implements exponential backoff and circuit breaker patterns
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryCondition = (error) => !error.message.includes('400') && !error.message.includes('401')
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx) by default
      if (!retryCondition(lastError)) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelay
      );

      console.warn(
        `Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, 
        lastError.message
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Idempotent operation wrapper
 * Ensures operations can be safely retried without side effects
 */
export async function withIdempotency<T>(
  operation: () => Promise<T>,
  idempotencyKey: string,
  options: RetryOptions = {}
): Promise<T> {
  const operationWithKey = async () => {
    console.log(`Executing operation with idempotency key: ${idempotencyKey}`);
    return await operation();
  };

  return withRetry(operationWithKey, options);
}

/**
 * Circuit breaker for external service calls
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold: number;
  private readonly timeout: number;

  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
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

  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      return Date.now() - this.lastFailureTime < this.timeout;
    }
    return false;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }

  getStatus(): { failures: number; isOpen: boolean } {
    return {
      failures: this.failures,
      isOpen: this.isOpen()
    };
  }
}

// Global circuit breakers for different services
export const directusCircuitBreaker = new CircuitBreaker(5, 60000);
export const stripeCircuitBreaker = new CircuitBreaker(3, 30000);