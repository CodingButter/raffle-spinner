import { StatRowProps } from './types';

export function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
