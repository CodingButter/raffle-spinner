/**
 * Dashboard Layout
 *
 * Shared layout for all dashboard pages with auth protection and navigation
 */

'use client';

import { useAuth, useRequireAuth } from '@drawday/auth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { LoadingScreen } from '@/components/dashboard/LoadingScreen';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Protect all dashboard routes
  useRequireAuth();

  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  // Get active tab from pathname
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 'overview';
    if (pathname === '/dashboard/subscription') return 'subscription';
    if (pathname === '/dashboard/usage') return 'usage';
    if (pathname === '/dashboard/settings') return 'settings';
    return 'overview';
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardHeader activeTab={getActiveTab()} userEmail={user.email} onLogout={handleLogout} />
      {children}
    </div>
  );
}
