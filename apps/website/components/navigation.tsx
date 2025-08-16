'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@drawday/ui';
import { Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@drawday/auth';
import { ServicesDropdown } from './navigation/services-dropdown';
import { MobileMenu } from './navigation/mobile-menu';
import { ThemeToggle } from './theme-toggle';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/90 dark:bg-black/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 py-2 min-h-[44px]">
            <Image
              src="/logo.svg"
              alt="DrawDay Solutions"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div>
              <span className="font-bold text-xl text-foreground">DrawDay</span>
              <span className="text-xs text-muted-foreground ml-2">Solutions</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <ServicesDropdown />

            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors py-4"
            >
              Pricing
            </Link>
            <Link
              href="/portfolio"
              className="text-muted-foreground hover:text-foreground transition-colors py-4"
            >
              Portfolio
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors py-4"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors py-4"
            >
              Contact
            </Link>

            <div className="flex items-center gap-2 lg:gap-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="default"
                  className="text-muted-foreground hover:text-foreground min-h-[44px]"
                  asChild
                >
                  <Link href="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="default"
                    className="text-muted-foreground hover:text-foreground min-h-[44px]"
                    asChild
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    size="default"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white min-h-[44px]"
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
            className="md:hidden p-3 text-foreground min-w-[44px] min-h-[44px]"
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
