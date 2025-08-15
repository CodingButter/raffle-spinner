'use client';

import Link from 'next/link';
import { Button } from '@drawday/ui';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden py-4 border-t border-gray-800">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
          Services
        </div>
        <Link
          href="/spinner"
          className="text-gray-300 hover:text-white transition-colors px-4 py-3 block min-h-[44px] flex items-center"
          onClick={onClose}
        >
          DrawDay Spinner
        </Link>
        <Link
          href="/streaming"
          className="text-gray-300 hover:text-white transition-colors px-4 py-3 block min-h-[44px] flex items-center"
          onClick={onClose}
        >
          Streaming Production
        </Link>
        <Link
          href="/websites"
          className="text-gray-300 hover:text-white transition-colors px-4 py-3 block min-h-[44px] flex items-center"
          onClick={onClose}
        >
          Custom Websites
        </Link>

        <div className="border-t border-gray-800 pt-4 mt-2">
          <Link
            href="/pricing"
            className="block text-gray-300 hover:text-white transition-colors px-4 py-3 min-h-[44px] flex items-center"
            onClick={onClose}
          >
            Pricing
          </Link>
          <Link
            href="/portfolio"
            className="block text-gray-300 hover:text-white transition-colors px-4 py-3 min-h-[44px] flex items-center"
            onClick={onClose}
          >
            Portfolio
          </Link>
          <Link
            href="/about"
            className="block text-gray-300 hover:text-white transition-colors px-4 py-3 min-h-[44px] flex items-center"
            onClick={onClose}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block text-gray-300 hover:text-white transition-colors px-4 py-3 min-h-[44px] flex items-center"
            onClick={onClose}
          >
            Contact
          </Link>
        </div>

        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-800">
          <Button variant="outline" className="w-full border-gray-700 text-gray-300" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600" asChild>
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
