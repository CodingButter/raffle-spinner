/**
 * SpinControls Component
 * 
 * Purpose: Handles ticket input and spin button interaction
 * Extracted from SidePanelWithPersistence.tsx to maintain file size limits
 * 
 * Architecture Decision:
 * - Isolated input control logic
 * - Clear prop interface for parent communication
 * - Reusable across different spinner implementations
 */
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SpinControlsProps {
  ticketNumber: string;
  isSpinning: boolean;
  error: string | null;
  onTicketChange: (value: string) => void;
  onSpin: () => void;
}

export function SpinControls({
  ticketNumber,
  isSpinning,
  error,
  onTicketChange,
  onSpin,
}: SpinControlsProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter ticket number"
          value={ticketNumber}
          onChange={(e) => onTicketChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isSpinning && onSpin()}
          disabled={isSpinning}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button
          onClick={onSpin}
          disabled={isSpinning || !ticketNumber}
          size="lg"
          className="min-w-[120px]"
        >
          {isSpinning ? 'Spinning...' : 'Spin'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}