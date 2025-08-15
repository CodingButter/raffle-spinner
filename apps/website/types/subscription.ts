import { ProductKey } from '@/lib/stripe';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export type UpgradeType = 'immediate' | 'end_of_period';

export type ChangeType = 'upgrade' | 'downgrade' | 'same';

export interface SubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  tier: ProductKey;
  current_period_end: number;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
  stripe_subscription_id: string;
}

export interface PlanChangeRequest {
  subscriptionId: string;
  newProductKey: ProductKey;
  upgradeType: UpgradeType;
  userId?: string;
  userEmail?: string;
}

export interface PlanChangeResponse {
  success: boolean;
  subscription: {
    id: string;
    status: SubscriptionStatus;
    current_period_end: number;
    plan: ProductKey;
  };
  change_type: ChangeType;
  effective: UpgradeType;
  proration?: {
    amount: number;
    currency: string;
    description: string;
  };
  message: string;
}

export interface SubscriptionValidation {
  isValid: boolean;
  changeType: ChangeType;
  reason?: string;
  restrictions?: string[];
}

export interface ProrationEstimate {
  amount: number;
  currency: string;
  description: string;
  daysRemaining: number;
}

export interface AuditLogEntry {
  user_email: string;
  action: 'subscription_plan_change' | 'subscription_created' | 'subscription_canceled';
  details: {
    subscription_id: string;
    change_type?: string;
    new_tier?: string;
    change_timestamp?: string;
    scheduled_change?: boolean;
    [key: string]: any;
  };
  timestamp: string;
}

export interface SubscriptionFeatureLimits {
  maxParticipants: number;
  customBranding: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
}

export interface SubscriptionUsage {
  current_period_start: number;
  current_period_end: number;
  raffle_count: number;
  participant_count: number;
  storage_used: number; // in MB
}

export interface PlanComparison {
  currentPlan: ProductKey;
  targetPlan: ProductKey;
  priceDifference: number;
  featureChanges: {
    added: string[];
    removed: string[];
    changed: string[];
  };
  validation: SubscriptionValidation;
}

// Utility type for Stripe webhook events
export interface StripeSubscriptionEvent {
  id: string;
  object: 'subscription';
  customer: string;
  status: SubscriptionStatus;
  current_period_end: number;
  current_period_start: number;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
      };
    }>;
  };
  metadata: Record<string, string>;
  cancel_at_period_end: boolean;
}

// Error types for better error handling
export class SubscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export class PaymentError extends SubscriptionError {
  constructor(message: string) {
    super(message, 'PAYMENT_ERROR', 402);
  }
}

export class ValidationError extends SubscriptionError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends SubscriptionError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}
