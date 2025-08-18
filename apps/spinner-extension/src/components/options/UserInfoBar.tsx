/**
 * UserInfoBar Component
 *
 * Purpose: User authentication status display with logout functionality
 * Performance: Extracted from 407-line OptionsPage.tsx for better rendering
 *
 * SRS Reference:
 * - FR-1.1: User Authentication Display
 */

import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '@drawday/auth';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface UserInfoBarProps {
  onDashboardClick: () => void;
}

export function UserInfoBar({ onDashboardClick }: UserInfoBarProps) {
  const { user, logout } = useAuth();
  const { subscription, hasBranding, hasCustomization } = useSubscription();

  // Check if user has pro subscription for customization features
  const isPro = subscription?.tier === 'pro' || hasBranding() || hasCustomization();

  return (
    <div className="border-b border-border bg-card/50 px-8 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Logged in as:</span>
          <span className="font-medium">{user?.email}</span>
          {isPro ? (
            <span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold text-xs font-semibold rounded">
              PRO
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded">
              FREE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDashboardClick} className="gap-2">
            <ExternalLink className="h-3.5 w-3.5" />
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}