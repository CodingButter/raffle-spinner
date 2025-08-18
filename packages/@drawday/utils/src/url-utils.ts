/**
 * URL Generation Utilities
 *
 * Centralized URL generation for DrawDay platform integration
 * Handles environment detection and auto-login token generation
 *
 * Performance optimized: Pre-computed environment URLs to avoid
 * repeated environment checks in hot paths.
 */

// Environment-based base URL detection (cached for performance)
const BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'www.drawday.app'
    ? 'https://www.drawday.app'
    : 'http://localhost:3000';

export interface AutoLoginOptions {
  /** Access token for authentication */
  accessToken: string;
  /** URL to redirect to after login */
  returnUrl: string;
}

/**
 * Generates an auto-login URL for seamless extension-to-website authentication
 *
 * @param options - Auto-login configuration
 * @returns Complete auto-login URL
 */
export function createAutoLoginUrl({ accessToken, returnUrl }: AutoLoginOptions): string {
  return `${BASE_URL}/api/auth/auto-login?token=${accessToken}&returnUrl=${encodeURIComponent(returnUrl)}`;
}

/**
 * Creates dashboard URL with auto-login
 *
 * @param accessToken - User's access token
 * @returns Dashboard auto-login URL
 */
export function createDashboardUrl(accessToken: string): string {
  return createAutoLoginUrl({
    accessToken,
    returnUrl: '/dashboard',
  });
}

/**
 * Creates subscription upgrade URL with auto-login
 *
 * @param accessToken - User's access token
 * @returns Subscription upgrade auto-login URL
 */
export function createUpgradeUrl(accessToken: string): string {
  return createAutoLoginUrl({
    accessToken,
    returnUrl: '/dashboard/subscription/spinner',
  });
}

/**
 * Opens URL in new tab (Chrome Extension safe)
 *
 * @param url - URL to open
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank');
}
