'use client';

/**
 * Demo Carousel Component
 *
 * Auto-playing carousel for demo images and videos
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-advance carousel
  useEffect(() => {
    if (!isPlaying || isVideoPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds for images

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, isPlaying, isVideoPlaying, assets.length]);

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
                    videoRefs.current[index] = el;
                  }}
                  src={asset.src}
                  className="w-full h-full object-cover"
                  muted={isMuted}
                  playsInline
                  onEnded={handleVideoEnd}
                  onPlay={handleVideoPlay}
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
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Play/Pause and Mute */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            {isVideo && (
              <button
                onClick={toggleMute}
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
                onClick={() => goToSlide(index)}
                className={cn(
                  'transition-all rounded-full',
                  index === currentIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
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
      {assets.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {assets.map((asset, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
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
                <Image
                  src={asset.src}
                  alt={asset.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              )}
              {asset.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
