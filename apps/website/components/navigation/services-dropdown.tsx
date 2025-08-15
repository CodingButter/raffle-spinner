'use client';

import Link from 'next/link';
import { ChevronDown, Monitor, Tv, Code, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const services = [
  {
    href: '/spinner',
    icon: Monitor,
    iconColor: 'purple',
    title: 'DrawDay Spinner',
    description: 'Professional live draw software',
  },
  {
    href: '/streaming',
    icon: Tv,
    iconColor: 'blue',
    title: 'Streaming Production',
    description: 'Professional overlays & graphics',
  },
  {
    href: '/websites',
    icon: Code,
    iconColor: 'green',
    title: 'Custom Websites',
    description: 'Bespoke competition platforms',
  },
];

export function ServicesDropdown() {
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
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
            {services.map((service) => {
              const Icon = service.icon;
              const bgColor = `bg-${service.iconColor}-500/20`;
              const iconColor = `text-${service.iconColor}-400`;

              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className="flex items-start gap-4 p-4 hover:bg-gray-800/50 transition-colors group/item"
                >
                  <div
                    className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white mb-1">{service.title}</div>
                    <div className="text-sm text-gray-400">{service.description}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover/item:text-white mt-3" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
