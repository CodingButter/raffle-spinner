import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@drawday/ui';
import { GradientText } from '@/components/ui/gradient-text';

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

/**
 * CTA (Call to Action) section
 */
export function CTASection({ title, description, buttonText, buttonLink }: CTASectionProps) {
  // Add gradient to question mark if title ends with ?
  const titleParts = title.split('?');
  const mainTitle = titleParts[0];
  const hasQuestionMark = titleParts.length > 1;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          {mainTitle}
          {hasQuestionMark && <GradientText>?</GradientText>}
        </h2>
        <p className="text-xl text-gray-300 mb-8">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={buttonLink}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg"
            >
              {buttonText}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-700 text-white hover:bg-white/10 text-lg"
          >
            Schedule Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
