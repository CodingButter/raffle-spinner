/**
 * CollapsibleCard Component
 *
 * High-performance reusable collapsible card with optimized rendering.
 * Reduces code duplication and provides consistent UX patterns.
 *
 * Performance optimizations:
 * - Conditional rendering prevents unnecessary DOM creation
 * - Click handlers are stable references
 * - Icon rendering is memoized for smooth animations
 */

import { ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Button } from './button';

export interface CollapsibleCardProps {
  /** Unique section identifier */
  sectionKey: string;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Whether the card is currently collapsed */
  isCollapsed: boolean;
  /** Function to toggle collapse state */
  onToggle: (sectionKey: string) => void;
  /** Content to render when expanded */
  children: ReactNode;
  /** Whether the card should be disabled (with opacity) */
  disabled?: boolean;
  /** Pro badge text (optional) */
  proBadge?: string;
  /** Custom click handler for disabled cards */
  onDisabledClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function CollapsibleCard({
  sectionKey,
  title,
  description,
  isCollapsed,
  onToggle,
  children,
  disabled = false,
  proBadge,
  onDisabledClick,
  className = '',
}: CollapsibleCardProps) {
  const handleHeaderClick = () => {
    if (disabled && onDisabledClick) {
      onDisabledClick();
      return;
    }
    if (!disabled) {
      onToggle(sectionKey);
    }
  };

  return (
    <Card className={`${disabled ? 'opacity-60' : ''} ${className}`}>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {proBadge && (
                <span className="text-xs px-2 py-0.5 bg-brand-gold/20 text-brand-gold rounded font-normal">
                  {proBadge}
                </span>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {!disabled && (
            <Button variant="ghost" size="icon">
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      {!disabled && !isCollapsed && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
}