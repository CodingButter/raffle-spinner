/**
 * DrawDay Solutions Homepage - Server Component
 * 
 * Fetches content from Directus CMS and renders the homepage
 */

import Link from 'next/link';
import { ArrowRight, Monitor, Tv, Code, Trophy, Users, Zap, Shield, Play, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@raffle-spinner/ui';
import { directus, defaultContent } from '@/lib/directus';
import type { HomepageContent } from '@/lib/directus';

// Icon mapping for dynamic icons from CMS
const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  zap: Zap,
  shield: Shield,
  trophy: Trophy,
  monitor: Monitor,
  tv: Tv,
  code: Code,
  users: Users,
};

export default async function DrawDayHomePageServer() {
  // Fetch content from Directus or use defaults
  const content = await directus.getHomepage() || defaultContent.homepage;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-[128px] opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[128px] opacity-20 animate-pulse delay-1000" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm">
            <Sparkles className="w-4 h-4" />
            Trusted by UK's Leading Raffle Companies
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            {content.hero_title}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {content.hero_subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={content.hero_cta_link}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-purple-500/25"
              >
                {content.hero_cta_text}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-700 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">50+</div>
              <div className="text-gray-400 mt-2">Raffle Companies Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">£10M+</div>
              <div className="text-gray-400 mt-2">Prizes Drawn</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">100K+</div>
              <div className="text-gray-400 mt-2">Live Viewers</div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-600 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {content.features_title.split(' ').slice(0, -2).join(' ')} 
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> {content.features_title.split(' ').slice(-2).join(' ')}</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {content.features_subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Spinner Software */}
            <Link href="/spinner" className="group">
              <div className="relative bg-gradient-to-br from-purple-900/10 to-purple-900/5 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Monitor className="w-8 h-8 text-purple-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">DrawDay Spinner</h3>
                  <p className="text-gray-400 mb-6">
                    Professional live draw software with stunning animations, handling 5000+ entries at 60fps. 
                    Chrome extension for seamless integration.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      Slot machine animations
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      CSV import with smart mapping
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      Custom branding & themes
                    </li>
                  </ul>
                  
                  <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                    Learn More 
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Streaming Production */}
            <div className="group cursor-pointer">
              <div className="relative bg-gradient-to-br from-blue-900/10 to-blue-900/5 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Tv className="w-8 h-8 text-blue-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">Streaming Production</h3>
                  <p className="text-gray-400 mb-6">
                    Professional streaming overlays, graphics, and production tools. 
                    Make your live draws look broadcast-quality on any platform.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      Custom OBS overlays
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      Animated graphics & transitions
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      Multi-camera setup support
                    </li>
                  </ul>
                  
                  <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                    Coming Soon
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Custom Websites */}
            <div className="group cursor-pointer">
              <div className="relative bg-gradient-to-br from-green-900/10 to-green-900/5 border border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition-all duration-300 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Code className="w-8 h-8 text-green-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">Custom Websites</h3>
                  <p className="text-gray-400 mb-6">
                    Bespoke competition websites built for conversion. 
                    Fast, secure, and optimized for selling tickets and building trust.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      Payment integration
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      Mobile-first design
                    </li>
                    <li className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                      Competition management CMS
                    </li>
                  </ul>
                  
                  <div className="flex items-center text-green-400 group-hover:text-green-300 transition-colors">
                    Get Quote
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose DrawDay - Dynamic Features */}
      <section className="py-24 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why UK Raffle Companies Choose
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> DrawDay</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features_list.map((feature, index) => {
              const IconComponent = iconMap[feature.icon] || Shield;
              const colors = ['purple', 'blue', 'green', 'yellow'];
              const color = colors[index % colors.length];
              
              return (
                <div key={index} className="text-center group">
                  <div className={`w-20 h-20 bg-gradient-to-br from-${color}-500/20 to-${color}-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`w-10 h-10 text-${color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Client Logos */}
      <section className="py-16 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 mb-8">Trusted by leading UK competition platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['Rev Comps', 'Dream Car Giveaways', 'Elite Competitions', 'Lucky Day Competitions', 'Prestige Prizes'].map((company) => (
              <div key={company} className="text-xl font-bold text-gray-500">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content.cta_title.split('?')[0]}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {content.cta_description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={content.cta_button_link}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl"
              >
                {content.cta_button_text}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-700 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}