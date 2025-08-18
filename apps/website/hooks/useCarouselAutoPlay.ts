/**
 * Carousel Auto-Play Hook
 *
 * Manages auto-play functionality for carousel
 */

import { useEffect, useRef } from 'react';

interface UseCarouselAutoPlayProps {
  isPlaying: boolean;
  isVideoPlaying: boolean;
  currentIndex: number;
  itemsLength: number;
  onNext: () => void;
  interval?: number;
}

export function useCarouselAutoPlay({
  isPlaying,
  isVideoPlaying,
  currentIndex,
  itemsLength,
  onNext,
  interval = 5000,
}: UseCarouselAutoPlayProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying || isVideoPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      onNext();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, isPlaying, isVideoPlaying, itemsLength, onNext, interval]);

  return intervalRef;
}
