/**
 * Column Selectors Component
 * Renders column selection dropdowns based on name format
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ColumnMapping } from '@raffle-spinner/storage';

interface ColumnSelectorsProps {
  headers: string[];
  mapping: Partial<ColumnMapping>;
  useFullName: boolean;
  onMappingChange: (mapping: Partial<ColumnMapping>) => void;
}

export function ColumnSelectors({
  headers,
  mapping,
  useFullName,
  onMappingChange,
}: ColumnSelectorsProps) {
  return (
    <>
      {useFullName ? (
        <div className="space-y-2">
          <Label htmlFor="fullNameColumn">Full Name Column</Label>
          <Select
            value={mapping.fullName || ''}
            onValueChange={(value) => onMappingChange({ ...mapping, fullName: value })}
          >
            <SelectTrigger id="fullNameColumn">
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Names will be automatically split. Supports &quot;First Last&quot;, &quot;Last,
            First&quot;, and multi-word names.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name Column</Label>
            <Select
              value={mapping.firstName || ''}
              onValueChange={(value) => onMappingChange({ ...mapping, firstName: value })}
            >
              <SelectTrigger id="firstName">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name Column</Label>
            <Select
              value={mapping.lastName || ''}
              onValueChange={(value) => onMappingChange({ ...mapping, lastName: value })}
            >
              <SelectTrigger id="lastName">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="ticketNumber">Ticket Number Column</Label>
        <Select
          value={mapping.ticketNumber || ''}
          onValueChange={(value) => onMappingChange({ ...mapping, ticketNumber: value })}
        >
          <SelectTrigger id="ticketNumber">
            <SelectValue placeholder="Select a column" />
          </SelectTrigger>
          <SelectContent>
            {headers.map((header) => (
              <SelectItem key={header} value={header}>
                {header}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
