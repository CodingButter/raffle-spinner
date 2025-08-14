/**
 * Carousel Content Component
 *
 * Renders the main content (images/videos) of the carousel
 */

import { RefObject } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { DemoAsset } from '@/lib/get-demo-assets';

interface CarouselContentProps {
  assets: DemoAsset[];
  currentIndex: number;
  isMuted: boolean;
  videoRefs: RefObject<{ [key: number]: HTMLVideoElement | null }>;
  onVideoEnd: () => void;
  onVideoPlay: () => void;
}

export function CarouselContent({
  assets,
  currentIndex,
  isMuted,
  videoRefs,
  onVideoEnd,
  onVideoPlay,
}: CarouselContentProps) {
  return (
    <div className="relative w-full h-full">
      {assets.map((asset, index) => (
        <div
          key={index}
          className={cn(
            'absolute inset-0 transition-all duration-700 ease-in-out',
            index === currentIndex
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {asset.type === 'video' ? (
            <video
              ref={(el) => {
                if (videoRefs.current) {
                  videoRefs.current[index] = el;
                }
              }}
              src={asset.src}
              className="w-full h-full object-cover"
              muted={isMuted}
              playsInline
              onEnded={onVideoEnd}
              onPlay={onVideoPlay}
              controls={false}
            />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={asset.src}
                alt={asset.name}
                fill
                className="object-cover"
                priority={index === 0}
                quality={95}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
