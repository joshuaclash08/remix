import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useCartStore } from '@/store/useCartStore';

export function emitActionFeedback(
  action: 'add' | 'remove' | 'error',
  messageKo: string,
  messageEn: string,
  undoCallback?: () => void
) {
  if (typeof window === 'undefined') return;

  const settings = useAccessibilityStore.getState();
  const language = settings.language;
  const message = language === 'ko' ? messageKo : messageEn;

  // 1. Trigger Toast Notification
  const addToast = useCartStore.getState().addToast;
  if (addToast) {
    addToast(message, undoCallback);
  }

  // 2. TTS Readout (if ttsEnabled)
  if (settings.ttsEnabled && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = language === 'ko' ? 'ko-KR' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS execution failed', e);
    }
  }

  // 3. Haptics / Vibration Feedback
  if (settings.hapticFeedback) {
    settings.triggerVisualHaptic();
    if ('vibrate' in navigator) {
      try {
        if (action === 'error') {
          navigator.vibrate([100, 50, 100, 50, 100]);
        } else if (action === 'remove') {
          navigator.vibrate([80, 40, 80]);
        } else {
          navigator.vibrate(60);
        }
      } catch (e) {
        // Silence vibration errors
      }
    }
  }

  // 4. Visual Caption / Banner Mode (For hard of hearing: visualCaptionMode)
  if (settings.visualCaptionMode) {
    const setVisualCaption = useCartStore.getState().setVisualCaption;
    if (setVisualCaption) {
      setVisualCaption(message);
    }
  }
}
