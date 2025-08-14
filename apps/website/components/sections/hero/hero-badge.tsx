import { Sparkles } from 'lucide-react';

/**
 * Hero section badge component
 */
export function HeroBadge() {
  return (
    <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm">
      <Sparkles className="w-4 h-4" />
      Trusted by UK's Leading Raffle Companies
    </div>
  );
}