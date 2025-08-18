export interface BezierCurve {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BezierCurveEditorProps {
  value: BezierCurve;
  onChange: (curve: BezierCurve) => void;
}

export interface PresetCurve {
  name: string;
  curve: BezierCurve;
  description: string;
}
