/**
 * Enhanced Authentication module for Directus Admin operations
 * Implements retry logic, proper error handling, and token refresh
 */

interface TokenCache {
  token: string;
  expires: number;
  refreshToken?: string;
}

export class DirectusAuth {
  private directusUrl: string;
  private adminEmail: string | undefined;
  private adminPassword: string | undefined;
  private tokenCache: TokenCache | null = null;
  private authInProgress: Promise<string> | null = null;

  constructor() {
    this.directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.drawday.app';
    this.adminEmail = process.env.DIRECTUS_ADMIN_EMAIL;
    this.adminPassword = process.env.DIRECTUS_ADMIN_PASSWORD;

    if (!this.adminEmail || !this.adminPassword) {
      console.warn('Directus admin credentials not configured');
    }
  }

  /**
   * Get valid authentication token with automatic refresh
   * Implements single-flight pattern to prevent concurrent auth requests
   */
  async getToken(): Promise<string> {
    // Return in-progress authentication to prevent concurrent requests
    if (this.authInProgress) {
      return this.authInProgress;
    }

    // Check cached token (with 1-minute buffer)
    if (this.tokenCache && this.tokenCache.expires > Date.now() + 60000) {
      return this.tokenCache.token;
    }

    // Attempt refresh if we have a refresh token
    if (this.tokenCache?.refreshToken && this.tokenCache.expires > Date.now()) {
      try {
        return await this.refreshToken();
      } catch (error) {
        console.warn('Token refresh failed, falling back to login:', error);
        this.clearTokenCache();
      }
    }

    // Perform new authentication
    this.authInProgress = this.authenticate();
    try {
      const token = await this.authInProgress;
      return token;
    } finally {
      this.authInProgress = null;
    }
  }

  /**
   * Perform authentication with retry logic
   */
  private async authenticate(): Promise<string> {
    if (!this.adminEmail || !this.adminPassword) {
      throw new Error('Directus admin credentials not configured');
    }

    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.directusUrl}/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'DrawDay-Webhook-Handler/1.0'
          },
          body: JSON.stringify({
            email: this.adminEmail,
            password: this.adminPassword,
          }),
          // Add timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
        }

        const { data } = await response.json();
        
        if (!data?.access_token) {
          throw new Error('Invalid response: missing access token');
        }

        // Cache token for 14 minutes (tokens typically expire in 15 minutes)
        this.tokenCache = {
          token: data.access_token,
          expires: Date.now() + 14 * 60 * 1000,
          refreshToken: data.refresh_token,
        };

        console.log(`Directus authentication successful (attempt ${attempt})`);
        return data.access_token;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Authentication attempt ${attempt} failed:`, lastError.message);

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('All authentication attempts failed');
    throw lastError!;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string> {
    if (!this.tokenCache?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.directusUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'DrawDay-Webhook-Handler/1.0'
      },
      body: JSON.stringify({
        refresh_token: this.tokenCache.refreshToken,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const { data } = await response.json();
    
    if (!data?.access_token) {
      throw new Error('Invalid refresh response: missing access token');
    }

    // Update cached token
    this.tokenCache = {
      token: data.access_token,
      expires: Date.now() + 14 * 60 * 1000,
      refreshToken: data.refresh_token || this.tokenCache.refreshToken,
    };

    console.log('Directus token refreshed successfully');
    return data.access_token;
  }

  /**
   * Clear cached authentication data
   */
  clearTokenCache(): void {
    this.tokenCache = null;
    this.authInProgress = null;
  }

  /**
   * Check if credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.adminEmail && this.adminPassword);
  }

  /**
   * Get Directus URL
   */
  getDirectusUrl(): string {
    return this.directusUrl;
  }

  /**
   * Test authentication without caching
   */
  async testAuthentication(): Promise<boolean> {
    try {
      const originalCache = this.tokenCache;
      this.tokenCache = null; // Force new authentication
      
      await this.getToken();
      
      this.tokenCache = originalCache; // Restore cache
      return true;
    } catch (error) {
      console.error('Authentication test failed:', error);
      return false;
    }
  }
}
