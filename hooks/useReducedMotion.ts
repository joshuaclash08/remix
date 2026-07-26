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
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      if (mediaQuery.matches && !reduceMotion) {
        setReduceMotion(true);
      }

      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setReduceMotion(e.matches);
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if ('addListener' in mediaQuery) {
        // Fallback for older Safari / Mobile WebViews
        (mediaQuery as unknown as { addListener: (fn: (e: MediaQueryList) => void) => void }).addListener(handleChange);
        return () => (mediaQuery as unknown as { removeListener: (fn: (e: MediaQueryList) => void) => void }).removeListener(handleChange);
      }
    } catch (e) {
      console.warn('useReducedMotion mediaQuery error:', e);
    }
  }, [reduceMotion, setReduceMotion]);

  return reduceMotion;
}
