/**
 * Input Component
 * 
 * A styled input field component that extends native HTML input
 * with consistent theming and accessibility features.
 * 
 * @example
 * ```tsx
 * <Input type="email" placeholder="Email" />
 * <Input disabled />
 * <Input className="w-full" />
 * ```
 */

import * as React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input component with Raffle Spinner theming
 * Forwards ref to allow parent components to access the input element
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-10 w-full rounded-md border border-input bg-input px-3 py-2',
          // Typography
          'text-base',
          // Ring focus styles
          'ring-offset-background',
          // Placeholder styles
          'placeholder:text-muted-foreground',
          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Disabled styles
          'disabled:cursor-not-allowed disabled:opacity-50',
          // File input specific styles
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          // Allow custom classes to override
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };