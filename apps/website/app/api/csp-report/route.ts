import { NextRequest, NextResponse } from 'next/server';

/**
 * CSP Report Endpoint
 * Receives Content Security Policy violation reports from browsers
 * Used to monitor and identify CSP violations in production
 */

interface CSPReport {
  'csp-report': {
    'document-uri': string;
    referrer: string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    disposition: string;
    'blocked-uri': string;
    'line-number'?: number;
    'column-number'?: number;
    'source-file'?: string;
    'status-code': number;
    'script-sample'?: string;
  };
}

// Rate limit CSP reports to prevent abuse
const reportRateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REPORTS_PER_WINDOW = 100;

function checkReportRateLimit(identifier: string): boolean {
  const now = Date.now();
  const count = reportRateLimit.get(identifier) || 0;

  // Clean old entries
  if (count === 0 || now - RATE_LIMIT_WINDOW > count) {
    reportRateLimit.set(identifier, 1);
    return true;
  }

  if (count >= MAX_REPORTS_PER_WINDOW) {
    return false;
  }

  reportRateLimit.set(identifier, count + 1);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client identifier
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    if (!checkReportRateLimit(identifier)) {
      return new NextResponse('Too Many Reports', { status: 429 });
    }

    // Parse CSP report
    const report: CSPReport = await request.json();

    if (!report['csp-report']) {
      return new NextResponse('Invalid Report', { status: 400 });
    }

    const cspReport = report['csp-report'];

    // Log CSP violation (in production, send to monitoring service)
    const logData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      documentUri: cspReport['document-uri'],
      violatedDirective: cspReport['violated-directive'],
      effectiveDirective: cspReport['effective-directive'],
      blockedUri: cspReport['blocked-uri'],
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      scriptSample: cspReport['script-sample'],
      disposition: cspReport.disposition,
      clientIp: identifier,
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.warn('CSP Violation Report:', logData);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with monitoring service (e.g., Sentry, LogRocket)
      // await sendToMonitoring(logData);

      // For now, log critical violations
      if (
        cspReport['violated-directive'].includes('script-src') ||
        cspReport['violated-directive'].includes('connect-src')
      ) {
        console.error('Critical CSP Violation:', logData);
      }
    }

    // Check for known false positives
    const knownFalsePositives = [
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'about:blank',
      'data:',
    ];

    const isFalsePositive = knownFalsePositives.some((pattern) =>
      cspReport['blocked-uri'].startsWith(pattern)
    );

    if (!isFalsePositive) {
      // Alert on new violations (implement alerting logic)
      // await alertOnNewViolation(logData);
    }

    // Return 204 No Content (standard for CSP reports)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
