import { create } from 'zustand';

export type FontScale = 'normal' | 'large' | 'xlarge';
export type A11yPreset = 'default' | 'visual' | 'hearing' | 'mobility' | 'cognitive';

// Cookie Utility functions
export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document !== 'undefined') {
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/`;
    } catch (e) {
      console.warn('Failed to set cookie', e);
    }
  }
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : null;
  } catch (e) {
    console.warn('Failed to get cookie', e);
    return null;
  }
}

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
  dyslexiaMode: boolean; // 난독증 타이포그래피
  debounceMode: boolean; // 수전증/미세운동장애 500ms 디바운스 적용
  darkMode: boolean; // 광과민성 다크모드
  switchAccessMode: boolean; // 상지 마비 스위치 제어
  colorBlindMode: boolean; // 색각 이상 이중 기호화
  easyMode: boolean; // 발달/지적 장애, 고령층용 인지 부하 통제

  // --- Custom Adjustable Parameters (User Fine-Tuning) ---
  profileId: string | null; // e.g., 'visual_low_vision', 'mobility_tremor'
  debounceDuration: number; // in milliseconds (200ms ~ 1000ms)
  fontMultiplier: number; // multiplier scale (1.0 ~ 2.0)

  // Visual Haptic Indicator state for web presentation
  visualHapticPulse: boolean;

  // --- Language State ---
  language: 'ko' | 'en';

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

  setProfileId: (id: string | null) => void;
  setDebounceDuration: (dur: number) => void;
  setFontMultiplier: (mult: number) => void;

  setLanguage: (lang: 'ko' | 'en') => void;

  saveSettingsToCookie: () => void;
  loadSettingsFromCookie: () => boolean;

  setPreset: (preset: A11yPreset) => void;
  triggerVisualHaptic: () => void;
  resetAll: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
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

  profileId: null,
  debounceDuration: 500, // Default 500ms
  fontMultiplier: 1.0, // Default 1.0x

  visualHapticPulse: false,

  language: 'ko',

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

  setProfileId: (profileId) => set({ profileId }),
  setDebounceDuration: (debounceDuration) => set({ debounceDuration }),
  setFontMultiplier: (fontMultiplier) => set({ fontMultiplier }),

  setLanguage: (language) => {
    set({ language });
    get().saveSettingsToCookie();
  },

  saveSettingsToCookie: () => {
    const state = get();
    const settings = {
      profileId: state.profileId,
      fontMultiplier: state.fontMultiplier,
      debounceDuration: state.debounceDuration,
      highContrast: state.highContrast,
      dyslexiaMode: state.dyslexiaMode,
      debounceMode: state.debounceMode,
      darkMode: state.darkMode,
      colorBlindMode: state.colorBlindMode,
      easyMode: state.easyMode,
      hapticFeedback: state.hapticFeedback,
      lowReachMode: state.lowReachMode,
      activePreset: state.activePreset,
      language: state.language,
    };
    setCookie('bf_a11y_settings', JSON.stringify(settings), 300); // 5 minutes expiration
  },

  loadSettingsFromCookie: () => {
    const saved = getCookie('bf_a11y_settings');
    if (!saved) return false;
    try {
      const settings = JSON.parse(saved);
      set({
        profileId: settings.profileId || null,
        fontMultiplier: settings.fontMultiplier || 1.0,
        debounceDuration: settings.debounceDuration || 500,
        highContrast: !!settings.highContrast,
        dyslexiaMode: !!settings.dyslexiaMode,
        debounceMode: !!settings.debounceMode,
        darkMode: !!settings.darkMode,
        colorBlindMode: !!settings.colorBlindMode,
        easyMode: !!settings.easyMode,
        hapticFeedback: !!settings.hapticFeedback,
        lowReachMode: !!settings.lowReachMode,
        activePreset: settings.activePreset || 'default',
        language: settings.language || 'ko',
      });
      return true;
    } catch (e) {
      console.error('Failed to parse a11y settings cookie', e);
      return false;
    }
  },

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
      debounceDuration: 500,
      fontMultiplier: 1.0,
    });

    switch (preset) {
      case 'visual':
        set({
          activePreset: 'visual',
          highContrast: true,
          fontScale: 'xlarge',
          ttsEnabled: true,
          reduceMotion: false,
          fontMultiplier: 1.5,
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
          debounceMode: true,
          debounceDuration: 500,
        });
        break;
      case 'cognitive':
        set({
          activePreset: 'cognitive',
          reduceMotion: true,
          fontScale: 'large',
          highContrast: false,
          ttsEnabled: true,
          easyMode: true,
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

  resetAll: () => {
    // Clear cookie if resetting
    if (typeof document !== 'undefined') {
      document.cookie = 'bf_a11y_settings=; max-age=0; path=/';
    }
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
      profileId: null,
      debounceDuration: 500,
      fontMultiplier: 1.0,
    });
  },
}));
