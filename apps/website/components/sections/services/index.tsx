import { ServiceCard } from './service-card';
import { servicesData } from './services-data';
import { SectionHeader } from '@/components/ui/section-header';
import { Container } from '@/components/ui/container';

interface ServicesSectionProps {
  title: string;
  subtitle: string;
}

/**
 * Services section component
 */
export function ServicesSection({ title, subtitle }: ServicesSectionProps) {
  return (
    <section className="py-24 relative" id="services">
      <Container>
        <SectionHeader title={title} subtitle={subtitle} highlightLastWords={2} />
        
        <div className="grid md:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </Container>
    </section>
  );
}