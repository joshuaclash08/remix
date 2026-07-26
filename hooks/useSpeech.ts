'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

/**
 * Hardware Abstraction Hook: Speech / TTS (Text to Speech)
 * ----------------------------------------------------
 * Phase 1 (Web): Web SpeechSynthesis API (window.speechSynthesis)
 * Phase 2 (Expo Native Migration):
 *   Import Expo Speech module instead:
 *   `import * as Speech from 'expo-speech'`
 *   `Speech.speak(text, { language: 'ko-KR' })`
 */
export function useSpeech() {
  // Web TTS disabled in favor of native OS VoiceOver / TalkBack to prevent audio collisions
  const speak = useCallback((text: string, force: boolean = false) => {
    // No-op: OS VoiceOver / TalkBack handles reading via WAI-ARIA
  }, []);

  const stop = useCallback(() => {
    // No-op
  }, []);

  return {
    speak,
    stop,
    speakingText: null,
    isSpeaking: false,
    isSupported: false,
  };
}
