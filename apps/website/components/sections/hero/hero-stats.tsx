import { GradientText } from '@/components/ui/gradient-text';

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '50+', label: 'Raffle Companies Served' },
  { value: '£10M+', label: 'Prizes Drawn' },
  { value: '100K+', label: 'Live Viewers' },
];

/**
 * Hero section stats component
 */
export function HeroStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl font-bold">
            <GradientText>{stat.value}</GradientText>
          </div>
          <div className="text-gray-400 mt-2">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
