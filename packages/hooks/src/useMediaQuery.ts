/**
 * useMediaQuery Hook
 *
 * A React hook for responsive design that tracks if a media query matches.
 * Useful for conditional rendering based on screen size.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */

import { useState, useEffect } from "react";

/**
 * Custom hook to track media query matches
 *
 * @param query - The media query string to match
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false for SSR compatibility
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") {
      return;
    }

    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define change handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Legacy browsers
    else {
      // Legacy browser support - addListener/removeListener are deprecated but still needed
      const legacyMediaQuery = mediaQuery as MediaQueryList & {
        addListener: (listener: (event: MediaQueryListEvent) => void) => void;
        removeListener: (
          listener: (event: MediaQueryListEvent) => void,
        ) => void;
      };
      legacyMediaQuery.addListener(handleChange);
      return () => legacyMediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * Preset media queries for common breakpoints
 */
export const mediaQueries = {
  /** Mobile devices (< 640px) */
  mobile: "(max-width: 639px)",
  /** Small devices (>= 640px) */
  sm: "(min-width: 640px)",
  /** Medium devices (>= 768px) */
  md: "(min-width: 768px)",
  /** Large devices (>= 1024px) */
  lg: "(min-width: 1024px)",
  /** Extra large devices (>= 1280px) */
  xl: "(min-width: 1280px)",
  /** 2XL devices (>= 1536px) */
  "2xl": "(min-width: 1536px)",
  /** Portrait orientation */
  portrait: "(orientation: portrait)",
  /** Landscape orientation */
  landscape: "(orientation: landscape)",
  /** Dark mode preference */
  darkMode: "(prefers-color-scheme: dark)",
  /** Light mode preference */
  lightMode: "(prefers-color-scheme: light)",
  /** Reduced motion preference */
  reducedMotion: "(prefers-reduced-motion: reduce)",
  /** High contrast preference */
  highContrast: "(prefers-contrast: high)",
} as const;

/**
 * Hook to check if device is mobile
 */
export function useIsMobile(): boolean {
  return useMediaQuery(mediaQueries.mobile);
}

/**
 * Hook to check if user prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery(mediaQueries.darkMode);
}

/**
 * Hook to check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(mediaQueries.reducedMotion);
}
