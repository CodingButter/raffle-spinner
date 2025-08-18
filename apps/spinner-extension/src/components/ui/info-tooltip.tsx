/**
 * Info Tooltip Component
 *
 * Purpose: Provides contextual help information with tooltips and optional modal dialogs
 * for detailed explanations of configuration options.
 */

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  title?: string;
  description?: string;
  content?: string; // Simple content alternative
  details?: {
    content: string | React.ReactNode;
    examples?: string[];
    tips?: string[];
    warnings?: string[];
  };
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}

export function InfoTooltip({
  title,
  description,
  content,
  details,
  className,
  iconSize = 'sm',
}: InfoTooltipProps) {
  // Use content as simple description if provided
  const tooltipTitle = title || 'Help';
  const tooltipDescription = content || description || '';
  const [showModal, setShowModal] = React.useState(false);

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={details ? () => setShowModal(true) : undefined}
              className={cn(
                'inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-brand-blue transition-colors',
                details && 'cursor-pointer hover:bg-muted',
                !details && 'cursor-help',
                className
              )}
              aria-label={`Help: ${tooltipTitle}`}
            >
              <HelpCircle className={iconSizes[iconSize]} />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            {title && <p className="font-semibold mb-1">{tooltipTitle}</p>}
            <p className="text-sm">{tooltipDescription}</p>
            {details && (
              <p className="text-xs text-brand-blue mt-2 font-medium">Click for more details →</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {details && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-brand-blue" />
                {title}
              </DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {typeof details.content === 'string' ? (
                <div className="prose prose-sm max-w-none">
                  <p>{details.content}</p>
                </div>
              ) : (
                details.content
              )}

              {details.examples && details.examples.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="text-brand-blue">📋</span> Examples
                  </h4>
                  <ul className="space-y-1">
                    {details.examples.map((example, index) => (
                      <li key={index} className="text-sm pl-6 relative">
                        <span className="absolute left-2 text-muted-foreground">•</span>
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">{example}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {details.tips && details.tips.length > 0 && (
                <div className="space-y-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="text-brand-green">💡</span> Pro Tips
                  </h4>
                  <ul className="space-y-1">
                    {details.tips.map((tip, index) => (
                      <li key={index} className="text-sm pl-6 relative">
                        <span className="absolute left-2 text-brand-green">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {details.warnings && details.warnings.length > 0 && (
                <div className="space-y-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="text-destructive">⚠️</span> Important Notes
                  </h4>
                  <ul className="space-y-1">
                    {details.warnings.map((warning, index) => (
                      <li key={index} className="text-sm pl-6 relative text-destructive">
                        <span className="absolute left-2">!</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
