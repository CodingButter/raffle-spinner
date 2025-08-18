/**
 * CollapsibleSection Component
 *
 * Purpose: Reusable collapsible card section with consistent UX
 * Performance: Prevents unnecessary renders with React.memo
 *
 * Usage: Configuration pages, settings panels
 */

import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  description: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  disabledClick?: () => void;
  proFeature?: boolean;
  className?: string;
}

export const CollapsibleSection = React.memo(function CollapsibleSection({
  title,
  description,
  isCollapsed,
  onToggle,
  children,
  disabled = false,
  disabledClick,
  proFeature = false,
  className = '',
}: CollapsibleSectionProps) {
  const handleClick = () => {
    if (disabled && disabledClick) {
      disabledClick();
    } else if (!disabled) {
      onToggle();
    }
  };

  return (
    <Card className={`${disabled ? 'opacity-60' : ''} ${className}`}>
      <CardHeader className="cursor-pointer select-none" onClick={handleClick}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {proFeature && (
                <span className="text-xs px-2 py-0.5 bg-brand-gold/20 text-brand-gold rounded font-normal">
                  PRO
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
      {!disabled && !isCollapsed && <CardContent>{children}</CardContent>}
    </Card>
  );
});