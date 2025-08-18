/**
 * Security Service for Webhook Operations
 * Implements rate limiting, IP validation, and security headers
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limiter (use Redis in production)
 */
class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) { // 100 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    return entry?.resetTime || Date.now() + this.windowMs;
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Global rate limiter instance
export const webhookRateLimiter = new RateLimiter(100, 60000); // 100 req/min

// Cleanup old entries every 5 minutes
setInterval(() => {
  webhookRateLimiter.cleanup();
}, 300000);

/**
 * Validate webhook source IP (if using IP allowlist)
 */
export function validateWebhookIP(ip: string): boolean {
  // Stripe's webhook IPs (these can change, check Stripe docs)
  const allowedIPs = [
    '54.187.174.169',
    '54.187.205.235',
    '54.187.216.72',
    '54.241.31.99',
    '54.241.31.102',
    '54.241.34.107'
  ];

  // Allow localhost for development
  if (process.env.NODE_ENV === 'development') {
    allowedIPs.push('127.0.0.1', '::1', '::ffff:127.0.0.1');
  }

  return allowedIPs.includes(ip);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  // Check various headers that might contain the real IP
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to remote address (may not be available in serverless)
  return '127.0.0.1'; // Default for serverless environments
}

/**
 * Validate webhook signature with timing-safe comparison
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require('crypto');
    
    // Parse signature header
    const elements = signature.split(',');
    const signatureElements: { [key: string]: string } = {};
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      signatureElements[key] = value;
    }

    if (!signatureElements.t || !signatureElements.v1) {
      return false;
    }

    const timestamp = signatureElements.t;
    const expectedSignature = signatureElements.v1;

    // Check timestamp (reject old requests)
    const timestampMs = parseInt(timestamp) * 1000;
    const now = Date.now();
    const tolerance = 300000; // 5 minutes
    
    if (Math.abs(now - timestampMs) > tolerance) {
      console.warn('Webhook timestamp too old or too far in future');
      return false;
    }

    // Create expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

/**
 * Security headers for webhook responses
 */
export function getSecurityHeaders(): { [key: string]: string } {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache'
  };
}

/**
 * Log security events for monitoring
 */
export function logSecurityEvent(
  event: string,
  details: { [key: string]: any },
  severity: 'low' | 'medium' | 'high' = 'medium'
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    source: 'webhook-security'
  };

  if (severity === 'high') {
    console.error('SECURITY ALERT:', JSON.stringify(logEntry));
  } else {
    console.warn('Security event:', JSON.stringify(logEntry));
  }

  // TODO: Send to monitoring service (DataDog, Sentry, etc.)
}

/**
 * Webhook request validator
 */
export function validateWebhookRequest(request: Request): {
  isValid: boolean;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
} {
  try {
    const ip = getClientIP(request);
    const signature = request.headers.get('stripe-signature');

    // Rate limiting check
    if (!webhookRateLimiter.isAllowed(ip)) {
      logSecurityEvent('rate_limit_exceeded', { ip }, 'medium');
      return {
        isValid: false,
        error: 'Rate limit exceeded',
        rateLimitInfo: {
          remaining: 0,
          resetTime: webhookRateLimiter.getResetTime(ip)
        }
      };
    }

    // Signature check
    if (!signature) {
      logSecurityEvent('missing_signature', { ip }, 'high');
      return {
        isValid: false,
        error: 'Missing webhook signature'
      };
    }

    // IP validation (optional, disabled by default as Stripe IPs can change)
    // if (!validateWebhookIP(ip)) {
    //   logSecurityEvent('invalid_ip', { ip }, 'high');
    //   return {
    //     isValid: false,
    //     error: 'Invalid source IP'
    //   };
    // }

    return {
      isValid: true,
      rateLimitInfo: {
        remaining: webhookRateLimiter.getRemainingRequests(ip),
        resetTime: webhookRateLimiter.getResetTime(ip)
      }
    };
  } catch (error) {
    logSecurityEvent('validation_error', { error: error.message }, 'high');
    return {
      isValid: false,
      error: 'Security validation failed'
    };
  }
}