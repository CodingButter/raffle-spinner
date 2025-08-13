import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  SignupData, 
  ResetPasswordRequest,
  ResetPasswordConfirm,
  Subscription,
  AuthConfig,
  AuthState
} from './types';
import { MOCK_USERS, MOCK_SUBSCRIPTIONS, generateMockTokens } from './mock-data';

const STORAGE_KEYS = {
  USER: 'drawday_user',
  TOKENS: 'drawday_tokens',
  SUBSCRIPTIONS: 'drawday_subscriptions',
};

export class AuthClient {
  private config: AuthConfig;
  private refreshTimer?: NodeJS.Timeout;
  
  constructor(config: Partial<AuthConfig> = {}) {
    this.config = {
      apiUrl: config.apiUrl || process.env.NEXT_PUBLIC_API_URL || '',
      environment: config.environment || 'development',
      persistSession: config.persistSession !== false,
      tokenRefreshThreshold: config.tokenRefreshThreshold || 300, // 5 minutes
      mockMode: config.mockMode !== false || !config.apiUrl,
    };
  }

  // Initialize auth state from storage
  async initialize(): Promise<AuthState> {
    if (!this.config.persistSession) {
      return this.getEmptyState();
    }

    try {
      const user = this.getStoredUser();
      const tokens = this.getStoredTokens();
      const subscriptions = this.getStoredSubscriptions();

      if (user && tokens) {
        // Check if token is still valid
        if (this.isTokenExpired(tokens.accessToken)) {
          // Try to refresh
          try {
            const newTokens = await this.refreshToken(tokens.refreshToken);
            this.startTokenRefreshTimer(newTokens);
            return {
              user,
              tokens: newTokens,
              subscriptions,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            };
          } catch {
            // Refresh failed, clear storage
            this.clearStorage();
            return this.getEmptyState();
          }
        }

        this.startTokenRefreshTimer(tokens);
        return {
          user,
          tokens,
          subscriptions,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }

    return this.getEmptyState();
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthState> {
    if (this.config.mockMode) {
      return this.mockLogin(credentials);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      return this.handleAuthSuccess(data.user, data.tokens, data.subscriptions);
    } catch (error) {
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  // Signup
  async signup(data: SignupData): Promise<AuthState> {
    if (this.config.mockMode) {
      return this.mockSignup(data);
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const result = await response.json();
      return this.handleAuthSuccess(result.user, result.tokens, []);
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  }

  // Logout
  async logout(): Promise<void> {
    this.stopTokenRefreshTimer();
    
    if (!this.config.mockMode && this.config.apiUrl) {
      const tokens = this.getStoredTokens();
      if (tokens) {
        try {
          await fetch(`${this.config.apiUrl}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`,
            },
          });
        } catch {
          // Ignore logout errors
        }
      }
    }
    
    this.clearStorage();
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (this.config.mockMode) {
      const user = this.getStoredUser();
      if (user) {
        return generateMockTokens(user.id);
      }
      throw new Error('No user found');
    }

    const response = await fetch(`${this.config.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const tokens = await response.json();
    this.storeTokens(tokens);
    return tokens;
  }

  // Request password reset
  async requestPasswordReset(data: ResetPasswordRequest): Promise<void> {
    if (this.config.mockMode) {
      // In mock mode, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    const response = await fetch(`${this.config.apiUrl}/auth/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send reset email');
    }
  }

  // Confirm password reset
  async confirmPasswordReset(data: ResetPasswordConfirm): Promise<void> {
    if (this.config.mockMode) {
      // In mock mode, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
    }

    const response = await fetch(`${this.config.apiUrl}/auth/password-reset/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to reset password');
    }
  }

  // Get user subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    const user = this.getStoredUser();
    if (!user) {
      return [];
    }

    if (this.config.mockMode) {
      return MOCK_SUBSCRIPTIONS[user.id] || [];
    }

    const tokens = this.getStoredTokens();
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.config.apiUrl}/subscriptions`, {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }

    const subscriptions = await response.json();
    this.storeSubscriptions(subscriptions);
    return subscriptions;
  }

  // Check if user has access to a product
  hasAccess(product: string): boolean {
    const user = this.getStoredUser();
    const subscriptions = this.getStoredSubscriptions();

    if (!user) return false;
    
    // Admins have access to everything
    if (user.role === 'admin') return true;
    
    // Check if user has an active subscription for the product
    return subscriptions.some(sub => 
      (sub.product === product || sub.product === 'all_access') && 
      sub.status === 'active'
    );
  }

  // Check if user is pro
  isPro(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'pro' || user?.role === 'admin';
  }

  // Private helper methods
  private mockLogin(credentials: LoginCredentials): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser = MOCK_USERS[credentials.email];
        
        if (!mockUser || mockUser.password !== credentials.password) {
          reject(new Error('Invalid email or password'));
          return;
        }

        const tokens = generateMockTokens(mockUser.user.id);
        const subscriptions = MOCK_SUBSCRIPTIONS[mockUser.user.id] || [];
        
        resolve(this.handleAuthSuccess(mockUser.user, tokens, subscriptions));
      }, 1000); // Simulate network delay
    });
  }

  private mockSignup(data: SignupData): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        if (MOCK_USERS[data.email]) {
          reject(new Error('Email already registered'));
          return;
        }

        // Create new user
        const newUser: User = {
          id: `usr_${Date.now()}`,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: false,
          companyName: data.companyName,
        };

        const tokens = generateMockTokens(newUser.id);
        
        // Add to mock users for this session
        MOCK_USERS[data.email] = {
          password: data.password,
          user: newUser,
        };
        MOCK_SUBSCRIPTIONS[newUser.id] = [];

        resolve(this.handleAuthSuccess(newUser, tokens, []));
      }, 1000);
    });
  }

  private handleAuthSuccess(user: User, tokens: AuthTokens, subscriptions: Subscription[]): AuthState {
    if (this.config.persistSession) {
      this.storeUser(user);
      this.storeTokens(tokens);
      this.storeSubscriptions(subscriptions);
    }

    this.startTokenRefreshTimer(tokens);

    return {
      user,
      tokens,
      subscriptions,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
  }

  private startTokenRefreshTimer(tokens: AuthTokens) {
    this.stopTokenRefreshTimer();

    const refreshTime = (tokens.expiresIn - this.config.tokenRefreshThreshold) * 1000;
    
    this.refreshTimer = setTimeout(async () => {
      try {
        const newTokens = await this.refreshToken(tokens.refreshToken);
        this.startTokenRefreshTimer(newTokens);
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearStorage();
      }
    }, refreshTime);
  }

  private stopTokenRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private getEmptyState(): AuthState {
    return {
      user: null,
      tokens: null,
      subscriptions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  // Storage methods
  private storeUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  }

  private storeTokens(tokens: AuthTokens) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    }
  }

  private getStoredTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
    return stored ? JSON.parse(stored) : null;
  }

  private storeSubscriptions(subscriptions: Subscription[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
    }
  }

  private getStoredSubscriptions(): Subscription[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return stored ? JSON.parse(stored) : [];
  }

  private clearStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKENS);
      localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    }
  }
}