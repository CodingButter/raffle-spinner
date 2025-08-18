/**
 * Input and output sanitization utilities
 */

/**
 * Sanitize error messages to avoid leaking sensitive information
 */
export function sanitizeErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Common patterns to sanitize
  const sensitivePatterns = [
    /connection refused/i,
    /ECONNREFUSED/,
    /database/i,
    /sql/i,
    /postgres/i,
    /directus/i,
    /stripe/i,
    /api key/i,
    /secret/i,
    /password/i,
    /token/i,
    /\/[\w-]+\/[\w-]+\//g, // File paths
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, // IP addresses
  ];

  // Check for sensitive information
  for (const pattern of sensitivePatterns) {
    if (pattern.test(errorMessage)) {
      // Return generic error for sensitive cases
      if (errorMessage.toLowerCase().includes('credentials')) {
        return 'Invalid credentials';
      }
      if (errorMessage.toLowerCase().includes('not found')) {
        return 'Resource not found';
      }
      if (errorMessage.toLowerCase().includes('unauthorized')) {
        return 'Unauthorized access';
      }
      return 'An error occurred';
    }
  }

  // Truncate long error messages
  if (errorMessage.length > 100) {
    return 'An error occurred';
  }

  return errorMessage;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToSanitize: string[] = []
): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (fieldsToSanitize.includes(key) || fieldsToSanitize.length === 0) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitizeInput(sanitized[key]) as T[Extract<keyof T, string>];
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeObject(sanitized[key], fieldsToSanitize);
      }
    }
  }

  return sanitized;
}

/**
 * Remove sensitive fields from objects
 */
export function removeSensitiveFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'api_key', 'credit_card']
): Partial<T> {
  const cleaned = { ...obj };

  for (const field of sensitiveFields) {
    delete cleaned[field];
  }

  return cleaned;
}

/**
 * Mask sensitive values for logging
 */
export function maskSensitiveValue(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) {
    return '***';
  }

  const visible = value.slice(0, visibleChars);
  const masked = '*'.repeat(Math.min(value.length - visibleChars, 20));
  return `${visible}${masked}`;
}
