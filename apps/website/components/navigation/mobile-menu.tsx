'use client';

import Link from 'next/link';
import { Button } from '@drawday/ui';
import { ThemeToggle } from '../theme-toggle';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-border">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Services
        </div>
        <Link
          href="/spinner"
          className="text-muted-foreground hover:text-foreground transition-colors px-4 py-3 block min-h-[44px] flex items-center"
          onClick={onClose}
        >
          DrawDay Spinner
        </Link>
        <Link
          href="/streaming"
          className="text-muted-foreground hover:text-foreground transition-colors px-4 py-3 block min-h-[44px] flex items-center"
          onClick={onClose}
        >
          Streaming Production
        </Link>
        <Link
          href="/websites"
          className="text-muted-foreground hover:text-foreground transition-colors px-4 py-3 block min-h-[44px] flex items-center"
          onClick={onClose}
        >
          Custom Websites
        </Link>

        <div className="border-t border-border pt-4 mt-2">
          <Link
            href="/pricing"
            className="block text-muted-foreground hover:text-foreground transition-colors px-4 py-3 min-h-[44px] flex items-center"
            onClick={onClose}
          >
            Pricing
          </Link>
          <Link
            href="/portfolio"
            className="block text-muted-foreground hover:text-foreground transition-colors px-4 py-3 min-h-[44px] flex items-center"
            onClick={onClose}
          >
            Portfolio
          </Link>
          <Link
            href="/about"
            className="block text-muted-foreground hover:text-foreground transition-colors px-4 py-3 min-h-[44px] flex items-center"
            onClick={onClose}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block text-muted-foreground hover:text-foreground transition-colors px-4 py-3 min-h-[44px] flex items-center"
            onClick={onClose}
          >
            Contact
          </Link>
        </div>

        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between px-4">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="default"
            className="w-full border-border text-muted-foreground min-h-[44px]"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="default"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 min-h-[44px]"
            asChild
          >
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
