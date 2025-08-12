/**
 * Features Section Component
 * 
 * Displays a grid of feature cards showcasing the product's capabilities
 */

import { FileText, Zap, Trophy, Users, Shield, Sparkles } from 'lucide-react';
import { FeatureCard, FeatureCardProps } from './feature-card';

/**
 * Feature data configuration
 * Defines all features to be displayed in the section
 */
const FEATURES: FeatureCardProps[] = [
  {
    icon: FileText,
    iconColorClass: 'bg-brand-blue/20 text-brand-blue',
    title: 'CSV Import',
    description: 'Import participants from CSV with intelligent column mapping',
    features: [
      'Smart column detection',
      'Duplicate ticket handling',
      'Save mapping preferences'
    ]
  },
  {
    icon: Zap,
    iconColorClass: 'bg-brand-pink/20 text-brand-pink',
    title: '60 FPS Animation',
    description: 'Smooth slot machine wheel optimized for any screen size',
    features: [
      'Handles 5000+ participants',
      'Dynamic subset rendering',
      'Customizable spin physics'
    ]
  },
  {
    icon: Trophy,
    iconColorClass: 'bg-brand-gold/20 text-brand-gold',
    title: 'Winner Management',
    description: 'Track and celebrate winners with professional presentation',
    features: [
      'Winner reveal animation',
      'Session history tracking',
      'Export winner lists'
    ]
  },
  {
    icon: Users,
    iconColorClass: 'bg-brand-green/20 text-brand-green',
    title: 'Multi-Competition',
    description: 'Manage multiple raffles and switch seamlessly during events',
    features: [
      'Unlimited competitions',
      'Quick switching',
      'Separate winner tracking'
    ]
  },
  {
    icon: Shield,
    iconColorClass: 'bg-brand-red/20 text-brand-red',
    title: '100% Private',
    description: 'All data stays local in your browser - no external servers',
    features: [
      'Chrome storage API',
      'No network requests',
      'GDPR compliant'
    ]
  },
  {
    icon: Sparkles,
    iconColorClass: 'bg-accent/20 text-accent-foreground',
    title: 'Customizable',
    description: "Tailor the experience to match your event's style",
    features: [
      'Spin duration control',
      'Deceleration settings',
      'Theme customization'
    ]
  }
];

/**
 * Section header component
 * Displays the section title and description
 */
function SectionHeader() {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-4">Everything You Need for Live Raffles</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Professional features designed for seamless live presentations
      </p>
    </div>
  );
}

/**
 * Feature grid component
 * Renders the grid of feature cards
 */
function FeatureGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {FEATURES.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
}

/**
 * Main Features Section Component
 * Combines header and feature grid
 */
export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <SectionHeader />
      <FeatureGrid />
    </section>
  );
}