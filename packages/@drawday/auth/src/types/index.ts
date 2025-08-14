export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  role?: string;
  status: 'active' | 'suspended' | 'draft';
  created_at?: string;
  updated_at?: string;
  // Stripe subscription fields
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  subscription_tier?: 'free' | 'starter' | 'professional' | 'enterprise';
  subscription_current_period_end?: string;
  subscription_cancel_at_period_end?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  product: 'drawday';
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_price_id?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}
