'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@drawday/ui/card';
import { QuickActionCardProps } from './types';

export function QuickActionCard({
  icon,
  title,
  description,
  action,
  content,
  footer,
}: QuickActionCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {content}
        {action}
        {footer && <p className="text-xs text-gray-500 mt-2 text-center">{footer}</p>}
      </CardContent>
    </Card>
  );
}
