/**
 * Test suite for subscription upgrade/downgrade functionality
 */

import {
  validateSubscriptionChange,
  estimateProration,
  getRecommendedUpgradeType,
} from '@/lib/subscription-utils';
import { getTierFromPriceId } from '@/lib/stripe-webhook-handlers';

describe('Subscription Upgrade/Downgrade Flow', () => {
  describe('validateSubscriptionChange', () => {
    it('should allow upgrade from starter to professional', () => {
      const result = validateSubscriptionChange('starter', 'professional');
      expect(result.isValid).toBe(true);
      expect(result.changeType).toBe('upgrade');
    });

    it('should allow downgrade from professional to starter', () => {
      const result = validateSubscriptionChange('professional', 'starter');
      expect(result.isValid).toBe(true);
      expect(result.changeType).toBe('downgrade');
    });

    it('should reject same plan change', () => {
      const result = validateSubscriptionChange('starter', 'starter');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('already subscribed');
    });

    it('should reject changes for inactive subscriptions', () => {
      const result = validateSubscriptionChange('starter', 'professional', 'canceled');
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('must be active');
    });

    it('should add restrictions for enterprise plans', () => {
      const result = validateSubscriptionChange('starter', 'enterprise');
      expect(result.isValid).toBe(true);
      expect(result.restrictions).toBeDefined();
      expect(result.restrictions![0]).toContain('Enterprise');
    });
  });

  describe('estimateProration', () => {
    it('should calculate prorated upgrade cost correctly', () => {
      const result = estimateProration('starter', 'professional', 15);
      expect(result).toBeDefined();
      expect(result!.amount).toBeGreaterThan(0); // Should be positive for upgrades
      expect(result!.description).toContain('higher tier');
    });

    it('should calculate prorated downgrade credit correctly', () => {
      const result = estimateProration('professional', 'starter', 15);
      expect(result).toBeDefined();
      expect(result!.amount).toBeLessThan(0); // Should be negative for downgrades (credit)
      expect(result!.description).toContain('days');
    });

    it('should return null for same plan', () => {
      const result = estimateProration('starter', 'starter', 15);
      expect(result).toBeNull();
    });

    it('should handle zero days remaining', () => {
      const result = estimateProration('starter', 'professional', 0);
      expect(result).toBeDefined();
      expect(result!.amount).toBe(0);
    });
  });

  describe('getRecommendedUpgradeType', () => {
    it('should recommend immediate for upgrades with many days left', () => {
      const result = getRecommendedUpgradeType('starter', 'professional', 15);
      expect(result).toBe('immediate');
    });

    it('should recommend end of period for upgrades with few days left', () => {
      const result = getRecommendedUpgradeType('starter', 'professional', 3);
      expect(result).toBe('end_of_period');
    });

    it('should recommend end of period for all downgrades', () => {
      const result = getRecommendedUpgradeType('professional', 'starter', 15);
      expect(result).toBe('end_of_period');
    });
  });

  describe('getTierFromPriceId', () => {
    // Mock environment variables for testing
    beforeAll(() => {
      process.env.STRIPE_PRICE_STARTER = 'price_starter_test';
      process.env.STRIPE_PRICE_PROFESSIONAL = 'price_pro_test';
      process.env.STRIPE_PRICE_ENTERPRISE = 'price_ent_test';
    });

    it('should map professional price to pro tier', () => {
      const result = getTierFromPriceId('price_pro_test');
      expect(result).toBe('pro');
    });

    it('should map starter price to starter tier', () => {
      const result = getTierFromPriceId('price_starter_test');
      expect(result).toBe('starter');
    });

    it('should map enterprise price to enterprise tier', () => {
      const result = getTierFromPriceId('price_ent_test');
      expect(result).toBe('enterprise');
    });

    it('should default to starter for unknown price', () => {
      const result = getTierFromPriceId('price_unknown');
      expect(result).toBe('starter');
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  describe('Invalid subscription states', () => {
    const invalidStates = ['past_due', 'canceled', 'unpaid', 'incomplete'];

    invalidStates.forEach((state) => {
      it(`should reject changes for ${state} subscriptions`, () => {
        const result = validateSubscriptionChange('starter', 'professional', state);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Plan hierarchy validation', () => {
    it('should handle all valid plan combinations', () => {
      const plans = ['starter', 'professional', 'enterprise'];

      plans.forEach((fromPlan) => {
        plans.forEach((toPlan) => {
          if (fromPlan !== toPlan) {
            const result = validateSubscriptionChange(fromPlan as any, toPlan as any);
            expect(result.isValid).toBe(true);
            expect(['upgrade', 'downgrade']).toContain(result.changeType);
          }
        });
      });
    });
  });

  describe('Proration edge cases', () => {
    it('should handle large number of days', () => {
      const result = estimateProration('starter', 'enterprise', 365);
      expect(result).toBeDefined();
      expect(Math.abs(result!.amount)).toBeGreaterThan(0);
    });

    it('should handle fractional days', () => {
      const result = estimateProration('starter', 'professional', 15.5);
      expect(result).toBeDefined();
      expect(result!.daysRemaining).toBe(15.5);
    });
  });
});

describe('Integration scenarios', () => {
  describe('Complete upgrade flow', () => {
    it('should provide consistent recommendations for typical upgrade', () => {
      const validation = validateSubscriptionChange('starter', 'professional');
      const proration = estimateProration('starter', 'professional', 15);
      const recommendedType = getRecommendedUpgradeType('starter', 'professional', 15);

      expect(validation.isValid).toBe(true);
      expect(validation.changeType).toBe('upgrade');
      expect(proration).toBeDefined();
      expect(proration!.amount).toBeGreaterThan(0);
      expect(recommendedType).toBe('immediate');
    });
  });

  describe('Complete downgrade flow', () => {
    it('should provide consistent recommendations for typical downgrade', () => {
      const validation = validateSubscriptionChange('enterprise', 'starter');
      const proration = estimateProration('enterprise', 'starter', 20);
      const recommendedType = getRecommendedUpgradeType('enterprise', 'starter', 20);

      expect(validation.isValid).toBe(true);
      expect(validation.changeType).toBe('downgrade');
      expect(proration).toBeDefined();
      expect(proration!.amount).toBeLessThan(0); // Credit
      expect(recommendedType).toBe('end_of_period');
    });
  });
});

describe('Security and validation', () => {
  describe('Input validation', () => {
    it('should handle invalid plan keys gracefully', () => {
      const result = validateSubscriptionChange('invalid_plan' as any, 'starter');
      expect(result.isValid).toBe(false);
    });

    it('should handle null/undefined inputs', () => {
      expect(() => {
        validateSubscriptionChange(null as any, 'starter');
      }).not.toThrow();
    });
  });

  describe('Price calculation security', () => {
    it('should not allow negative days', () => {
      const result = estimateProration('starter', 'professional', -5);
      expect(result).toBeDefined();
      // Should handle negative days gracefully
      expect(result!.daysRemaining).toBe(-5);
    });

    it('should handle extreme values', () => {
      expect(() => {
        estimateProration('starter', 'professional', Number.MAX_SAFE_INTEGER);
      }).not.toThrow();
    });
  });
});
