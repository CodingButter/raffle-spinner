/**
 * Footer Component - Client Component wrapper
 * This component is used in the LayoutWrapper
 */

import Link from 'next/link';
import { Mail, Phone, MapPin, Twitter, Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';

// Icon mapping for social platforms
const socialIcons: Record<string, any> = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  instagram: Instagram,
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Default company info - in production this would come from Directus
  const companyInfo = {
    company_name: 'DrawDay Solutions Ltd',
    tagline: 'Professional Technology for UK Raffle Companies',
    city: 'London',
    country: 'United Kingdom',
    phone: '+44 20 3900 4555',
    email: 'hello@drawdaysolutions.com',
    registration_number: '14789632',
    vat_number: 'GB 123 4567 89',
  };

  const socialMedia = [
    {
      id: '1',
      platform: 'twitter',
      url: 'https://twitter.com/DrawDaySolutions',
      display_in_footer: true,
    },
    {
      id: '2',
      platform: 'facebook',
      url: 'https://facebook.com/DrawDaySolutions',
      display_in_footer: true,
    },
    {
      id: '3',
      platform: 'linkedin',
      url: 'https://linkedin.com/company/drawday-solutions',
      display_in_footer: true,
    },
    {
      id: '4',
      platform: 'youtube',
      url: 'https://youtube.com/@DrawDaySolutions',
      display_in_footer: true,
    },
    {
      id: '5',
      platform: 'instagram',
      url: 'https://instagram.com/drawdaysolutions',
      display_in_footer: true,
    },
  ];

  const careers = [1, 2, 3]; // Mock data showing 3 open positions

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              {companyInfo?.company_name || 'DrawDay Solutions'}
            </h3>
            <p className="text-sm mb-4">
              {companyInfo?.tagline || 'Professional Technology for UK Raffle Companies'}
            </p>
            {companyInfo && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {companyInfo.city}, {companyInfo.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${companyInfo.phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {companyInfo.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${companyInfo.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {companyInfo.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/spinner" className="hover:text-white transition-colors">
                  DrawDay Spinner
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-white transition-colors">
                  Live Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Careers{' '}
                  {careers.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                      {careers.length}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {socialMedia
                .filter((profile) => profile.display_in_footer)
                .map((profile) => {
                  const Icon = socialIcons[profile.platform] || null;
                  if (!Icon) return null;

                  return (
                    <a
                      key={profile.id}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={`Follow us on ${profile.platform}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
            </div>

            <div className="text-sm text-center md:text-right">
              <p>
                © {currentYear} {companyInfo?.company_name || 'DrawDay Solutions Ltd'}. All rights
                reserved.
              </p>
              {companyInfo?.registration_number && (
                <p className="text-xs text-gray-500 mt-1">
                  Company Registration: {companyInfo.registration_number} | VAT:{' '}
                  {companyInfo.vat_number}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
