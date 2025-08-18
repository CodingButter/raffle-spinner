import { GradientText } from './gradient-text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  highlightLastWords?: number;
  centered?: boolean;
}

/**
 * Reusable section header component
 */
export function SectionHeader({
  title,
  subtitle,
  highlightLastWords = 0,
  centered = true,
}: SectionHeaderProps) {
  let titleElement;

  if (highlightLastWords > 0) {
    const words = title.split(' ');
    const mainTitle = words.slice(0, -highlightLastWords).join(' ');
    const highlighted = words.slice(-highlightLastWords).join(' ');

    titleElement = (
      <>
        {mainTitle}
        <GradientText> {highlighted}</GradientText>
      </>
    );
  } else {
    titleElement = title;
  }

  return (
    <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-4xl md:text-5xl font-bold mb-4">{titleElement}</h2>
      {subtitle && (
        <p className={`text-xl text-gray-400 ${centered ? 'max-w-2xl mx-auto' : ''}`}>{subtitle}</p>
      )}
    </div>
  );
}
