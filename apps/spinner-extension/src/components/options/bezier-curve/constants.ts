import { PresetCurve } from './types';

export const PRESETS: PresetCurve[] = [
  {
    name: 'Linear',
    curve: { x1: 0, y1: 0, x2: 1, y2: 1 },
    description: 'Constant speed throughout',
  },
  {
    name: 'Ease In-Out',
    curve: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
    description: 'Slow start and end, fast middle',
  },
  {
    name: 'Ease Out',
    curve: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
    description: 'Fast start, slow end',
  },
  {
    name: 'Ease In',
    curve: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
    description: 'Slow start, fast end',
  },
  {
    name: 'Dramatic',
    curve: { x1: 0.2, y1: 0.9, x2: 0.8, y2: 0.1 },
    description: 'Very fast middle, very slow ends',
  },
  {
    name: 'Smooth Stop',
    curve: { x1: 0.25, y1: 0.1, x2: 0.75, y2: 0.9 },
    description: 'Gradual acceleration and deceleration',
  },
];
