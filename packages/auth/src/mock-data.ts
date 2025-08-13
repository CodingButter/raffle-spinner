import { User, Subscription, AuthTokens } from './types';

// Development accounts
export const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'admin@drawday.app': {
    password: 'drawday',
    user: {
      id: 'usr_admin_001',
      email: 'admin@drawday.app',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      emailVerified: true,
      companyName: 'DrawDay Solutions',
    },
  },
  'pro@example.com': {
    password: 'ProUser123!',
    user: {
      id: 'usr_pro_001',
      email: 'pro@example.com',
      firstName: 'Pro',
      lastName: 'User',
      role: 'pro',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      emailVerified: true,
      companyName: 'Example Raffles Ltd',
    },
  },
  'free@example.com': {
    password: 'FreeUser123!',
    user: {
      id: 'usr_free_001',
      email: 'free@example.com',
      firstName: 'Free',
      lastName: 'User',
      role: 'free',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
      emailVerified: true,
    },
  },
};

export const MOCK_SUBSCRIPTIONS: Record<string, Subscription[]> = {
  'usr_admin_001': [
    {
      id: 'sub_admin_all',
      userId: 'usr_admin_001',
      product: 'all_access',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2025-01-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      priceId: 'price_all_access_yearly',
      quantity: 1,
    },
  ],
  'usr_pro_001': [
    {
      id: 'sub_pro_spinner',
      userId: 'usr_pro_001',
      product: 'spinner',
      status: 'active',
      currentPeriodStart: '2024-01-15T00:00:00Z',
      currentPeriodEnd: '2024-02-15T00:00:00Z',
      cancelAtPeriodEnd: false,
      priceId: 'price_spinner_monthly',
      quantity: 1,
    },
  ],
  'usr_free_001': [],
};

export function generateMockTokens(userId: string): AuthTokens {
  // Generate mock JWT tokens
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  };
  
  // In production, these would be real JWTs
  const mockAccessToken = btoa(JSON.stringify(payload));
  const mockRefreshToken = btoa(JSON.stringify({ ...payload, exp: payload.exp + 86400 * 7 })); // 7 days
  
  return {
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
    expiresIn: 3600,
    tokenType: 'Bearer',
  };
}