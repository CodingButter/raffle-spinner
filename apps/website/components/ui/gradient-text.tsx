/**
 * Gradient text component for consistent styling
 */
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'purple-blue' | 'purple' | 'blue' | 'green';
}

const gradientMap = {
  'purple-blue': 'from-purple-400 to-blue-400',
  purple: 'from-purple-400 to-purple-600',
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
};

export function GradientText({
  children,
  className = '',
  gradient = 'purple-blue',
}: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r ${gradientMap[gradient]} bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
}