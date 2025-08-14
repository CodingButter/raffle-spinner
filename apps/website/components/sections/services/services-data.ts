import { Monitor, Tv, Code } from 'lucide-react';

export const servicesData = [
  {
    title: 'DrawDay Spinner',
    description:
      'Professional live draw software with stunning animations, handling 5000+ entries at 60fps. Chrome extension for seamless integration.',
    icon: Monitor,
    color: 'purple' as const,
    href: '/spinner',
    features: [
      { text: 'Slot machine animations' },
      { text: 'CSV import with smart mapping' },
      { text: 'Custom branding & themes' },
    ],
    ctaText: 'Learn More',
  },
  {
    title: 'Streaming Production',
    description:
      'Professional streaming overlays, graphics, and production tools. Make your live draws look broadcast-quality on any platform.',
    icon: Tv,
    color: 'blue' as const,
    features: [
      { text: 'Custom OBS overlays' },
      { text: 'Animated graphics & transitions' },
      { text: 'Multi-camera setup support' },
    ],
    ctaText: 'Coming Soon',
  },
  {
    title: 'Custom Websites',
    description:
      'Bespoke competition websites built for conversion. Fast, secure, and optimized for selling tickets and building trust.',
    icon: Code,
    color: 'green' as const,
    features: [
      { text: 'Payment integration' },
      { text: 'Mobile-first design' },
      { text: 'Competition management CMS' },
    ],
    ctaText: 'Get Quote',
  },
];
