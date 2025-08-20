'use client';

/**
 * Subscription Context (Website Integration)
 *
 * Purpose: Mock subscription context for website extension pages.
 * Provides the same interface as the extension context.
 */

import { createContext, useContext, ReactNode } from 'react';

interface SubscriptionContextType {
  canConductRaffle: () => boolean;
  incrementRaffleCount: () => Promise<void>;
  hasBranding: () => boolean;
  // Add other subscription methods as needed
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const contextValue: SubscriptionContextType = {
    canConductRaffle: () => true, // Allow all raffles for website demo
    incrementRaffleCount: async () => {
      // Mock implementation - in real scenario would track usage
      console.log('Raffle count incremented');
    },
    hasBranding: () => true, // Enable branding for demo
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
