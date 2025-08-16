'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@drawday/ui/dialog';
import { Button } from '@drawday/ui/button';
import { Badge } from '@drawday/ui/badge';
import { Label } from '@drawday/ui/label';
import { Alert, AlertDescription } from '@drawday/ui/alert';
import { ArrowUp, ArrowDown, Clock, Zap, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { ProductKey, PRODUCTS } from '@/lib/stripe';
import {
  validateSubscriptionChange,
  estimateProration,
  getRecommendedUpgradeType,
  formatPlanChangeMessage,
  getUpgradeTypeDisplayName,
} from '@/lib/subscription-utils';

interface PlanChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: ProductKey;
  newPlan: ProductKey;
  subscriptionId: string;
  currentPeriodEnd: number;
  onConfirm: (upgradeType: 'immediate' | 'end_of_period') => Promise<void>;
  isLoading?: boolean;
}

export function PlanChangeDialog({
  open,
  onOpenChange,
  currentPlan,
  newPlan,
  subscriptionId,
  currentPeriodEnd,
  onConfirm,
  isLoading = false,
}: PlanChangeDialogProps) {
  const [upgradeType, setUpgradeType] = useState<'immediate' | 'end_of_period'>('immediate');
  const [preview, setPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Calculate days remaining in current period
  const daysRemaining = Math.ceil((currentPeriodEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

  // Validate the plan change
  const validation = validateSubscriptionChange(currentPlan, newPlan);

  // Get recommended upgrade type
  const recommendedType = getRecommendedUpgradeType(currentPlan, newPlan, daysRemaining);

  // Estimate proration (fallback if preview API fails)
  const prorationEstimate = estimateProration(currentPlan, newPlan, daysRemaining);

  // Fetch accurate proration preview from Stripe
  useEffect(() => {
    if (open && subscriptionId && newPlan) {
      setIsLoadingPreview(true);
      fetch('/api/subscription/preview-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          newProductKey: newPlan,
          upgradeType,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPreview(data.preview);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingPreview(false));
    }
  }, [open, subscriptionId, newPlan, upgradeType]);

  const currentProduct = PRODUCTS[currentPlan];
  const newProduct = PRODUCTS[newPlan];

  if (!validation.isValid) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Plan Change Not Available
            </DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>{validation.reason}</AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isUpgrade = validation.changeType === 'upgrade';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? (
              <ArrowUp className="w-5 h-5 text-green-500" />
            ) : (
              <ArrowDown className="w-5 h-5 text-blue-500" />
            )}
            {validation.changeType === 'upgrade' ? 'Upgrade' : 'Downgrade'} Subscription
          </DialogTitle>
          <DialogDescription>
            Change from {currentProduct.name} to {newProduct.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <PlanCard title="Current Plan" plan={currentProduct} isCurrent />
            <PlanCard title="New Plan" plan={newProduct} isTarget />
          </div>

          {/* Timing Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">When to apply this change?</Label>
            <div className="space-y-3">
              <UpgradeOption
                value="immediate"
                icon={<Zap className="w-4 h-4" />}
                title={getUpgradeTypeDisplayName('immediate')}
                description={
                  isUpgrade
                    ? 'Changes take effect immediately with prorated billing'
                    : 'Changes take effect immediately with prorated credit'
                }
                recommended={recommendedType === 'immediate'}
                selected={upgradeType === 'immediate'}
                onSelect={(v) => setUpgradeType(v as 'immediate' | 'end_of_period')}
                details={
                  isLoadingPreview ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Calculating proration...
                    </span>
                  ) : preview?.proration ? (
                    preview.proration.totalAmount > 0 ? (
                      `Charge: £${Math.abs(preview.proration.totalAmount / 100).toFixed(2)}`
                    ) : (
                      `Credit: £${Math.abs(preview.proration.totalAmount / 100).toFixed(2)}`
                    )
                  ) : prorationEstimate ? (
                    `${prorationEstimate.amount > 0 ? 'Charge' : 'Credit'}: £${Math.abs(prorationEstimate.amount / 100).toFixed(2)}`
                  ) : undefined
                }
              />

              <UpgradeOption
                value="end_of_period"
                icon={<Clock className="w-4 h-4" />}
                title={getUpgradeTypeDisplayName('end_of_period')}
                description={`Changes take effect in ${daysRemaining} days at period end`}
                recommended={recommendedType === 'end_of_period'}
                selected={upgradeType === 'end_of_period'}
                onSelect={(v) => setUpgradeType(v as 'immediate' | 'end_of_period')}
                details="No immediate charges or credits"
              />
            </div>
          </div>

          {/* Change Summary */}
          <Alert>
            <AlertDescription>
              {formatPlanChangeMessage(validation, currentPlan, newPlan, upgradeType)}
            </AlertDescription>
          </Alert>

          {/* Restrictions Warning */}
          {validation.restrictions && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validation.restrictions.map((restriction, index) => (
                    <li key={index}>{restriction}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(upgradeType)}
              disabled={isLoading}
              className={
                isUpgrade ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isLoading ? 'Processing...' : `Confirm ${validation.changeType}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Sub-components for better organization
function PlanCard({
  title,
  plan,
  isCurrent = false,
  isTarget = false,
}: {
  title: string;
  plan: any;
  isCurrent?: boolean;
  isTarget?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        isCurrent
          ? 'border-gray-600 bg-gray-800/50'
          : isTarget
            ? 'border-green-500 bg-green-900/20'
            : 'border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{title}</h4>
        {isCurrent && <Badge variant="secondary">Current</Badge>}
        {isTarget && <Badge className="bg-green-600">New</Badge>}
      </div>
      <p className="text-lg font-bold">£{plan.price}/month</p>
      <p className="text-sm text-gray-400">{plan.name}</p>
    </div>
  );
}

function UpgradeOption({
  value,
  icon,
  title,
  description,
  recommended,
  details,
  selected,
  onSelect,
}: {
  value: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
  details?: React.ReactNode;
  selected?: boolean;
  onSelect?: (value: string) => void;
}) {
  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent'
      }`}
      onClick={() => onSelect?.(value)}
    >
      <div className="mt-1">
        <div
          className={`h-4 w-4 rounded-full border-2 ${
            selected ? 'border-primary' : 'border-input'
          }`}
        >
          {selected && <div className="h-2 w-2 rounded-full bg-primary m-auto mt-0.5" />}
        </div>
      </div>
      <div className="flex-1">
        <Label htmlFor={value} className="flex items-center gap-2 cursor-pointer font-medium">
          {icon}
          {title}
          {recommended && (
            <Badge variant="secondary" className="text-xs">
              Recommended
            </Badge>
          )}
        </Label>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
        {details && <div className="text-sm font-medium mt-1 text-green-400">{details}</div>}
      </div>
    </div>
  );
}
