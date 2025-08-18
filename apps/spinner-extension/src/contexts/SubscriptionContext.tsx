/**
 * Subscription Context
 * 
 * Manages subscription state and limits across the extension
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserSubscription } from '@drawday/types';
import { storage } from '@raffle-spinner/storage';
import { 
  createStarterSubscription, 
  canAddContestants, 
  canConductRaffle, 
  hasFeature,
  getRemainingQuota,
  getSubscriptionStatusMessage,
  updateSubscriptionStatus
} from '@raffle-spinner/subscription';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isLoading: boolean;
  raffleCount: number;
  
  // Limit checking functions
  canAddContestants: (currentCount: number, adding?: number) => boolean;
  canConductRaffle: () => boolean;
  hasApiSupport: () => boolean;
  hasBranding: () => boolean;
  hasCustomization: () => boolean;
  
  // Quota functions
  getRemainingContestants: (currentCount: number) => number | null;
  getRemainingRaffles: () => number | null;
  
  // Actions
  incrementRaffleCount: () => Promise<void>;
  updateSubscription: (subscription: UserSubscription) => Promise<void>;
  refreshSubscription: () => Promise<void>;
  
  // Status
  getStatusMessage: () => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [raffleCount, setRaffleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize subscription on mount
  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        setIsLoading(true);
        
        let currentSubscription = await storage.getSubscription();
        const currentRaffleCount = await storage.getRaffleCount();
        
        // If no subscription exists, create a starter subscription
        if (!currentSubscription) {
          currentSubscription = createStarterSubscription();
          await storage.saveSubscription(currentSubscription);
        }
        
        // Update subscription status based on expiration
        const updatedSubscription = updateSubscriptionStatus(currentSubscription);
        
        // Save if status changed
        if (updatedSubscription.isActive !== currentSubscription.isActive) {
          await storage.saveSubscription(updatedSubscription);
        }
        
        setSubscription(updatedSubscription);
        setRaffleCount(currentRaffleCount);
      } catch (error) {
        console.error('Failed to initialize subscription:', error);
        // Fall back to starter subscription
        const starterSubscription = createStarterSubscription();
        setSubscription(starterSubscription);
        setRaffleCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSubscription();
  }, []);

  // Sync with auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      refreshSubscription();
    };

    // Listen for auth state changes
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const refreshSubscription = async () => {
    try {
      const currentSubscription = await storage.getSubscription();
      const currentRaffleCount = await storage.getRaffleCount();
      
      if (currentSubscription) {
        const updatedSubscription = updateSubscriptionStatus(currentSubscription);
        setSubscription(updatedSubscription);
        
        if (updatedSubscription.isActive !== currentSubscription.isActive) {
          await storage.saveSubscription(updatedSubscription);
        }
      }
      
      setRaffleCount(currentRaffleCount);
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
    }
  };

  const updateSubscriptionState = async (newSubscription: UserSubscription) => {
    try {
      await storage.saveSubscription(newSubscription);
      setSubscription(newSubscription);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const incrementRaffleCountState = async () => {
    try {
      const newCount = await storage.incrementRaffleCount();
      setRaffleCount(newCount);
    } catch (error) {
      console.error('Failed to increment raffle count:', error);
    }
  };

  // Helper functions that use current subscription state
  const checkCanAddContestants = (currentCount: number, adding = 1) => {
    if (!subscription) return false;
    return canAddContestants(subscription, currentCount, adding);
  };

  const checkCanConductRaffle = () => {
    if (!subscription) return false;
    return canConductRaffle(subscription, raffleCount);
  };

  const checkHasApiSupport = () => {
    if (!subscription) return false;
    return hasFeature(subscription, 'hasApiSupport');
  };

  const checkHasBranding = () => {
    if (!subscription) return false;
    return hasFeature(subscription, 'hasBranding');
  };

  const checkHasCustomization = () => {
    if (!subscription) return false;
    return hasFeature(subscription, 'hasCustomization');
  };

  const getRemainingContestants = (currentCount: number) => {
    if (!subscription) return 0;
    return getRemainingQuota(subscription, 'contestants', currentCount);
  };

  const getRemainingRaffles = () => {
    if (!subscription) return 0;
    return getRemainingQuota(subscription, 'raffles', raffleCount);
  };

  const getStatusMessage = () => {
    if (!subscription) return 'No subscription';
    return getSubscriptionStatusMessage(subscription);
  };

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    raffleCount,
    
    // Limit checking
    canAddContestants: checkCanAddContestants,
    canConductRaffle: checkCanConductRaffle,
    hasApiSupport: checkHasApiSupport,
    hasBranding: checkHasBranding,
    hasCustomization: checkHasCustomization,
    
    // Quota functions
    getRemainingContestants,
    getRemainingRaffles,
    
    // Actions
    incrementRaffleCount: incrementRaffleCountState,
    updateSubscription: updateSubscriptionState,
    refreshSubscription,
    
    // Status
    getStatusMessage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}