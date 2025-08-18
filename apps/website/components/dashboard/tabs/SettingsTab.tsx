'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { Button } from '@drawday/ui/button';
import { Settings } from 'lucide-react';

interface SettingsTabProps {
  userData: {
    company: string;
    name: string;
    email: string;
  };
  userTier: string;
}

export function SettingsTab({ userData, userTier }: SettingsTabProps) {
  return (
    <div className="space-y-8">
      {/* Account Settings */}
      <AccountSettingsCard userData={userData} />

      {/* API Access */}
      <ApiAccessCard userTier={userTier} />
    </div>
  );
}

// Sub-components
function AccountSettingsCard({ userData }: { userData: SettingsTabProps['userData'] }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AccountField label="Company Name" value={userData.company} />
        <AccountField label="Full Name" value={userData.name} />
        <AccountField label="Email" value={userData.email} />
        <Button variant="outline" className="border-gray-700">
          <Settings className="mr-2 w-4 h-4" />
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}

function AccountField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function ApiAccessCard({ userTier }: { userTier: string }) {
  const hasApiAccess = userTier === 'professional' || userTier === 'enterprise';

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>API Access</CardTitle>
        <CardDescription>Manage your API keys for integration</CardDescription>
      </CardHeader>
      <CardContent>
        {hasApiAccess ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Your API keys allow you to integrate DrawDay with your own applications.
            </p>
            <Button variant="outline" className="border-gray-700">
              <Settings className="mr-2 w-4 h-4" />
              Manage API Keys
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>API access available on Professional and Enterprise plans</p>
            <Link href="/dashboard/subscription/spinner">
              <Button variant="outline" className="mt-4 border-gray-700">
                Upgrade to Access API
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
