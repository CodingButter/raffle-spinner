/**
 * UserInfoBar Component
 *
 * Reusable user information display bar with subscription status,
 * dashboard link, and logout functionality.
 *
 * Optimized for Chrome Extension context with external link handling.
 */

import { ExternalLink } from 'lucide-react';
import { Button } from './button';

export interface UserInfoBarProps {
  /** User email address */
  email: string;
  /** Whether user has pro subscription */
  isPro: boolean;
  /** Handler for dashboard button click */
  onDashboardClick: () => void;
  /** Handler for logout button click */
  onLogout: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function UserInfoBar({
  email,
  isPro,
  onDashboardClick,
  onLogout,
  className = '',
}: UserInfoBarProps) {
  return (
    <div className={`border-b border-border bg-card/50 px-8 py-3 ${className}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Logged in as:</span>
          <span className="font-medium">{email}</span>
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
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}