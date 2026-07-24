'use client';

import { useCallback } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

/**
 * Hardware Abstraction Hook: Haptics
 * ----------------------------------------------------
 * Phase 1 (Web): Web Vibration API (navigator.vibrate) + Visual Haptic Flash
 * Phase 2 (Expo Native Migration):
 *   Import Expo Haptics module instead:
 *   `import * as Haptics from 'expo-haptics'`
 *   `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)`
 */
export function useHaptics() {
  const triggerVisualHaptic = useAccessibilityStore((state) => state.triggerVisualHaptic);
  const hapticFeedback = useAccessibilityStore((state) => state.hapticFeedback);

  const vibrate = useCallback(
    (pattern: number | number[] = 50) => {
      if (!hapticFeedback) return;

      // Visual feedback pulse (guaranteed to work on iOS Safari & Desktop Web)
      triggerVisualHaptic();

      // Web Vibration API (Works on Android Chrome)
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch {
          // Ignore vibration permission or browser restriction errors silently
        }
      }
    },
    [hapticFeedback, triggerVisualHaptic]
  );

  return { vibrate };
}
