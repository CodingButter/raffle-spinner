/**
 * Dashboard Settings Page
 *
 * Account settings and preferences
 */

'use client';

import { useAuth } from '@drawday/auth';
import { SettingsTab } from '@/components/dashboard/tabs/SettingsTab';
import { extractUserData } from '@/lib/dashboard-helpers';

export default function DashboardSettingsPage() {
  const { user } = useAuth();

  // User is guaranteed to exist because of layout protection
  if (!user) {
    return null;
  }

  // Get user's active spinner subscription from user.subscriptions
  const activeSpinnerSub = user?.subscriptions?.find(
    (s: any) => s.product === 'spinner' && (s.status === 'active' || s.status === 'trialing')
  );
  const userTier = activeSpinnerSub?.tier || 'free';

  // Extract user data
  const userData = extractUserData(user, activeSpinnerSub);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      <SettingsTab userData={userData} userTier={userTier} />
    </main>
  );
}
