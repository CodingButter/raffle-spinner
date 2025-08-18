'use client';

/**
 * Demo Carousel Component
 *
 * Auto-playing carousel for demo images and videos
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCarouselAutoPlay } from '@/hooks/useCarouselAutoPlay';
import { CarouselContent } from './carousel/CarouselContent';
import { CarouselControls } from './carousel/CarouselControls';
import { ThumbnailStrip } from './carousel/ThumbnailStrip';
import type { DemoAsset } from '@/lib/get-demo-assets';

interface DemoCarouselProps {
  assets: DemoAsset[];
  className?: string;
}

export function DemoCarousel({ assets, className }: DemoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const currentAsset = assets[currentIndex];
  const isVideo = currentAsset?.type === 'video';

  // Preload images for smooth transitions
  useEffect(() => {
    assets.forEach((asset, index) => {
      if (asset.type === 'image') {
        const img = new window.Image();
        img.src = asset.src;
        img.onload = () => {
          setImageLoaded((prev) => ({ ...prev, [index]: true }));
        };
      }
    });
  }, [assets]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % assets.length);
    setIsVideoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + assets.length) % assets.length);
    setIsVideoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsVideoPlaying(false);
  };

  // Use auto-play hook
  useCarouselAutoPlay({
    isPlaying,
    isVideoPlaying,
    currentIndex,
    itemsLength: assets.length,
    onNext: nextSlide,
  });

  // Handle video playback
  useEffect(() => {
    const video = videoRefs.current[currentIndex];
    if (video && isVideo) {
      video.muted = isMuted;
      if (isPlaying) {
        video.play().catch(() => {
          // Silently handle autoplay errors
        });
      } else {
        video.pause();
      }
    }
  }, [currentIndex, isVideo, isPlaying, isMuted]);

  const handleVideoEnd = () => {
    setIsVideoPlaying(false);
    if (isPlaying) {
      nextSlide();
    }
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (assets.length === 0) {
    return (
      <div
        className={cn(
          'relative w-full aspect-video bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 rounded-2xl overflow-hidden flex items-center justify-center',
          className
        )}
      >
        <p className="text-muted-foreground">No demo content available</p>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full group', className)}>
      {/* Main Carousel Container */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] ring-1 ring-white/10">
        {/* Content Display */}
        <CarouselContent
          assets={assets}
          currentIndex={currentIndex}
          isMuted={isMuted}
          videoRefs={videoRefs}
          onVideoEnd={handleVideoEnd}
          onVideoPlay={handleVideoPlay}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Controls */}
        <CarouselControls
          assets={assets}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          isMuted={isMuted}
          isVideo={isVideo}
          onTogglePlay={togglePlayPause}
          onToggleMute={toggleMute}
          onGoToSlide={goToSlide}
        />

        {/* Asset Type Badge */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md',
              isVideo
                ? 'bg-red-500/20 text-red-100 border border-red-500/30'
                : 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
            )}
          >
            {isVideo ? 'VIDEO' : 'IMAGE'}
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <ThumbnailStrip assets={assets} currentIndex={currentIndex} onGoToSlide={goToSlide} />
    </div>
  );
}
