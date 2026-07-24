'use client';

import { useEffect } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

/**
 * Hook to automatically synchronize browser `prefers-reduced-motion` media query
 * with the global Zustand Accessibility Store.
 */
export function useReducedMotion() {
  const reduceMotion = useAccessibilityStore((state) => state.reduceMotion);
  const setReduceMotion = useAccessibilityStore((state) => state.setReduceMotion);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches && !reduceMotion) {
      setReduceMotion(true);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [reduceMotion, setReduceMotion]);

  return reduceMotion;
}
