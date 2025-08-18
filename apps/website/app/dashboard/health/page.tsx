'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@drawday/auth';
import { IntegrationHealthDashboard } from '@/components/dashboard/IntegrationHealthDashboard';

export default function HealthDashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integration Health Dashboard</h1>
        <p className="text-gray-400">
          Monitor webhook processing, API performance, and system health
        </p>
      </div>

      <IntegrationHealthDashboard />
    </main>
  );
}