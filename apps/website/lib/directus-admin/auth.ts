/**
 * Authentication module for Directus Admin operations
 */

export class DirectusAuth {
  private directusUrl: string;
  private adminEmail: string | undefined;
  private adminPassword: string | undefined;
  private tokenCache: { token: string; expires: number } | null = null;

  constructor() {
    this.directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://admin.drawday.app';
    this.adminEmail = process.env.DIRECTUS_ADMIN_EMAIL;
    this.adminPassword = process.env.DIRECTUS_ADMIN_PASSWORD;

    if (!this.adminEmail || !this.adminPassword) {
      console.warn('Directus admin credentials not configured');
    }
  }

  async getToken(): Promise<string> {
    // Check cached token
    if (this.tokenCache && this.tokenCache.expires > Date.now()) {
      return this.tokenCache.token;
    }

    if (!this.adminEmail || !this.adminPassword) {
      throw new Error('Directus admin credentials not configured');
    }

    try {
      const response = await fetch(`${this.directusUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.adminEmail,
          password: this.adminPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const { data } = await response.json();

      // Cache token for 14 minutes (tokens typically expire in 15 minutes)
      this.tokenCache = {
        token: data.access_token,
        expires: Date.now() + 14 * 60 * 1000,
      };

      return data.access_token;
    } catch (error) {
      console.error('Failed to authenticate with Directus:', error);
      throw error;
    }
  }

  getDirectusUrl(): string {
    return this.directusUrl;
  }
}
