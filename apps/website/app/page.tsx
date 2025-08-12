import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@raffle-spinner/ui';
import { Trophy, Sparkles, Users, FileText, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/10 to-brand-pink/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/20 text-brand-gold-foreground">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Fair, Transparent, Exciting</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-blue to-brand-pink bg-clip-text text-transparent">
            Raffle Winner Spinner
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Turn your live raffles into unforgettable experiences with our professional Chrome extension. 
            Perfect for events, giveaways, and competitions.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="gap-2">
              <Trophy className="w-5 h-5" />
              Install Extension
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need for Live Raffles</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional features designed for seamless live presentations
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-brand-blue/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-brand-blue" />
              </div>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>
                Import participants from CSV with intelligent column mapping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Smart column detection</li>
                <li>• Duplicate ticket handling</li>
                <li>• Save mapping preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-brand-pink/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-brand-pink" />
              </div>
              <CardTitle>60 FPS Animation</CardTitle>
              <CardDescription>
                Smooth slot machine wheel optimized for any screen size
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Handles 5000+ participants</li>
                <li>• Dynamic subset rendering</li>
                <li>• Customizable spin physics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-brand-gold/20 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-brand-gold" />
              </div>
              <CardTitle>Winner Management</CardTitle>
              <CardDescription>
                Track and celebrate winners with professional presentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Winner reveal animation</li>
                <li>• Session history tracking</li>
                <li>• Export winner lists</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-brand-green/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-brand-green" />
              </div>
              <CardTitle>Multi-Competition</CardTitle>
              <CardDescription>
                Manage multiple raffles and switch seamlessly during events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Unlimited competitions</li>
                <li>• Quick switching</li>
                <li>• Separate winner tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-brand-red/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-brand-red" />
              </div>
              <CardTitle>100% Private</CardTitle>
              <CardDescription>
                All data stays local in your browser - no external servers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Chrome storage API</li>
                <li>• No network requests</li>
                <li>• GDPR compliant</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle>Customizable</CardTitle>
              <CardDescription>
                Tailor the experience to match your event's style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Spin duration control</li>
                <li>• Deceleration settings</li>
                <li>• Theme customization</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-brand-blue to-brand-pink text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Raffles?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of event organizers using Raffle Winner Spinner
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" className="gap-2">
                <Trophy className="w-5 h-5" />
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20" asChild>
                <Link href="/docs">Documentation</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}