/**
 * Thumbnail Strip Component
 *
 * Shows thumbnail previews of carousel items
 */

import Image from 'next/image';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemoAsset } from '@/lib/get-demo-assets';

interface ThumbnailStripProps {
  assets: DemoAsset[];
  currentIndex: number;
  onGoToSlide: (index: number) => void;
}

export function ThumbnailStrip({ assets, currentIndex, onGoToSlide }: ThumbnailStripProps) {
  if (assets.length <= 1) return null;

  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {assets.map((asset, index) => (
        <button
          key={index}
          onClick={() => onGoToSlide(index)}
          className={cn(
            'relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all border-2',
            index === currentIndex
              ? 'border-brand-gold scale-105 shadow-lg'
              : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-600'
          )}
        >
          {asset.type === 'video' ? (
            <video src={asset.src} className="w-full h-full object-cover" muted />
          ) : (
            <Image src={asset.src} alt={asset.name} fill className="object-cover" sizes="96px" />
          )}
          {asset.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
