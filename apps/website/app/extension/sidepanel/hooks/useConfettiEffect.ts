'use client';

import { useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * useConfettiEffect Hook
 * Manages confetti animation with debouncing
 * Extracted from SidePanel.tsx for reusability
 */
export function useConfettiEffect() {
  const confettiRef = useRef<boolean>(false);

  const triggerConfetti = () => {
    if (!confettiRef.current) {
      confettiRef.current = true;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        confettiRef.current = false;
      }, 1000);
    }
  };

  return { triggerConfetti };
}
