'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { Calendar } from 'lucide-react';

interface UsageTabProps {
  userData: {
    usage: {
      draws: number;
      participants: number;
      lastDraw: string;
    };
  };
}

export function UsageTab({ userData }: UsageTabProps) {
  const averagePerDraw =
    userData.usage.draws > 0 ? Math.round(userData.usage.participants / userData.usage.draws) : 0;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <UsageStatCard title="Total Draws" value={userData.usage.draws} subtitle="All time" />
        <UsageStatCard
          title="Total Participants"
          value={userData.usage.participants.toLocaleString()}
          subtitle="All time"
        />
        <UsageStatCard title="Average per Draw" value={averagePerDraw} subtitle="Participants" />
        <UsageStatCard
          title="Last Draw"
          value={userData.usage.lastDraw}
          subtitle="Most recent"
          isDate
        />
      </div>

      {/* Recent Draws */}
      <RecentDrawsCard />
    </div>
  );
}

// Sub-components
function UsageStatCard({
  title,
  value,
  subtitle,
  isDate = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  isDate?: boolean;
}) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={isDate ? 'text-xl font-bold' : 'text-3xl font-bold'}>{value}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function RecentDrawsCard() {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>Recent Draws</CardTitle>
        <CardDescription>Your last 10 draws</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Draw history coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
