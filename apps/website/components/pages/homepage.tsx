/**
 * Modular Homepage Component
 * 
 * Composes all homepage sections together
 */

import { HeroSection } from '@/components/sections/hero';
import { ServicesSection } from '@/components/sections/services';
import { FeaturesSection } from '@/components/sections/features';
import { ClientsSection } from '@/components/sections/clients';
import { CTASection } from '@/components/sections/cta';
import type { HomepageContent } from '@/lib/directus';

interface HomepageProps {
  content: HomepageContent;
}

export function Homepage({ content }: HomepageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection
        title={content.hero_title}
        subtitle={content.hero_subtitle}
        ctaLink={content.hero_cta_link}
        ctaText={content.hero_cta_text}
      />
      
      <ServicesSection
        title={content.features_title}
        subtitle={content.features_subtitle}
      />
      
      <FeaturesSection
        features={content.features_list || []}
      />
      
      <ClientsSection />
      
      <CTASection
        title={content.cta_title}
        description={content.cta_description}
        buttonText={content.cta_button_text}
        buttonLink={content.cta_button_link}
      />
    </div>
  );
}