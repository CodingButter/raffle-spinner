/**
 * Color Scheme Selector Component
 *
 * Purpose: Allows users to choose between light, dark, or system color schemes
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { ColorScheme } from '@raffle-spinner/storage';

export function ColorSchemeSelector() {
  const { theme, updateColorScheme, effectiveColorScheme } = useTheme();

  const handleSchemeChange = (value: string) => {
    updateColorScheme(value as ColorScheme);
  };

  const helpContent = {
    title: 'Color Scheme',
    description: 'Choose your preferred color mode',
    details: {
      content:
        'Select between light and dark modes, or let the extension follow your system preference. The theme will automatically adjust colors for optimal visibility.',
      tips: [
        'System mode follows your operating system settings',
        'Dark mode reduces eye strain in low-light environments',
        'Light mode provides better readability in bright conditions',
      ],
    },
  };

  const options = [
    {
      value: 'system',
      label: 'System',
      description: 'Follow system preference',
      icon: Monitor,
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Light background with dark text',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Dark background with light text',
      icon: Moon,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {effectiveColorScheme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          Color Scheme
          <InfoTooltip {...helpContent} />
        </CardTitle>
        <CardDescription>
          Choose your preferred color mode
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={theme.colorScheme || 'system'}
          onValueChange={handleSchemeChange}
          className="space-y-4"
        >
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.value} className="flex items-start space-x-3">
                <RadioGroupItem
                  value={option.value}
                  id={`scheme-${option.value}`}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={`scheme-${option.value}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </RadioGroup>
        
        {theme.colorScheme === 'system' && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground">
              Currently using <strong>{effectiveColorScheme}</strong> mode based on your system settings
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}