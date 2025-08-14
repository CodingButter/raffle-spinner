'use client';

import Link from 'next/link';
import { Button } from '@drawday/ui/button';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  onLogout: () => void;
}

export function DashboardHeader({
  activeTab,
  setActiveTab,
  userEmail,
  onLogout,
}: DashboardHeaderProps) {
  const tabs = ['overview', 'subscription', 'usage', 'settings'];

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="DrawDay" className="w-8 h-8" />
              <span className="text-xl font-bold">DrawDay</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm capitalize ${
                    activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{userEmail}</span>
            <Button onClick={onLogout} variant="outline" size="sm" className="border-gray-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
