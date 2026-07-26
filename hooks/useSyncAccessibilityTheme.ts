'use client';

import { useEffect } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

/**
 * Custom Hook: Sync Accessibility Theme Classes and CSS Custom Properties to <html> root.
 */
export function useSyncAccessibilityTheme() {
  const {
    highContrast,
    fontScale,
    dyslexiaMode,
    darkMode,
    colorBlindMode,
    fontMultiplier,
  } = useAccessibilityStore();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const htmlEl = document.documentElement;
    htmlEl.style.setProperty('--font-multiplier', fontMultiplier.toString());

    if (highContrast) htmlEl.classList.add('high-contrast');
    else htmlEl.classList.remove('high-contrast');

    if (darkMode) htmlEl.classList.add('dark-mode');
    else htmlEl.classList.remove('dark-mode');

    if (dyslexiaMode) htmlEl.classList.add('dyslexia-mode');
    else htmlEl.classList.remove('dyslexia-mode');

    if (colorBlindMode) htmlEl.classList.add('color-blind-mode');
    else htmlEl.classList.remove('color-blind-mode');
  }, [highContrast, fontScale, dyslexiaMode, darkMode, colorBlindMode, fontMultiplier]);
}
