'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@drawday/ui';
import { Menu, X, ChevronDown, Monitor, Tv, Code, ArrowRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@drawday/auth';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
          <div className="hidden md:flex items-center gap-8">
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors py-4">
                Services
                <ChevronDown className="w-4 h-4" />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 pt-2 w-72">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                    <Link
                      href="/spinner"
                      className="flex items-start gap-4 p-4 hover:bg-gray-800/50 transition-colors group/item"
                    >
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Monitor className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1">DrawDay Spinner</div>
                        <div className="text-sm text-gray-400">Professional live draw software</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover/item:text-white mt-3" />
                    </Link>

                    <Link
                      href="/streaming"
                      className="flex items-start gap-4 p-4 hover:bg-gray-800/50 transition-colors group/item"
                    >
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tv className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1">Streaming Production</div>
                        <div className="text-sm text-gray-400">
                          Professional overlays & graphics
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover/item:text-white mt-3" />
                    </Link>

                    <Link
                      href="/websites"
                      className="flex items-start gap-4 p-4 hover:bg-gray-800/50 transition-colors group/item"
                    >
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Code className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white mb-1">Custom Websites</div>
                        <div className="text-sm text-gray-400">Bespoke competition platforms</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover/item:text-white mt-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

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

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" className="text-gray-300 hover:text-white" asChild>
                    <Link href="/dashboard">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                </>
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
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mounted && (mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />)}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-4">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
                Services
              </div>
              <Link
                href="/spinner"
                className="text-gray-300 hover:text-white transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                DrawDay Spinner
              </Link>
              <Link
                href="/streaming"
                className="text-gray-300 hover:text-white transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Streaming Production
              </Link>
              <Link
                href="/websites"
                className="text-gray-300 hover:text-white transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Custom Websites
              </Link>

              <div className="border-t border-gray-800 pt-4 mt-2">
                <Link
                  href="/portfolio"
                  className="block text-gray-300 hover:text-white transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Portfolio
                </Link>
                <Link
                  href="/about"
                  className="block text-gray-300 hover:text-white transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block text-gray-300 hover:text-white transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
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
        )}
      </div>
    </nav>
  );
}
