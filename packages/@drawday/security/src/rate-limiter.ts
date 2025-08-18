/**
 * Rate limiting utilities
 * For production, use Redis or similar persistent store
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
}

/**
 * In-memory rate limiter (use Redis in production)
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private config: RateLimitConfig) {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request should be rate limited
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const key = this.config.keyGenerator?.(identifier) || identifier;
    const entry = this.store.get(key);

    // No entry or expired window
    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return false;
    }

    // Within window
    if (entry.count >= this.config.max) {
      return true;
    }

    entry.count++;
    return false;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const key = this.config.keyGenerator?.(identifier) || identifier;
    const entry = this.store.get(key);

    if (!entry || Date.now() > entry.resetTime) {
      return this.config.max;
    }

    return Math.max(0, this.config.max - entry.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const key = this.config.keyGenerator?.(identifier) || identifier;
    const entry = this.store.get(key);

    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.config.windowMs;
    }

    return entry.resetTime;
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator?.(identifier) || identifier;
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.store.entries());
    for (const [key, entry] of entries) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy the rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

/**
 * Create rate limiters for different endpoints
 */
export function createRateLimiters() {
  return {
    login: new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many login attempts, please try again later',
    }),

    register: new RateLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
      message: 'Too many registration attempts, please try again later',
    }),

    api: new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 60,
      message: 'Too many requests, please slow down',
    }),

    stripe: new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 10,
      message: 'Too many payment requests, please try again',
    }),
  };
}
