export type UserRole = 'free' | 'pro' | 'admin';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type Product = 'spinner' | 'streaming' | 'websites' | 'all_access';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  companyName?: string;
  phoneNumber?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  product: Product;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  quantity: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  acceptTerms: boolean;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  subscriptions: Subscription[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  persistSession: boolean;
  tokenRefreshThreshold: number; // seconds before expiry to refresh
  mockMode: boolean; // Enable mock mode for development
}