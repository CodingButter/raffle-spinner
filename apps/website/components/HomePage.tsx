'use client';

import { useState, useEffect } from 'react';
import { Button } from '@raffle-spinner/ui';
import { Card, CardContent } from '@raffle-spinner/ui';
import {
  Trophy,
  Zap,
  Shield,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Play,
  Download,
  Star,
  Clock,
  Sparkles,
  TrendingUp,
  Award,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { DemoCarousel } from '@/components/DemoCarousel';
import type { DemoAsset } from '@/lib/get-demo-assets';

// Animated counter component
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
}

interface HomePageProps {
  demoAssets: DemoAsset[];
}

export default function HomePage({ demoAssets }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative px-4 py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/5 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <div className="relative max-w-7xl mx-auto">
          {/* Trust badges */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              UK Compliant
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4 text-blue-500" />
              Secure & Private
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="w-4 h-4 text-brand-gold" />
              Industry Leading
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Run{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-pink">
                Fair & Exciting
              </span>{' '}
              Raffles
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              DrawDay Spinner - The professional Chrome extension trusted by UK competition operators
              to deliver transparent, engaging live draws that build customer trust
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              <Button
                size="lg"
                className="gap-2 text-lg px-8 py-6"
                onClick={() => {
                  confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                  });
                  // Open Chrome Web Store
                  const chromeStoreUrl = 'https://chrome.google.com/webstore';
                  window.open(chromeStoreUrl, '_blank');
                }}
              >
                <Download className="w-5 h-5" />
                Install Free Extension
              </Button>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                  Watch Live Demo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex justify-center items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-pink border-2 border-background"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                Join <span className="font-semibold text-foreground">500+</span> UK operators
              </span>
            </div>
          </div>

          {/* Hero Image/Animation with Carousel */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">See It In Action</h2>
                <p className="text-muted-foreground mb-6">
                  Experience the power of professional raffle management
                </p>
              </div>

              {/* Demo Carousel */}
              <DemoCarousel assets={demoAssets} className="max-w-5xl mx-auto" />

              {/* CTA Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <Link href="/demo">
                  <Button size="lg" className="gap-2">
                    <Play className="w-4 h-4" />
                    Try Interactive Demo
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    const chromeStoreUrl = 'https://chrome.google.com/webstore';
                    window.open(chromeStoreUrl, '_blank');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Get Extension
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">
                <AnimatedCounter target={50000} />+
              </div>
              <p className="text-muted-foreground mt-2">Raffles Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">
                <AnimatedCounter target={500} />+
              </div>
              <p className="text-muted-foreground mt-2">UK Operators</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">
                <AnimatedCounter target={99} />
                .9%
              </div>
              <p className="text-muted-foreground mt-2">Uptime</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">
                <AnimatedCounter target={5} />⭐
              </div>
              <p className="text-muted-foreground mt-2">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points & Solutions */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for UK Competition Operators
            </h2>
            <p className="text-xl text-muted-foreground">
              Solve your biggest raffle challenges with one simple extension
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-blue/20 to-transparent rounded-bl-full" />
              <CardContent className="p-6 relative">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-brand-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Build Customer Trust</h3>
                <p className="text-muted-foreground mb-4">
                  Show transparent, verifiable draws that prove fairness and eliminate doubts
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Visual proof of random selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Session winner history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>UK Gambling Commission compliant</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-bl-full" />
              <CardContent className="p-6 relative">
                <div className="w-12 h-12 bg-brand-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-brand-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create Excitement</h3>
                <p className="text-muted-foreground mb-4">
                  Turn boring number draws into thrilling moments that keep audiences engaged
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Cinema-quality animations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Customizable spin duration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Winner celebration effects</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-pink/20 to-transparent rounded-bl-full" />
              <CardContent className="p-6 relative">
                <div className="w-12 h-12 bg-brand-pink/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-brand-pink" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Save Hours Weekly</h3>
                <p className="text-muted-foreground mb-4">
                  Import CSVs in seconds and run professional draws without technical hassle
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Smart CSV column mapping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Handles 5000+ entries smoothly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>No software installation needed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Competition Operators
            </h2>
            <p className="text-xl text-muted-foreground">
              See why operators choose DrawDay Spinner
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Game changer for our weekly draws. Customers love watching the live spins, and we've seen trust scores improve by 40%.",
                author: 'Sarah Mitchell',
                role: 'Operations Director',
                company: 'UK Competitions Ltd',
              },
              {
                quote:
                  'Finally, a tool that makes our raffles look as professional as the big operators. Worth every penny.',
                author: 'James Wilson',
                role: 'Owner',
                company: 'Premium Prize Draws',
              },
              {
                quote:
                  'Cut our draw processing time from hours to minutes. The CSV import is brilliant - it just works!',
                author: 'Emma Thompson',
                role: 'Competition Manager',
                company: 'Lucky Winners UK',
              },
            ].map((testimonial, i) => (
              <Card key={i} className="relative">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* UK Compliance Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-brand-blue to-brand-pink rounded-2xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">100% UK Compliant</h2>
                <p className="text-white/90 mb-6">
                  Built specifically for UK competition operators. Stay compliant with Gambling
                  Commission regulations while delivering exceptional customer experiences.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Transparent draw process with full audit trail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Session-based winner tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Secure local data processing</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                  <Shield className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-2xl font-bold">UK Compliant</p>
                  <p className="text-white/80">Gambling Commission Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-card">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Is this really free?',
                a: 'Yes! The core features are 100% free forever. We believe every operator should have access to professional raffle tools.',
              },
              {
                q: 'How many participants can it handle?',
                a: 'Tested with 5000+ entries running at smooth 60fps. Most operators run raffles with 100-2000 entries without any issues.',
              },
              {
                q: 'Do I need technical knowledge?',
                a: "Not at all! If you can upload a CSV file, you can run professional raffles. It's that simple.",
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. All data is processed locally in your browser. Nothing is sent to external servers.',
              },
              {
                q: 'Can I customize the appearance?',
                a: 'Yes! Add your logo, company colors, and branding to match your business identity.',
              },
            ].map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Run Professional Raffles?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of UK operators already using DrawDay Spinner
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => {
                const chromeStoreUrl = 'https://chrome.google.com/webstore';
                window.open(chromeStoreUrl, '_blank');
              }}
            >
              <Download className="w-5 h-5" />
              Install Extension Now
            </Button>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="gap-2">
                Try Demo First
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="font-bold text-xl mb-4">DrawDay Spinner</h3>
              <p className="text-sm text-muted-foreground">
                The professional raffle management tool for UK competition operators.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/demo" className="hover:text-foreground">
                    Live Demo
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-foreground">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#faq" className="hover:text-foreground">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="mailto:support@drawday.app" className="hover:text-foreground">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    UK Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 DrawDay. Built with ❤️ for UK competition operators.</p>
            <p className="mt-2">
              Not affiliated with Chrome or Google. Chrome is a trademark of Google LLC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
