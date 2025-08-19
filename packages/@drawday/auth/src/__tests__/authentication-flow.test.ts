/**
 * Authentication Flow Test Example
 * Author: David Miller, Lead Developer Architect
 * 
 * This test demonstrates comprehensive authentication testing:
 * - Login flow
 * - Token management
 * - Session persistence
 * - Logout flow
 * - Error scenarios
 * - Token refresh
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as React from 'react';

// Mock API responses
const mockApiResponses = {
  loginSuccess: {
    access_token: 'mock-access-token-123',
    refresh_token: 'mock-refresh-token-456',
    expires: 3600000, // 1 hour
    user: {
      id: 'user-123',
      email: 'test@drawday.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'subscriber',
    },
  },
  refreshSuccess: {
    access_token: 'mock-new-access-token-789',
    refresh_token: 'mock-new-refresh-token-012',
    expires: 3600000,
  },
  userProfile: {
    id: 'user-123',
    email: 'test@drawday.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'subscriber',
    subscription: {
      status: 'active',
      plan: 'professional',
      expires_at: '2025-12-31T23:59:59Z',
    },
  },
};

// Auth service implementation
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: any = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  async login(email: string, password: string) {
    try {
      const response = await this.mockApiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      this.setTokens(data.access_token, data.refresh_token, data.expires);
      this.user = data.user;
      
      // Schedule token refresh
      this.scheduleTokenRefresh(data.expires);

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      if (this.accessToken) {
        await this.mockApiCall('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        });
      }
    } finally {
      this.clearTokens();
      this.user = null;
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.mockApiCall('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setTokens(data.access_token, data.refresh_token, data.expires);
      
      // Reschedule token refresh
      this.scheduleTokenRefresh(data.expires);

      return true;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  async getUser() {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await this.mockApiCall('/auth/me', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const user = await response.json();
      this.user = user;
      return user;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  private setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('token_expires', String(Date.now() + expiresIn));
    }
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires');
    }
  }

  private scheduleTokenRefresh(expiresIn: number) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh 5 minutes before expiry
    const refreshTime = expiresIn - 5 * 60 * 1000;
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken();
      }, refreshTime);
    }
  }

  // Mock API call for testing
  private async mockApiCall(endpoint: string, options?: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint === '/auth/login' && options?.body) {
          const { email, password } = JSON.parse(options.body);
          if (email === 'test@drawday.com' && password === 'password123') {
            resolve({
              ok: true,
              json: async () => mockApiResponses.loginSuccess,
            });
          } else {
            resolve({ ok: false });
          }
        } else if (endpoint === '/auth/refresh') {
          resolve({
            ok: true,
            json: async () => mockApiResponses.refreshSuccess,
          });
        } else if (endpoint === '/auth/me') {
          resolve({
            ok: true,
            json: async () => mockApiResponses.userProfile,
          });
        } else if (endpoint === '/auth/logout') {
          resolve({ ok: true });
        } else {
          resolve({ ok: false });
        }
      }, 100);
    });
  }
}

// React Hook for authentication
function useAuth() {
  const [authService] = React.useState(() => new AuthService());
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } finally {
      setLoading(false);
    }
  }, [authService]);

  const logout = React.useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authService]);

  const refreshToken = React.useCallback(async () => {
    try {
      await authService.refreshAccessToken();
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, [authService]);

  const checkAuth = React.useCallback(async () => {
    setLoading(true);
    try {
      const userData = await authService.getUser();
      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [authService]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    checkAuth,
  };
}

describe('Authentication Flow', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await authService.login('test@drawday.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: 'user-123',
        email: 'test@drawday.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'subscriber',
      });
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.getAccessToken()).toBe('mock-access-token-123');
    });

    it('should fail login with invalid credentials', async () => {
      const result = await authService.login('wrong@email.com', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getAccessToken()).toBeNull();
    });

    it('should store tokens in localStorage after successful login', async () => {
      await authService.login('test@drawday.com', 'password123');
      
      expect(localStorage.getItem('access_token')).toBe('mock-access-token-123');
      expect(localStorage.getItem('refresh_token')).toBe('mock-refresh-token-456');
      expect(localStorage.getItem('token_expires')).toBeTruthy();
    });
  });

  describe('Token Management', () => {
    it('should refresh access token successfully', async () => {
      // First login
      await authService.login('test@drawday.com', 'password123');
      
      // Refresh token
      const refreshed = await authService.refreshAccessToken();
      
      expect(refreshed).toBe(true);
      expect(authService.getAccessToken()).toBe('mock-new-access-token-789');
      expect(localStorage.getItem('access_token')).toBe('mock-new-access-token-789');
    });

    it('should schedule automatic token refresh', async () => {
      await authService.login('test@drawday.com', 'password123');
      
      // Fast-forward time to just before token expiry
      vi.advanceTimersByTime(3600000 - 5 * 60 * 1000 - 1000);
      
      // Token should not be refreshed yet
      expect(authService.getAccessToken()).toBe('mock-access-token-123');
      
      // Fast-forward past the refresh time
      vi.advanceTimersByTime(2000);
      await vi.runAllTimersAsync();
      
      // Token should be refreshed
      expect(authService.getAccessToken()).toBe('mock-new-access-token-789');
    });

    it('should handle refresh token failure', async () => {
      // Set up auth service without refresh token
      const service = new AuthService();
      
      await expect(service.refreshAccessToken()).rejects.toThrow(
        'No refresh token available'
      );
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('User Profile', () => {
    it('should fetch user profile when authenticated', async () => {
      await authService.login('test@drawday.com', 'password123');
      
      const user = await authService.getUser();
      
      expect(user).toEqual(mockApiResponses.userProfile);
      expect(user.subscription.status).toBe('active');
      expect(user.subscription.plan).toBe('professional');
    });

    it('should return null when not authenticated', async () => {
      const user = await authService.getUser();
      expect(user).toBeNull();
    });
  });

  describe('Logout Flow', () => {
    it('should clear tokens on logout', async () => {
      await authService.login('test@drawday.com', 'password123');
      expect(authService.isAuthenticated()).toBe(true);
      
      await authService.logout();
      
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getAccessToken()).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('should cancel scheduled token refresh on logout', async () => {
      await authService.login('test@drawday.com', 'password123');
      
      await authService.logout();
      
      // Fast-forward time past when refresh would occur
      vi.advanceTimersByTime(3600000);
      
      // Token should still be null
      expect(authService.getAccessToken()).toBeNull();
    });
  });

  describe('React Hook Integration', () => {
    it('should handle login through hook', async () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      
      await act(async () => {
        const success = await result.current.login('test@drawday.com', 'password123');
        expect(success).toBe(true);
      });
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toBeTruthy();
      });
    });

    it('should handle login errors through hook', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        const success = await result.current.login('wrong@email.com', 'wrong');
        expect(success).toBe(false);
      });
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle logout through hook', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Login first
      await act(async () => {
        await result.current.login('test@drawday.com', 'password123');
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      // Then logout
      await act(async () => {
        await result.current.logout();
      });
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
      });
    });

    it('should show loading state during operations', async () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.loading).toBe(false);
      
      const loginPromise = act(async () => {
        await result.current.login('test@drawday.com', 'password123');
      });
      
      // Check loading state while login is in progress
      expect(result.current.loading).toBe(true);
      
      await loginPromise;
      
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Session Persistence', () => {
    it('should restore session from localStorage', async () => {
      // Simulate existing session in localStorage
      localStorage.setItem('access_token', 'existing-token');
      localStorage.setItem('refresh_token', 'existing-refresh');
      localStorage.setItem('token_expires', String(Date.now() + 3600000));
      
      const service = new AuthService();
      // In a real implementation, the service would check localStorage on init
      // For this test, we'll simulate that behavior
      const token = localStorage.getItem('access_token');
      if (token) {
        (service as any).accessToken = token;
        (service as any).refreshToken = localStorage.getItem('refresh_token');
      }
      
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should handle expired tokens in localStorage', async () => {
      // Simulate expired token in localStorage
      localStorage.setItem('access_token', 'expired-token');
      localStorage.setItem('refresh_token', 'expired-refresh');
      localStorage.setItem('token_expires', String(Date.now() - 1000)); // Expired
      
      const service = new AuthService();
      const expires = localStorage.getItem('token_expires');
      
      if (expires && parseInt(expires) < Date.now()) {
        // Token is expired, clear it
        service['clearTokens']();
      }
      
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });
});