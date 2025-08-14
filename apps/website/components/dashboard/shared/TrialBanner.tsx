'use client';

import { Card, CardContent } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TrialBannerProps {
  trialEndsAt: string;
  onUpgradeClick: () => void;
}

export function TrialBanner({ trialEndsAt, onUpgradeClick }: TrialBannerProps) {
  return (
    <Card className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="font-bold text-lg">Free Trial Active</h3>
              <p className="text-sm text-gray-400">
                Your trial ends on {new Date(trialEndsAt).toLocaleDateString()}. Upgrade now to
                unlock all features.
              </p>
            </div>
          </div>
          <Button
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Upgrade Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
