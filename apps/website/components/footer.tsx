import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Linkedin, Mail, Phone, MapPin, Monitor, Tv, Code } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
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
            <p className="text-gray-400 mb-4 max-w-sm">
              Complete technology solutions for UK raffle companies. From live draws to streaming production and custom websites.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/CodingButter/raffle-spinner" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/drawdaysolutions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/drawday-solutions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/spinner" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Spinner Software
                </Link>
              </li>
              <li>
                <Link href="/streaming" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Tv className="w-4 h-4" />
                  Streaming Production
                </Link>
              </li>
              <li>
                <Link href="/websites" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Custom Websites
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hello@drawday.app" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  hello@drawday.app
                </a>
              </li>
              <li>
                <a href="tel:+44-20-1234-5678" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +44 20 1234 5678
                </a>
              </li>
              <li className="text-gray-400 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  London, UK<br />
                  United Kingdom
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} DrawDay Solutions. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
