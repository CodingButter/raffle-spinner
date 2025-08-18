'use client';

import Link from 'next/link';
import { Button } from '@drawday/ui/button';
import { Chrome, Download, Activity, CreditCard } from 'lucide-react';
import { QuickActionCard } from './QuickActionCard';
import { StatRow } from './StatRow';
import { UserData } from './types';

interface QuickActionsProps {
  userData: UserData;
  onDownloadExtension: () => void;
}

export function QuickActions({ userData, onDownloadExtension }: QuickActionsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <QuickActionCard
        icon={<Chrome className="w-5 h-5 text-purple-400" />}
        title="Chrome Extension"
        description="Download and install the DrawDay Spinner"
        action={
          <Button
            onClick={onDownloadExtension}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Download className="mr-2 w-4 h-4" />
            Download Extension
          </Button>
        }
        footer="Version 1.2.0"
      />

      <QuickActionCard
        icon={<Activity className="w-5 h-5 text-blue-400" />}
        title="Recent Activity"
        description={`Your last draw was ${userData.usage.lastDraw}`}
        content={
          <div className="space-y-2">
            <StatRow label="Total Draws" value={userData.usage.draws.toString()} />
            <StatRow label="Participants" value={userData.usage.participants.toLocaleString()} />
          </div>
        }
      />

      <QuickActionCard
        icon={<CreditCard className="w-5 h-5 text-green-400" />}
        title="Current Plan"
        description={userData.plan}
        action={
          <Link href="/dashboard/subscription/spinner" className="w-full">
            <Button variant="outline" className="w-full border-gray-700">
              Manage Subscription
            </Button>
          </Link>
        }
        footer={`Next billing: ${userData.trialEndsAt}`}
      />
    </div>
  );
}
