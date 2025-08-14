import Link from 'next/link';
import { ArrowRight, CheckCircle, LucideIcon } from 'lucide-react';

interface ServiceFeature {
  text: string;
}

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: ServiceFeature[];
  color: 'purple' | 'blue' | 'green';
  href?: string;
  ctaText?: string;
}

const colorConfig = {
  purple: {
    gradient: 'from-purple-900/10 to-purple-900/5',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    bgHover: 'from-purple-600/10',
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    ctaColor: 'text-purple-400 group-hover:text-purple-300',
  },
  blue: {
    gradient: 'from-blue-900/10 to-blue-900/5',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    bgHover: 'from-blue-600/10',
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    ctaColor: 'text-blue-400 group-hover:text-blue-300',
  },
  green: {
    gradient: 'from-green-900/10 to-green-900/5',
    border: 'border-green-500/20 hover:border-green-500/40',
    bgHover: 'from-green-600/10',
    iconBg: 'bg-green-500/20',
    iconText: 'text-green-400',
    ctaColor: 'text-green-400 group-hover:text-green-300',
  },
};

/**
 * Service card component
 */
export function ServiceCard({
  title,
  description,
  icon: Icon,
  features,
  color,
  href,
  ctaText = 'Learn More',
}: ServiceCardProps) {
  const config = colorConfig[color];

  const CardContent = () => (
    <div
      className={`relative bg-gradient-to-br ${config.gradient} border ${config.border} rounded-2xl p-8 transition-all duration-300 h-full`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.bgHover} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`}
      />

      <div className="relative z-10">
        <div
          className={`w-16 h-16 ${config.iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-8 h-8 ${config.iconText}`} />
        </div>

        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-400 mb-6">{description}</p>

        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
              {feature.text}
            </li>
          ))}
        </ul>

        <div className={`flex items-center ${config.ctaColor} transition-colors`}>
          {ctaText}
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group">
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="group cursor-pointer">
      <CardContent />
    </div>
  );
}