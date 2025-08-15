/**
 * Keyboard Shortcuts Help Modal
 *
 * Purpose: Display all available keyboard shortcuts in a help modal for user reference.
 * Shows shortcuts organized by category with clear descriptions.
 *
 * SRS Reference:
 * - UX-3.1: Keyboard Navigation and Accessibility
 * - FR-2.1: Side Panel Interface Enhancement
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard, Zap, Navigation, Settings2, RotateCcw } from 'lucide-react';
import { 
  getShortcutsByCategory, 
  formatKeyForDisplay, 
  SHORTCUT_CATEGORIES,
  type KeyboardShortcut
} from '@/constants/keyboard-shortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryIcons = {
  spinner: Zap,
  navigation: Navigation,
  session: RotateCcw,
  system: Settings2,
};

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const shortcutsByCategory = getShortcutsByCategory();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to quickly control the spinner during live draws.
            Shortcuts are disabled when typing in input fields.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => {
            const Icon = CategoryIcons[category as keyof typeof CategoryIcons];
            
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {SHORTCUT_CATEGORIES[category as keyof typeof SHORTCUT_CATEGORIES]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut: KeyboardShortcut) => (
                      <div
                        key={`${shortcut.key}-${shortcut.action}`}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors"
                      >
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className="font-mono text-xs px-2 py-1 min-w-[2.5rem] justify-center"
                        >
                          {formatKeyForDisplay(shortcut.key)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Press <Badge variant="outline" className="font-mono mx-1">?</Badge> or{' '}
            <Badge variant="outline" className="font-mono mx-1">H</Badge> anytime to show this help menu.
            Press <Badge variant="outline" className="font-mono mx-1">Esc</Badge> to close.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}