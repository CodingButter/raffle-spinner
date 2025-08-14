/**
 * Subscription Layout
 *
 * Shared layout for all subscription category pages with category navigation
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@drawday/utils';

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine active category from pathname
  const getActiveCategory = () => {
    if (pathname === '/dashboard/subscription/spinner') return 'spinner';
    if (pathname === '/dashboard/subscription/streaming') return 'streaming';
    if (pathname === '/dashboard/subscription/website') return 'website';
    return 'spinner'; // default
  };

  const activeCategory = getActiveCategory();

  const categories = [
    { id: 'spinner', label: 'Spinner', href: '/dashboard/subscription/spinner' },
    { id: 'streaming', label: 'Streaming', href: '/dashboard/subscription/streaming' },
    { id: 'website', label: 'Website', href: '/dashboard/subscription/website' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription & Billing</h1>
        <p className="text-gray-400">Manage your subscription plans and billing information</p>
      </div>

      {/* Category Navigation */}
      <div className="flex gap-4 mb-8 border-b border-gray-800">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className={cn(
              'pb-3 px-1 text-sm font-medium transition-colors border-b-2',
              activeCategory === category.id
                ? 'text-white border-purple-500'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            )}
          >
            {category.label}
          </Link>
        ))}
      </div>

      {/* Category Content */}
      {children}
    </main>
  );
}
