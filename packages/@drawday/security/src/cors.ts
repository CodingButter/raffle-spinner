/**
 * CORS configuration utilities
 */

export interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const DEFAULT_ALLOWED_HEADERS = ['Content-Type', 'Authorization'];

/**
 * Check if an origin is allowed based on patterns
 */
export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some(allowed => {
    // Exact match
    if (allowed === origin) return true;
    
    // Wildcard match for Chrome extensions
    if (allowed.includes('*')) {
      const pattern = allowed
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
        .replace(/\*/g, '.*'); // Replace * with .*
      return new RegExp(`^${pattern}$`).test(origin);
    }
    
    return false;
  });
}

/**
 * Get CORS headers based on configuration
 */
export function getCORSHeaders(
  origin: string | null,
  config: CORSConfig
): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (!origin) return headers;
  
  if (isOriginAllowed(origin, config.allowedOrigins)) {
    headers['Access-Control-Allow-Origin'] = origin;
    
    if (config.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    if (config.allowedMethods) {
      headers['Access-Control-Allow-Methods'] = config.allowedMethods.join(', ');
    } else {
      headers['Access-Control-Allow-Methods'] = DEFAULT_ALLOWED_METHODS.join(', ');
    }
    
    if (config.allowedHeaders) {
      headers['Access-Control-Allow-Headers'] = config.allowedHeaders.join(', ');
    } else {
      headers['Access-Control-Allow-Headers'] = DEFAULT_ALLOWED_HEADERS.join(', ');
    }
    
    if (config.maxAge) {
      headers['Access-Control-Max-Age'] = String(config.maxAge);
    }
  }
  
  return headers;
}

/**
 * Default CORS configuration for DrawDay
 */
export function getDefaultCORSConfig(): CORSConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const allowedOrigins = [
    'https://www.drawday.app',
    'https://drawday.app',
    'chrome-extension://*', // All Chrome extensions
  ];
  
  if (isDevelopment) {
    allowedOrigins.push('http://localhost:3000');
    allowedOrigins.push('http://localhost:3001');
  }
  
  return {
    allowedOrigins,
    allowedMethods: DEFAULT_ALLOWED_METHODS,
    allowedHeaders: DEFAULT_ALLOWED_HEADERS,
    credentials: true,
    maxAge: 86400, // 24 hours
  };
}