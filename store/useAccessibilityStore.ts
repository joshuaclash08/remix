import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontScale = 'normal' | 'large' | 'xlarge';
export type A11yPreset = 'default' | 'visual' | 'hearing' | 'mobility' | 'cognitive';

interface AccessibilityState {
  // --- Original Mode States ---
  highContrast: boolean;
  fontScale: FontScale;
  lowReachMode: boolean; // 휠체어 / 하단 집중 레이아웃 모드
  ttsEnabled: boolean; // 음성 자동 읽기 (TTS)
  reduceMotion: boolean; // 모션 감수 / 전정기관 케어 모드
  hapticFeedback: boolean; // 진동 및 시각 햅틱 펄스
  activePreset: A11yPreset;

  // --- New Advanced Mode States ---
  dyslexiaMode: boolean; // 난독증 타이포그래피 (줄간격 1.5배, 자간 0.12em 등) 강제 적용
  debounceMode: boolean; // 수전증/미세운동장애 500ms 디바운스 적용
  darkMode: boolean; // 광과민성 다크모드 강제 적용
  switchAccessMode: boolean; // 상지 마비 스위치 제어 (선형 포커스)
  colorBlindMode: boolean; // 색각 이상 이중 기호화
  easyMode: boolean; // 발달/지적 장애, 고령층용 인지 부하 통제 (타임아웃 무제한 등)

  // Visual Haptic Indicator state for web presentation
  visualHapticPulse: boolean;

  // Actions
  setHighContrast: (enabled: boolean) => void;
  setFontScale: (scale: FontScale) => void;
  setLowReachMode: (enabled: boolean) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;

  setDyslexiaMode: (enabled: boolean) => void;
  setDebounceMode: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setSwitchAccessMode: (enabled: boolean) => void;
  setColorBlindMode: (enabled: boolean) => void;
  setEasyMode: (enabled: boolean) => void;

  setPreset: (preset: A11yPreset) => void;
  triggerVisualHaptic: () => void;
  resetAll: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      highContrast: false,
      fontScale: 'normal',
      lowReachMode: false,
      ttsEnabled: false,
      reduceMotion: false,
      hapticFeedback: true,
      activePreset: 'default',
      
      dyslexiaMode: false,
      debounceMode: false,
      darkMode: false,
      switchAccessMode: false,
      colorBlindMode: false,
      easyMode: false,

      visualHapticPulse: false,

      setHighContrast: (highContrast) => set({ highContrast, activePreset: 'default' }),
      setFontScale: (fontScale) => set({ fontScale, activePreset: 'default' }),
      setLowReachMode: (lowReachMode) => set({ lowReachMode, activePreset: 'default' }),
      setTtsEnabled: (ttsEnabled) => set({ ttsEnabled, activePreset: 'default' }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion, activePreset: 'default' }),
      setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),

      setDyslexiaMode: (dyslexiaMode) => set({ dyslexiaMode, activePreset: 'default' }),
      setDebounceMode: (debounceMode) => set({ debounceMode, activePreset: 'default' }),
      setDarkMode: (darkMode) => set({ darkMode, activePreset: 'default' }),
      setSwitchAccessMode: (switchAccessMode) => set({ switchAccessMode, activePreset: 'default' }),
      setColorBlindMode: (colorBlindMode) => set({ colorBlindMode, activePreset: 'default' }),
      setEasyMode: (easyMode) => set({ easyMode, activePreset: 'default' }),

      setPreset: (preset) => {
        // Reset advanced states first
        set({
          dyslexiaMode: false,
          debounceMode: false,
          darkMode: false,
          switchAccessMode: false,
          colorBlindMode: false,
          easyMode: false,
          lowReachMode: false,
        });

        switch (preset) {
          case 'visual':
            set({
              activePreset: 'visual',
              highContrast: true,
              fontScale: 'xlarge',
              ttsEnabled: true,
              reduceMotion: false,
            });
            break;
          case 'hearing':
            set({
              activePreset: 'hearing',
              highContrast: true,
              fontScale: 'large',
              ttsEnabled: false,
              hapticFeedback: true,
              reduceMotion: false,
            });
            break;
          case 'mobility':
            set({
              activePreset: 'mobility',
              fontScale: 'large',
              highContrast: false,
              ttsEnabled: true,
              reduceMotion: false,
            });
            break;
          case 'cognitive':
            set({
              activePreset: 'cognitive',
              reduceMotion: true,
              fontScale: 'large',
              highContrast: false,
              ttsEnabled: true,
            });
            break;
          case 'default':
          default:
            set({
              activePreset: 'default',
              highContrast: false,
              fontScale: 'normal',
              ttsEnabled: false,
              reduceMotion: false,
              hapticFeedback: true,
            });
            break;
        }
      },

      triggerVisualHaptic: () => {
        if (!get().hapticFeedback) return;
        set({ visualHapticPulse: true });
        setTimeout(() => set({ visualHapticPulse: false }), 250);
      },

      resetAll: () =>
        set({
          highContrast: false,
          fontScale: 'normal',
          lowReachMode: false,
          ttsEnabled: false,
          reduceMotion: false,
          hapticFeedback: true,
          activePreset: 'default',
          dyslexiaMode: false,
          debounceMode: false,
          darkMode: false,
          switchAccessMode: false,
          colorBlindMode: false,
          easyMode: false,
        }),
    }),
    {
      name: 'barrier-free-a11y-settings',
    }
  )
);
