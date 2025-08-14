/**
 * Features Page - Comprehensive feature showcase
 *
 * Displays all features of the DrawDay Spinner extension
 */

import {
  Shuffle,
  Trophy,
  Users,
  FileSpreadsheet,
  Palette,
  Shield,
  Clock,
  Zap,
  Download,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Settings,
  Globe,
  Sparkles,
  Lock,
  RefreshCw,
  Eye,
  Heart,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@drawday/ui';
import Link from 'next/link';

const features = [
  {
    icon: Shuffle,
    title: 'Professional Slot Machine Spinner',
    description: 'Cinema-quality animations with physics-based motion that captivates audiences',
    highlights: [
      'Smooth 60fps animations',
      'Customizable spin duration',
      'Winner celebration effects',
      'Pre-calculated fair results',
    ],
  },
  {
    icon: FileSpreadsheet,
    title: 'Smart CSV Import',
    description: 'Import participant data in seconds with intelligent column mapping',
    highlights: [
      'Auto-detects column headers',
      'Handles duplicate checking',
      'Supports 5000+ entries',
      'Flexible data formats',
    ],
  },
  {
    icon: Users,
    title: 'Competition Management',
    description: 'Organize multiple competitions and track winners across sessions',
    highlights: [
      'Unlimited competitions',
      'Session winner history',
      'Export winner reports',
      'Quick competition switching',
    ],
  },
  {
    icon: Palette,
    title: 'Custom Branding',
    description: 'Match your business identity with full customization options',
    highlights: ['Upload your logo', 'Custom color schemes', 'Font selection', 'Position controls'],
  },
  {
    icon: Shield,
    title: '100% Privacy Focused',
    description: 'All data stays local in your browser - no external servers',
    highlights: [
      'Local data processing',
      'No cloud storage',
      'GDPR compliant',
      'Zero data collection',
    ],
  },
  {
    icon: Zap,
    title: 'Lightning Performance',
    description: 'Optimized for speed with intelligent rendering techniques',
    highlights: [
      'Subset swapping algorithm',
      'Handles large datasets',
      'Instant load times',
      'Minimal resource usage',
    ],
  },
];

const comparisonData = [
  { feature: 'Live Animation', drawday: true, manual: false, basic: false },
  { feature: 'CSV Import', drawday: true, manual: false, basic: true },
  { feature: 'Custom Branding', drawday: true, manual: false, basic: false },
  { feature: 'Winner History', drawday: true, manual: true, basic: false },
  { feature: 'No Setup Required', drawday: true, manual: true, basic: false },
  { feature: 'Handles 5000+ Entries', drawday: true, manual: false, basic: false },
  { feature: 'Professional Appearance', drawday: true, manual: false, basic: false },
  { feature: 'Free Forever', drawday: true, manual: true, basic: false },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Everything You Need for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-drawday-gold to-amber">
              Professional Raffles
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            DrawDay Spinner combines powerful features with simplicity. Run professional live draws
            that build trust and excitement.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-5 h-5" />
                Install Extension
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/demo">
                Try Demo
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-xl text-muted-foreground">
              Built specifically for UK competition operators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-drawday-gold/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-drawday-gold" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald mt-0.5" />
                          <span className="text-sm">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="px-4 py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Even More Features</h2>
            <p className="text-xl text-muted-foreground">
              Every detail designed for the best raffle experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: 'Analytics Ready', desc: 'Track participation trends' },
              { icon: Settings, title: 'Flexible Settings', desc: 'Customize every aspect' },
              { icon: Globe, title: 'Multi-language', desc: 'Support for UK & EU' },
              { icon: Sparkles, title: 'Effects Library', desc: 'Celebration animations' },
              { icon: Lock, title: 'Secure Storage', desc: 'Encrypted local data' },
              { icon: RefreshCw, title: 'Auto-save', desc: 'Never lose your work' },
              { icon: Eye, title: 'Preview Mode', desc: 'Test before going live' },
              { icon: Heart, title: 'Customer Support', desc: 'Help when you need it' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-drawday-gold/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-drawday-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose DrawDay?</h2>
            <p className="text-xl text-muted-foreground">See how we compare to other methods</p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Feature</th>
                      <th className="text-center p-4 bg-drawday-gold/10">
                        <div className="font-bold text-drawday-gold">DrawDay</div>
                      </th>
                      <th className="text-center p-4">
                        <div className="text-muted-foreground">Manual Draw</div>
                      </th>
                      <th className="text-center p-4">
                        <div className="text-muted-foreground">Basic Tools</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row) => (
                      <tr key={row.feature} className="border-b">
                        <td className="p-4">{row.feature}</td>
                        <td className="text-center p-4 bg-drawday-gold/5">
                          {row.drawday ? (
                            <CheckCircle className="w-5 h-5 text-emerald mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="text-center p-4">
                          {row.manual ? (
                            <CheckCircle className="w-5 h-5 text-emerald mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="text-center p-4">
                          {row.basic ? (
                            <CheckCircle className="w-5 h-5 text-emerald mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-drawday-navy to-rich-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Raffles?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join hundreds of UK operators already using DrawDay Spinner
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-5 h-5" />
                Install Now - It's Free
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
              asChild
            >
              <Link href="/demo">
                Watch Demo
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
