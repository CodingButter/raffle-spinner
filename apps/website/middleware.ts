import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting map (in-memory for now, should use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Generate nonce for CSP using Web Crypto API (Edge Runtime compatible)
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
}

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = {
  '/api/auth/login': 5,
  '/api/auth/register': 3,
  '/api/auth/refresh': 10,
  '/api/stripe-webhook': 100,
  default: 30,
};

function getRateLimitMax(pathname: string): number {
  for (const [path, limit] of Object.entries(RATE_LIMIT_MAX_REQUESTS)) {
    if (pathname.startsWith(path)) {
      return limit;
    }
  }
  return RATE_LIMIT_MAX_REQUESTS.default;
}

function checkRateLimit(identifier: string, pathname: string): boolean {
  const now = Date.now();
  const limit = getRateLimitMax(pathname);

  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}

export function middleware(request: NextRequest) {
  // Check for emergency CSP bypass (only in development)
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_CSP === 'true') {
    return NextResponse.next();
  }

  const nonce = generateNonce();
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Pass nonce to the application
  response.headers.set('x-nonce', nonce);

  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${identifier}:${request.nextUrl.pathname}`;

    if (!checkRateLimit(rateLimitKey, request.nextUrl.pathname)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(getRateLimitMax(request.nextUrl.pathname)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + RATE_LIMIT_WINDOW),
        },
      });
    }
  }

  // Content Security Policy with enhanced security
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // More restrictive CSP for production
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' ${isDevelopment ? "'unsafe-eval'" : ''} https://js.stripe.com https://checkout.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://checkout.stripe.com;
    frame-ancestors 'none';
    frame-src 'self' https://js.stripe.com https://checkout.stripe.com;
    connect-src 'self' https://api.stripe.com https://checkout.stripe.com ${directusUrl} ${isDevelopment ? 'http://localhost:* ws://localhost:*' : ''};
    worker-src 'self' blob:;
    manifest-src 'self';
    ${!isDevelopment ? 'upgrade-insecure-requests;' : ''}
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Enhanced Security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Report CSP violations in production
  if (!isDevelopment) {
    response.headers.set(
      'Content-Security-Policy-Report-Only',
      cspHeader.replace(
        'upgrade-insecure-requests;',
        `report-uri /api/csp-report; upgrade-insecure-requests;`
      )
    );
  }

  // Enhanced CORS configuration for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Strict origin validation
    const productionOrigins = ['https://www.drawday.app', 'https://drawday.app'];

    const developmentOrigins = ['http://localhost:3000', 'http://localhost:3001'];

    const allowedOrigins = isDevelopment
      ? [...productionOrigins, ...developmentOrigins]
      : productionOrigins;

    // Validate Chrome extension with specific ID or allow all chrome-extension origins in development
    const chromeExtensionId = process.env.CHROME_EXTENSION_ID;
    const isChromeExtension =
      (chromeExtensionId && origin === `chrome-extension://${chromeExtensionId}`) ||
      (isDevelopment && origin?.startsWith('chrome-extension://'));

    // Check if origin is allowed
    const isAllowed = origin && (allowedOrigins.includes(origin) || isChromeExtension);

    if (isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    } else if (origin) {
      // Log unauthorized origin attempts in production
      if (!isDevelopment) {
        console.warn(`Unauthorized CORS attempt from origin: ${origin}`);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
