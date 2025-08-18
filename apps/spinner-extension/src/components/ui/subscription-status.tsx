/**
 * Subscription Status Component
 * 
 * Shows current subscription tier, limits, and usage
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '@drawday/auth';

interface SubscriptionStatusProps {
  currentContestants?: number;
  onUpgradeClick?: () => void;
}

export function SubscriptionStatus({ 
  currentContestants = 0, 
  onUpgradeClick 
}: SubscriptionStatusProps) {
  const { 
    subscription, 
    raffleCount, 
    getRemainingContestants, 
    getRemainingRaffles,
    getStatusMessage,
    isLoading 
  } = useSubscription();
  
  const { user } = useAuth();

  if (isLoading || !subscription) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const remainingContestants = getRemainingContestants(currentContestants);
  const remainingRaffles = getRemainingRaffles();
  const isStarter = subscription.tier === 'starter';
  const showUpgrade = isStarter && onUpgradeClick;

  const formatLimit = (current: number, max: number | null) => {
    if (max === null) return 'Unlimited';
    return `${current} / ${max}`;
  };

  return (
    <Card className={`${!subscription.isActive ? 'border-destructive' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">
              {subscription.tier === 'starter' ? 'Starter Plan' : 'Pro Plan'}
            </CardTitle>
            <CardDescription className="text-xs">
              {getStatusMessage()}
            </CardDescription>
          </div>
          <Badge variant={subscription.isActive ? 'default' : 'destructive'}>
            {subscription.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-xs">
          {/* Contestants limit */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Contestants:</span>
            <span className={`font-medium ${
              remainingContestants !== null && remainingContestants <= 50 
                ? 'text-amber-600' 
                : remainingContestants === 0 
                  ? 'text-destructive' 
                  : ''
            }`}>
              {formatLimit(currentContestants, subscription.limits.maxContestants)}
            </span>
          </div>
          
          {/* Raffles limit */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Raffles:</span>
            <span className={`font-medium ${
              remainingRaffles !== null && remainingRaffles <= 1 
                ? 'text-amber-600' 
                : remainingRaffles === 0 
                  ? 'text-destructive' 
                  : ''
            }`}>
              {formatLimit(raffleCount, subscription.limits.maxRaffles)}
            </span>
          </div>
          
          {/* Features */}
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.limits.hasCustomization ? 'bg-green-500' : 'bg-muted'
                }`} />
                <span className="text-muted-foreground">Customization</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.limits.hasBranding ? 'bg-green-500' : 'bg-muted'
                }`} />
                <span className="text-muted-foreground">Branding</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.limits.hasApiSupport ? 'bg-green-500' : 'bg-muted'
                }`} />
                <span className="text-muted-foreground">API Support</span>
              </div>
            </div>
          </div>
          
          {/* Upgrade button for starter users */}
          {showUpgrade && (
            <div className="pt-3">
              <Button 
                onClick={onUpgradeClick}
                size="sm" 
                className="w-full text-xs"
                variant={remainingContestants === 0 || remainingRaffles === 0 ? 'destructive' : 'default'}
              >
                {remainingContestants === 0 || remainingRaffles === 0 
                  ? 'Upgrade Required' 
                  : 'Upgrade to Pro'}
              </Button>
            </div>
          )}
          
          {/* Login prompt for non-authenticated users */}
          {!user && (
            <div className="pt-3">
              <p className="text-xs text-muted-foreground text-center">
                Sign in to sync your subscription
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}