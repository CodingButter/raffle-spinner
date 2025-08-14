import { Shield, Sparkles, Zap, Trophy, Users, Monitor, Tv, Code } from 'lucide-react';
import { FeatureCard } from './feature-card';
import { GradientText } from '@/components/ui/gradient-text';

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

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

/**
 * Features section (Why Choose DrawDay)
 */
export function FeaturesSection({ features }: FeaturesSectionProps) {
  const colors: Array<'purple' | 'blue' | 'green' | 'yellow'> = ['purple', 'blue', 'green', 'yellow'];

  return (
    <section className="py-24 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why UK Raffle Companies Choose
            <GradientText> DrawDay</GradientText>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Shield;
            const color = colors[index % colors.length];

            return (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={IconComponent}
                color={color}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}