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
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const ttsEnabled = useAccessibilityStore((state) => state.ttsEnabled);

  const speak = useCallback(
    (text: string, force: boolean = false) => {
      if (!ttsEnabled && !force) return;
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setSpeakingText(text);
      };

      utterance.onend = () => {
        setSpeakingText(null);
      };

      utterance.onerror = () => {
        setSpeakingText(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingText(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    speakingText,
    isSpeaking: !!speakingText,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}
