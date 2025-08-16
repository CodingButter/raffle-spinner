/**
 * Name Format Selector Component
 * Toggles between full name and separate name columns
 */

import React from 'react';
import { Label } from '@/components/ui/label';

interface NameFormatSelectorProps {
  useFullName: boolean;
  onFormatChange: (useFullName: boolean) => void;
}

export function NameFormatSelector({ useFullName, onFormatChange }: NameFormatSelectorProps) {
  return (
    <>
      <div className="flex items-center space-x-2 pb-2 border-b">
        <input
          type="radio"
          id="separateNames"
          name="nameFormat"
          checked={!useFullName}
          onChange={() => onFormatChange(false)}
          className="h-4 w-4"
        />
        <Label htmlFor="separateNames" className="font-normal cursor-pointer">
          Separate first and last name columns
        </Label>
      </div>

      <div className="flex items-center space-x-2 pb-2 border-b">
        <input
          type="radio"
          id="fullName"
          name="nameFormat"
          checked={useFullName}
          onChange={() => onFormatChange(true)}
          className="h-4 w-4"
        />
        <Label htmlFor="fullName" className="font-normal cursor-pointer">
          Single column with full names
        </Label>
      </div>
    </>
  );
}
