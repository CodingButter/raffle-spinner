import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'purple' | 'blue' | 'green' | 'yellow';
}

const colorConfig = {
  purple: {
    bg: 'from-purple-500/20 to-purple-500/10',
    icon: 'text-purple-400',
  },
  blue: {
    bg: 'from-blue-500/20 to-blue-500/10',
    icon: 'text-blue-400',
  },
  green: {
    bg: 'from-green-500/20 to-green-500/10',
    icon: 'text-green-400',
  },
  yellow: {
    bg: 'from-yellow-500/20 to-yellow-500/10',
    icon: 'text-yellow-400',
  },
};

/**
 * Feature card component for Why Choose section
 */
export function FeatureCard({ title, description, icon: Icon, color }: FeatureCardProps) {
  const config = colorConfig[color];

  return (
    <div className="text-center group">
      <div
        className={`w-20 h-20 bg-gradient-to-br ${config.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
      >
        <Icon className={`w-10 h-10 ${config.icon}`} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
