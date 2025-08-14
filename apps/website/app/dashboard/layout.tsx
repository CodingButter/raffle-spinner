/**
 * Dashboard Layout
 *
 * Custom layout for dashboard pages that removes the main website navigation
 * since the dashboard has its own navigation header
 */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Return children without any additional wrapper
  // This prevents the main navigation from showing in the dashboard
  return <>{children}</>;
}
