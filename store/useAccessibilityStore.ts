import { create } from 'zustand';
import type { FontScale, A11yPreset, AppLanguage } from '@/lib/types';
import { accessibilityService } from '@/lib/services';

export type { FontScale, A11yPreset, AppLanguage };

interface AccessibilityState {
  // --- Original Mode States ---
  highContrast: boolean;
  fontScale: FontScale;
  lowReachMode: boolean;
  ttsEnabled: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  activePreset: A11yPreset;

  // --- Advanced Mode States ---
  dyslexiaMode: boolean;
  debounceMode: boolean;
  darkMode: boolean;
  switchAccessMode: boolean;
  colorBlindMode: boolean;
  easyMode: boolean;

  // --- Custom Parameters ---
  profileId: string | null;
  debounceDuration: number;
  fontMultiplier: number;

  visualHapticPulse: boolean;
  language: AppLanguage;

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

  setLanguage: (lang: AppLanguage) => void;

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
  debounceDuration: 500,
  fontMultiplier: 1.0,

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
    accessibilityService.setCookie('bf_lang', state.language);
    accessibilityService.setCookie('bf_disability_profile', state.profileId || '');
    accessibilityService.setCookie('bf_active_preset', state.activePreset);
    accessibilityService.setCookie('bf_high_contrast', state.highContrast ? 'true' : 'false');
    accessibilityService.setCookie('bf_font_multiplier', state.fontMultiplier.toString());
    accessibilityService.setCookie('bf_debounce_duration', state.debounceDuration.toString());
    accessibilityService.setCookie('bf_dyslexia_mode', state.dyslexiaMode ? 'true' : 'false');
    accessibilityService.setCookie('bf_debounce_mode', state.debounceMode ? 'true' : 'false');
    accessibilityService.setCookie('bf_dark_mode', state.darkMode ? 'true' : 'false');
    accessibilityService.setCookie('bf_color_blind_mode', state.colorBlindMode ? 'true' : 'false');
    accessibilityService.setCookie('bf_easy_mode', state.easyMode ? 'true' : 'false');
    accessibilityService.setCookie('bf_haptic_feedback', state.hapticFeedback ? 'true' : 'false');
    accessibilityService.setCookie('bf_low_reach_mode', state.lowReachMode ? 'true' : 'false');
    accessibilityService.setCookie('bf_setup_completed', 'true');
  },

  loadSettingsFromCookie: () => {
    const setupCompleted = accessibilityService.getCookie('bf_setup_completed');
    if (setupCompleted !== 'true') {
      const savedLang = accessibilityService.getCookie('bf_lang') as AppLanguage | null;
      if (savedLang) {
        set({ language: savedLang });
      }
      return false;
    }

    try {
      const language = (accessibilityService.getCookie('bf_lang') as AppLanguage) || 'ko';
      const profileId = accessibilityService.getCookie('bf_disability_profile') || null;
      const activePreset = (accessibilityService.getCookie('bf_active_preset') as A11yPreset) || 'default';
      const highContrast = accessibilityService.getCookie('bf_high_contrast') === 'true';
      const fontMultiplier = parseFloat(accessibilityService.getCookie('bf_font_multiplier') || '1.0');
      const debounceDuration = parseInt(accessibilityService.getCookie('bf_debounce_duration') || '500', 10);
      const dyslexiaMode = accessibilityService.getCookie('bf_dyslexia_mode') === 'true';
      const debounceMode = accessibilityService.getCookie('bf_debounce_mode') === 'true';
      const darkMode = accessibilityService.getCookie('bf_dark_mode') === 'true';
      const colorBlindMode = accessibilityService.getCookie('bf_color_blind_mode') === 'true';
      const easyMode = accessibilityService.getCookie('bf_easy_mode') === 'true';
      const hapticFeedback = accessibilityService.getCookie('bf_haptic_feedback') !== 'false';
      const lowReachMode = accessibilityService.getCookie('bf_low_reach_mode') === 'true';

      set({
        language,
        profileId,
        activePreset,
        highContrast,
        fontMultiplier,
        debounceDuration,
        dyslexiaMode,
        debounceMode,
        darkMode,
        colorBlindMode,
        easyMode,
        hapticFeedback,
        lowReachMode,
      });
      return true;
    } catch (e) {
      console.error('Failed to load split a11y settings from cookies', e);
      return false;
    }
  },

  setPreset: (preset) => {
    const config = accessibilityService.getPresetConfig(preset);
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
      ...config,
    });
  },

  triggerVisualHaptic: () => {
    if (!get().hapticFeedback) return;
    set({ visualHapticPulse: true });
    setTimeout(() => set({ visualHapticPulse: false }), 250);
  },

  resetAll: () => {
    accessibilityService.clearAllCookies();
    const defaultConfig = accessibilityService.getPresetConfig('default');
    set({
      profileId: null,
      debounceDuration: 500,
      fontMultiplier: 1.0,
      visualHapticPulse: false,
      ...defaultConfig,
    });
  },
}));
