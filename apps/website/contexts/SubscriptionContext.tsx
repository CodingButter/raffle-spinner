/**
 * Subscription Context for Website Extension Pages
 * 
 * Manages subscription state for website users
 * Integrates with Directus backend for subscription verification
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Subscription {
  tier: 'free' | 'basic' | 'pro';
  raffleCount: number;
  maxRaffles: number;
  features: {
    branding: boolean;
    customization: boolean;
    unlimitedRaffles: boolean;
  };
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  canConductRaffle: () => boolean;
  incrementRaffleCount: () => Promise<void>;
  hasBranding: () => boolean;
  hasCustomization: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch subscription from API
    // For now, default to basic tier for development
    setSubscription({
      tier: 'basic',
      raffleCount: 0,
      maxRaffles: 100,
      features: {
        branding: false,
        customization: false,
        unlimitedRaffles: false,
      },
    });
    setLoading(false);
  }, []);

  const canConductRaffle = () => {
    if (!subscription) return false;
    if (subscription.features.unlimitedRaffles) return true;
    return subscription.raffleCount < subscription.maxRaffles;
  };

  const incrementRaffleCount = async () => {
    if (!subscription) return;
    
    const newCount = subscription.raffleCount + 1;
    setSubscription({
      ...subscription,
      raffleCount: newCount,
    });
    
    // TODO: Update count in backend
  };

  const hasBranding = () => {
    return subscription?.features.branding || subscription?.tier === 'pro' || false;
  };

  const hasCustomization = () => {
    return subscription?.features.customization || subscription?.tier === 'pro' || false;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        canConductRaffle,
        incrementRaffleCount,
        hasBranding,
        hasCustomization,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}