/**
 * Spinner Settings Component
 *
 * Purpose: User interface for configuring spinner physics parameters including
 * total rotations and animation curve for complete control over spin behavior.
 *
 * SRS Reference:
 * - FR-1.7: Spinner Physics Configuration
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SpinnerSettings as Settings } from '@raffle-spinner/storage';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { BezierCurveEditor } from './BezierCurveEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SpinnerSettingsProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

export function SpinnerSettings({ settings, onUpdate }: SpinnerSettingsProps) {
  // Default values for new settings
  const spinRotations = settings.spinRotations || 5;
  const bezierCurve = settings.bezierCurve || { x1: 0.42, y1: 0, x2: 0.58, y2: 1.0 };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Spinner Settings</CardTitle>
        <CardDescription>
          Customize the physics and behavior of the spinner animation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Animation Curve</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            {/* Total Duration */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="duration">Total Duration: {settings.minSpinDuration} seconds</Label>
                <InfoTooltip content="How long the entire spin animation takes from start to finish" />
              </div>
              <Slider
                id="duration"
                min={1}
                max={10}
                step={0.5}
                value={[settings.minSpinDuration]}
                onValueChange={([value]) => onUpdate({ minSpinDuration: value })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                The total time for the spin animation to complete
              </p>
            </div>

            {/* Total Rotations */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="rotations">Total Rotations: {spinRotations} full spins</Label>
                <InfoTooltip content="How many complete 360° rotations the wheel makes" />
              </div>
              <Slider
                id="rotations"
                min={2}
                max={15}
                step={1}
                value={[spinRotations]}
                onValueChange={([value]) => onUpdate({ spinRotations: value })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">More rotations create more suspense</p>
            </div>

            {/* Quick presets for common scenarios */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    onUpdate({
                      minSpinDuration: 2,
                      spinRotations: 3,
                      bezierCurve: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
                    })
                  }
                  className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  Quick Draw
                </button>
                <button
                  onClick={() =>
                    onUpdate({
                      minSpinDuration: 3,
                      spinRotations: 5,
                      bezierCurve: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
                    })
                  }
                  className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  Standard
                </button>
                <button
                  onClick={() =>
                    onUpdate({
                      minSpinDuration: 5,
                      spinRotations: 8,
                      bezierCurve: { x1: 0.2, y1: 0.9, x2: 0.8, y2: 0.1 },
                    })
                  }
                  className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  Dramatic
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Fine-tune the acceleration and deceleration of your spinner by adjusting the
                animation curve. Drag the control points or use the sliders below.
              </p>
            </div>

            <BezierCurveEditor
              value={bezierCurve}
              onChange={(curve) => onUpdate({ bezierCurve: curve })}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
