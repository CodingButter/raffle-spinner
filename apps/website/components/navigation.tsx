'use client';

import Link from 'next/link';
import { Button } from '@raffle-spinner/ui';
import { Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-blue to-brand-pink flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span>Raffle Spinner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="/support" className="text-muted-foreground hover:text-foreground transition-colors">
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
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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