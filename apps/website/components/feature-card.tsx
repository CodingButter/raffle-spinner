/**
 * Feature Card Component
 * 
 * A reusable card component for displaying product features
 * with an icon, title, description, and feature list.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@raffle-spinner/ui';
import { LucideIcon } from 'lucide-react';

/**
 * Feature card icon component
 * Displays the feature icon with themed background
 */
interface FeatureIconProps {
  icon: LucideIcon;
  colorClass: string;
}

function FeatureIcon({ icon: Icon, colorClass }: FeatureIconProps) {
  return (
    <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6" />
    </div>
  );
}

/**
 * Feature list component
 * Displays a bulleted list of feature highlights
 */
interface FeatureListProps {
  items: string[];
}

function FeatureList({ items }: FeatureListProps) {
  return (
    <ul className="text-sm text-muted-foreground space-y-2">
      {items.map((item, index) => (
        <li key={index}>• {item}</li>
      ))}
    </ul>
  );
}

/**
 * Main Feature Card Component
 * Combines icon, title, description, and feature list
 */
export interface FeatureCardProps {
  icon: LucideIcon;
  iconColorClass: string;
  title: string;
  description: string;
  features: string[];
}

export function FeatureCard({ 
  icon, 
  iconColorClass, 
  title, 
  description, 
  features 
}: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <FeatureIcon icon={icon} colorClass={iconColorClass} />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <FeatureList items={features} />
      </CardContent>
    </Card>
  );
}