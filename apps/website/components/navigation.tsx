'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@raffle-spinner/ui';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="DrawDay Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-bold text-xl">DrawDay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/demo"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/support"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
            <Button asChild>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
              >
                Install Extension
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mounted && (mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />)}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                href="/features"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/demo"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="/docs"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentation
              </Link>
              <Link
                href="/support"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>
              <Button asChild className="w-full">
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Install Extension
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
