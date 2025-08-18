import { User, AuthTokens, LoginCredentials, RegisterData, Subscription } from '../types';

export class AuthService {
  private baseUrl: string;
  private tokenKey = 'auth_tokens';
  private userKey = 'auth_user';

  constructor(baseUrl?: string) {
    // Detect if running in Chrome extension
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    // Detect if running in Next.js app
    const isNextJS = typeof window !== 'undefined' && window.location?.protocol && !isExtension;

    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (isExtension) {
      // Use website API as proxy for extension
      this.baseUrl = 'https://www.drawday.app/api';
    } else if (isNextJS) {
      // Use local API proxy for website to ensure subscription transformation
      this.baseUrl = `${window.location.origin}/api`;
    } else {
      // Direct Directus URL for server-side
      this.baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const isProxyUrl = this.baseUrl.includes('/api');
    const loginPath = isProxyUrl ? '/auth/login' : '/auth/login';

    const response = await fetch(`${this.baseUrl}${loginPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.message || 'Login failed');
    }

    const data = await response.json();
    const tokens: AuthTokens = {
      access_token: data.data.access_token,
      refresh_token: data.data.refresh_token,
      expires: data.data.expires,
    };

    // Get user details
    const user = await this.getCurrentUser(tokens.access_token);

    // Store in localStorage for persistence
    this.storeTokens(tokens);
    this.storeUser(user);

    return { user, tokens };
  }

  /**
   * Logout and clear stored data
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const isProxyUrl = this.baseUrl.includes('/api');
        const logoutPath = isProxyUrl ? '/auth/logout' : '/auth/logout';

        await fetch(`${this.baseUrl}${logoutPath}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // Ignore logout errors
      }
    }

    this.clearStorage();
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        role: 'user', // Default role
        status: 'active',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.message || 'Registration failed');
    }

    // Auto-login after registration
    return this.login({
      email: data.email,
      password: data.password,
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const isProxyUrl = this.baseUrl.includes('/api');
    const refreshPath = isProxyUrl ? '/auth/refresh' : '/auth/refresh';

    const response = await fetch(`${this.baseUrl}${refreshPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const tokens: AuthTokens = {
      access_token: data.data.access_token,
      refresh_token: data.data.refresh_token,
      expires: data.data.expires,
    };

    this.storeTokens(tokens);
    return tokens;
  }

  /**
   * Get current user details (includes subscriptions when using proxy)
   */
  async getCurrentUser(accessToken: string): Promise<User> {
    const isProxyUrl = this.baseUrl.includes('/api');
    const mePath = isProxyUrl ? '/auth/me' : '/users/me';

    const response = await fetch(`${this.baseUrl}${mePath}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<User>, accessToken: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const data = await response.json();
    const user = data.data;
    this.storeUser(user);
    return user;
  }

  /**
   * Get user subscription
   */
  async getSubscription(accessToken: string): Promise<Subscription | null> {
    // The subscription endpoint now uses the auth token to determine the user
    const response = await fetch(`${this.baseUrl}/items/subscriptions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data?.[0] || null;
  }

  // Storage helpers
  storeTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, JSON.stringify(tokens));
    }
  }

  storeUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getStoredTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(this.tokenKey);
    return stored ? JSON.parse(stored) : null;
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(this.userKey);
    return stored ? JSON.parse(stored) : null;
  }

  clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  isTokenExpired(expires: number): boolean {
    return Date.now() >= expires;
  }
}

// Export singleton instance
export const authService = new AuthService();
