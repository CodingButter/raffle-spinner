'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@drawday/ui';
import { Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@drawday/auth';
import { ServicesDropdown } from './navigation/services-dropdown';
import { MobileMenu } from './navigation/mobile-menu';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="DrawDay Solutions"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div>
              <span className="font-bold text-xl text-white">DrawDay</span>
              <span className="text-xs text-gray-400 ml-2">Solutions</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <ServicesDropdown />

            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors py-4">
              Pricing
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-300 hover:text-white transition-colors py-4"
            >
              Portfolio
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors py-4">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors py-4">
              Contact
            </Link>

            <div className="flex items-center gap-2 lg:gap-3">
              {isAuthenticated ? (
                <Button variant="ghost" className="text-gray-300 hover:text-white" asChild>
                  <Link href="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="text-gray-300 hover:text-white" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    asChild
                  >
                    <Link href="/register">Start Free Trial</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 text-white min-w-[44px] min-h-[44px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mounted && (mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />)}
          </button>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>
    </nav>
  );
}
