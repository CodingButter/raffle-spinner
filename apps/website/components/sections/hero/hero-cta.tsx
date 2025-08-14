import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@drawday/ui';

interface HeroCTAProps {
  primaryLink: string;
  primaryText: string;
}

/**
 * Hero section CTA buttons
 */
export function HeroCTA({ primaryLink, primaryText }: HeroCTAProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      <Link href={primaryLink}>
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-purple-500/25"
        >
          {primaryText}
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
  );
}
