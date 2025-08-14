/**
 * Carousel Controls Component
 *
 * Play/pause, mute controls, and dots indicator for carousel
 */

import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemoAsset } from '@/lib/get-demo-assets';

interface CarouselControlsProps {
  assets: DemoAsset[];
  currentIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  isVideo: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onGoToSlide: (index: number) => void;
}

export function CarouselControls({
  assets,
  currentIndex,
  isPlaying,
  isMuted,
  isVideo,
  onTogglePlay,
  onToggleMute,
  onGoToSlide,
}: CarouselControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Play/Pause and Mute */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        {isVideo && (
          <button
            onClick={onToggleMute}
            className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Dots Indicator */}
      <div className="flex gap-2">
        {assets.map((asset, index) => (
          <button
            key={index}
            onClick={() => onGoToSlide(index)}
            className={cn(
              'transition-all rounded-full',
              index === currentIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            )}
            aria-label={`Go to slide ${index + 1}`}
          >
            <span className="sr-only">
              {asset.type === 'video' ? 'Video' : 'Image'}: {asset.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
