/**
 * Label Component
 * 
 * A label element styled for form fields with proper accessibility.
 * Built on top of Radix UI's Label primitive.
 * 
 * @example
 * ```tsx
 * <Label htmlFor="email">Email</Label>
 * <Label>
 *   <Checkbox /> Accept terms
 * </Label>
 * ```
 */

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * Label variants using class-variance-authority
 * Provides consistent styling with optional variants
 */
const labelVariants = cva(
  // Base styles for all labels
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

/**
 * Label component that wraps Radix UI Label
 * Provides consistent styling and accessibility features
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };