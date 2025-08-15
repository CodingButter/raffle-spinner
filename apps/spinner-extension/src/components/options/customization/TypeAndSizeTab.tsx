import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Square, RefreshCw, Type } from 'lucide-react';
import type { SpinnerType, SpinnerStyle } from '@raffle-spinner/storage';

interface TypeAndSizeTabProps {
  spinnerType: SpinnerType;
  nameSize: string;
  ticketSize: string;
  onTypeChange: (type: SpinnerType) => void;
  onSizeChange: (field: 'nameSize' | 'ticketSize', size: string) => void;
}

const helpContent = {
  spinnerType: {
    title: 'Spinner Type',
    description: 'Choose the visual style for your raffle spinner',
    details: {
      content:
        'Different spinner types provide unique visual experiences for your audience. Slot Machine offers a classic casino feel, Wheel provides a traditional spinning wheel, and Cards shows a shuffling card effect.',
      tips: [
        'Slot Machine works best for large audiences',
        'Wheel is great for smaller, intimate raffles',
      ],
    },
  },
  textSizes: {
    title: 'Text Sizes',
    description: 'Control the size of participant names and ticket numbers',
    details: {
      content:
        'Adjust text sizes to ensure visibility for your audience. Larger sizes work better for projection or streaming.',
    },
  },
};

export function TypeAndSizeTab({
  spinnerType,
  nameSize,
  ticketSize,
  onTypeChange,
  onSizeChange,
}: TypeAndSizeTabProps) {
  return (
    <div className="space-y-4">
      {/* Spinner Type Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Spinner Type</Label>
          <InfoTooltip {...helpContent.spinnerType} iconSize="sm" />
        </div>
        <Select value={spinnerType} onValueChange={(value) => onTypeChange(value as SpinnerType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slotMachine">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Slot Machine
              </div>
            </SelectItem>
            <SelectItem value="wheel" disabled>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Spinning Wheel (Coming Soon)
              </div>
            </SelectItem>
            <SelectItem value="cards" disabled>
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Card Shuffle (Coming Soon)
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text Size Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          <Label>Text Sizes</Label>
          <InfoTooltip {...helpContent.textSizes} iconSize="sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Name Size</Label>
            <Select value={nameSize} onValueChange={(value) => onSizeChange('nameSize', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Ticket Size</Label>
            <Select value={ticketSize} onValueChange={(value) => onSizeChange('ticketSize', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}