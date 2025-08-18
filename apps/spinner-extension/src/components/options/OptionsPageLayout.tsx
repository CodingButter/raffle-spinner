/**
 * OptionsPage layout wrapper
 * Extracted to reduce OptionsContent function size and improve component organization
 */

import React from 'react';
import { UserInfoBar } from '@drawday/ui';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SubscriptionStatus } from '@/components/ui/subscription-status';
import { CheckCircle } from 'lucide-react';

interface ImportSummary {
  success: boolean;
  message: string;
}

interface OptionsPageLayoutProps {
  email: string;
  isPro: boolean;
  onDashboardClick: () => void;
  onLogout: () => void;
  importSummary?: ImportSummary;
  currentContestants: number;
  onUpgradeClick: () => void;
  children: React.ReactNode;
}

export function OptionsPageLayout({
  email,
  isPro,
  onDashboardClick,
  onLogout,
  importSummary,
  currentContestants,
  onUpgradeClick,
  children,
}: OptionsPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <UserInfoBar
        email={email}
        isPro={isPro}
        onDashboardClick={onDashboardClick}
        onLogout={onLogout}
      />

      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Raffle Spinner Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Manage competitions and customize spinner settings
            </p>
          </div>

          {importSummary && (
            <Alert variant={importSummary.success ? 'default' : 'destructive'}>
              {importSummary.success && <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{importSummary.message}</AlertDescription>
            </Alert>
          )}

          <SubscriptionStatus 
            currentContestants={currentContestants}
            onUpgradeClick={onUpgradeClick}
          />

          {children}
        </div>
      </div>
    </div>
  );
}