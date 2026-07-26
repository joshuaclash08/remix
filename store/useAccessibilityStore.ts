import { create } from 'zustand';
import type { FontScale, AccessibilityNeed, AccessibilitySettings, AppLanguage } from '@/lib/types';
import { accessibilityService } from '@/lib/services';

export type { FontScale, AccessibilityNeed, AppLanguage };

interface AccessibilityState {
  // --- Original Mode States ---
  language: AppLanguage;
  selectedNeeds: AccessibilityNeed[];
  highContrast: boolean;
  fontScale: FontScale;
  fontMultiplier: number;
  lowReachMode: boolean;
  ttsEnabled: boolean;
  ttsAutoPlay: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;

  // --- Advanced Mode States ---
  dyslexiaMode: boolean;
  debounceMode: boolean;
  darkMode: boolean;
  switchAccessMode: boolean;
  switchScanInterval: number;
  colorBlindMode: boolean;
  easyMode: boolean;
  giantTouchTargets: boolean;
  dyslexiaTypography: boolean;
  dyslexiaLetterSpacing: number;
  dyslexiaLineHeight: number;
  visualCaptionMode: boolean;
  timeoutExtensionEnabled: boolean;

  // --- Custom Parameters ---
  debounceDuration: number;
  visualHapticPulse: boolean;

  // Actions
  setLanguage: (lang: AppLanguage) => void;
  setSelectedNeeds: (needs: AccessibilityNeed[]) => void;
  setHighContrast: (enabled: boolean) => void;
  setFontScale: (scale: FontScale) => void;
  setFontMultiplier: (mult: number) => void;
  setLowReachMode: (enabled: boolean) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setTtsAutoPlay: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;

  setDyslexiaMode: (enabled: boolean) => void;
  setDebounceMode: (enabled: boolean) => void;
  setDebounceDuration: (dur: number) => void;
  setDarkMode: (enabled: boolean) => void;
  setSwitchAccessMode: (enabled: boolean) => void;
  setSwitchScanInterval: (interval: number) => void;
  setColorBlindMode: (enabled: boolean) => void;
  setEasyMode: (enabled: boolean) => void;
  setGiantTouchTargets: (enabled: boolean) => void;
  setDyslexiaTypography: (enabled: boolean) => void;
  setDyslexiaLetterSpacing: (spacing: number) => void;
  setDyslexiaLineHeight: (height: number) => void;
  setVisualCaptionMode: (enabled: boolean) => void;
  setTimeoutExtensionEnabled: (enabled: boolean) => void;

  saveSettingsToCookie: () => void;
  loadSettingsFromCookie: () => boolean;
  triggerVisualHaptic: () => void;
  resetAll: () => void;
}

const DEFAULT_STATE = accessibilityService.getDefaultSettings('ko');

// Helper to determine if we are running in Kiosk / Shared device mode
const checkIsSharedDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const search = window.location.search;
  const isShared = search.includes('table=') || search.includes('store=') || sessionStorage.getItem('bf_is_shared_device') === 'true';
  if (isShared) {
    sessionStorage.setItem('bf_is_shared_device', 'true');
  }
  return isShared;
};

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
  ...DEFAULT_STATE,
  debounceDuration: 500,
  visualHapticPulse: false,

  setLanguage: (language) => {
    set({ language });
    get().saveSettingsToCookie();
  },

  setSelectedNeeds: (needs) => {
    const merged = accessibilityService.mergeSettings(needs, get().language);
    set({
      ...merged,
      selectedNeeds: needs
    });
    get().saveSettingsToCookie();
  },

  setHighContrast: (highContrast) => {
    set({ highContrast });
    get().saveSettingsToCookie();
  },
  setFontScale: (fontScale) => {
    set({ fontScale });
    get().saveSettingsToCookie();
  },
  setFontMultiplier: (fontMultiplier) => {
    set({ fontMultiplier });
    get().saveSettingsToCookie();
  },
  setLowReachMode: (lowReachMode) => {
    set({ lowReachMode });
    get().saveSettingsToCookie();
  },
  setTtsEnabled: (ttsEnabled) => {
    set({ ttsEnabled });
    get().saveSettingsToCookie();
  },
  setTtsAutoPlay: (ttsAutoPlay) => {
    set({ ttsAutoPlay });
    get().saveSettingsToCookie();
  },
  setReduceMotion: (reduceMotion) => {
    set({ reduceMotion });
    get().saveSettingsToCookie();
  },
  setHapticFeedback: (hapticFeedback) => {
    set({ hapticFeedback });
    get().saveSettingsToCookie();
  },

  setDyslexiaMode: (dyslexiaMode) => {
    set({ dyslexiaMode });
    get().saveSettingsToCookie();
  },
  setDebounceMode: (debounceMode) => {
    set({ debounceMode });
    get().saveSettingsToCookie();
  },
  setDebounceDuration: (debounceDuration) => {
    set({ debounceDuration });
    get().saveSettingsToCookie();
  },
  setDarkMode: (darkMode) => {
    set({ darkMode });
    get().saveSettingsToCookie();
  },
  setSwitchAccessMode: (switchAccessMode) => {
    set({ switchAccessMode });
    get().saveSettingsToCookie();
  },
  setSwitchScanInterval: (switchScanInterval) => {
    set({ switchScanInterval });
    get().saveSettingsToCookie();
  },
  setColorBlindMode: (colorBlindMode) => {
    set({ colorBlindMode });
    get().saveSettingsToCookie();
  },
  setEasyMode: (easyMode) => {
    set({ easyMode });
    get().saveSettingsToCookie();
  },
  setGiantTouchTargets: (giantTouchTargets) => {
    set({ giantTouchTargets });
    get().saveSettingsToCookie();
  },
  setDyslexiaTypography: (dyslexiaTypography) => {
    set({ dyslexiaTypography });
    get().saveSettingsToCookie();
  },
  setDyslexiaLetterSpacing: (dyslexiaLetterSpacing) => {
    set({ dyslexiaLetterSpacing });
    get().saveSettingsToCookie();
  },
  setDyslexiaLineHeight: (dyslexiaLineHeight) => {
    set({ dyslexiaLineHeight });
    get().saveSettingsToCookie();
  },
  setVisualCaptionMode: (visualCaptionMode) => {
    set({ visualCaptionMode });
    get().saveSettingsToCookie();
  },
  setTimeoutExtensionEnabled: (timeoutExtensionEnabled) => {
    set({ timeoutExtensionEnabled });
    get().saveSettingsToCookie();
  },

  saveSettingsToCookie: () => {
    const state = get();
    const isShared = checkIsSharedDevice();

    const settingsData = {
      language: state.language,
      // PRIVACY: Avoid storing medical selectedNeeds array or profile names.
      // We only store the merged numeric and boolean configurations.
      highContrast: state.highContrast ? 'true' : 'false',
      fontMultiplier: state.fontMultiplier.toString(),
      fontScale: state.fontScale,
      lowReachMode: state.lowReachMode ? 'true' : 'false',
      ttsEnabled: state.ttsEnabled ? 'true' : 'false',
      ttsAutoPlay: state.ttsAutoPlay ? 'true' : 'false',
      reduceMotion: state.reduceMotion ? 'true' : 'false',
      hapticFeedback: state.hapticFeedback ? 'true' : 'false',
      dyslexiaMode: state.dyslexiaMode ? 'true' : 'false',
      debounceMode: state.debounceMode ? 'true' : 'false',
      debounceDuration: state.debounceDuration.toString(),
      darkMode: state.darkMode ? 'true' : 'false',
      switchAccessMode: state.switchAccessMode ? 'true' : 'false',
      switchScanInterval: state.switchScanInterval.toString(),
      colorBlindMode: state.colorBlindMode ? 'true' : 'false',
      easyMode: state.easyMode ? 'true' : 'false',
      giantTouchTargets: state.giantTouchTargets ? 'true' : 'false',
      dyslexiaTypography: state.dyslexiaTypography ? 'true' : 'false',
      dyslexiaLetterSpacing: state.dyslexiaLetterSpacing.toString(),
      dyslexiaLineHeight: state.dyslexiaLineHeight.toString(),
      visualCaptionMode: state.visualCaptionMode ? 'true' : 'false',
      timeoutExtensionEnabled: state.timeoutExtensionEnabled ? 'true' : 'false',
      setupCompleted: 'true'
    };

    if (isShared && typeof window !== 'undefined') {
      // Shared Device: Store in sessionStorage
      Object.entries(settingsData).forEach(([key, val]) => {
        sessionStorage.setItem(`bf_${key}`, val);
      });
    } else {
      // Personal Phone: Store in Cookies
      Object.entries(settingsData).forEach(([key, val]) => {
        accessibilityService.setCookie(`bf_${key}`, val);
      });
    }
  },

  loadSettingsFromCookie: () => {
    const isShared = checkIsSharedDevice();
    const getValue = (key: string): string | null => {
      if (isShared && typeof window !== 'undefined') {
        return sessionStorage.getItem(`bf_${key}`);
      }
      return accessibilityService.getCookie(`bf_${key}`);
    };

    const setupCompleted = getValue('setupCompleted');
    if (setupCompleted !== 'true') {
      const savedLang = getValue('language') as AppLanguage | null;
      if (savedLang) {
        set({ language: savedLang });
      }
      return false;
    }

    try {
      const language = (getValue('language') as AppLanguage) || 'ko';
      const highContrast = getValue('highContrast') === 'true';
      const fontScale = (getValue('fontScale') as FontScale) || 'normal';
      const fontMultiplier = parseFloat(getValue('fontMultiplier') || '1.0');
      const lowReachMode = getValue('lowReachMode') === 'true';
      const ttsEnabled = getValue('ttsEnabled') === 'true';
      const ttsAutoPlay = getValue('ttsAutoPlay') === 'true';
      const reduceMotion = getValue('reduceMotion') === 'true';
      const hapticFeedback = getValue('hapticFeedback') !== 'false';
      const dyslexiaMode = getValue('dyslexiaMode') === 'true';
      const debounceMode = getValue('debounceMode') === 'true';
      const debounceDuration = parseInt(getValue('debounceDuration') || '500', 10);
      const darkMode = getValue('darkMode') === 'true';
      const switchAccessMode = getValue('switchAccessMode') === 'true';
      const switchScanInterval = parseInt(getValue('switchScanInterval') || '2000', 10);
      const colorBlindMode = getValue('colorBlindMode') === 'true';
      const easyMode = getValue('easyMode') === 'true';
      const giantTouchTargets = getValue('giantTouchTargets') === 'true';
      const dyslexiaTypography = getValue('dyslexiaTypography') === 'true';
      const dyslexiaLetterSpacing = parseFloat(getValue('dyslexiaLetterSpacing') || '0.0');
      const dyslexiaLineHeight = parseFloat(getValue('dyslexiaLineHeight') || '1.2');
      const visualCaptionMode = getValue('visualCaptionMode') === 'true';
      const timeoutExtensionEnabled = getValue('timeoutExtensionEnabled') === 'true';

      set({
        language,
        selectedNeeds: [], // Privacy: Loaded dynamically, do not persist diagnosis
        highContrast,
        fontScale,
        fontMultiplier,
        lowReachMode,
        ttsEnabled,
        ttsAutoPlay,
        reduceMotion,
        hapticFeedback,
        dyslexiaMode,
        debounceMode,
        debounceDuration,
        darkMode,
        switchAccessMode,
        switchScanInterval,
        colorBlindMode,
        easyMode,
        giantTouchTargets,
        dyslexiaTypography,
        dyslexiaLetterSpacing,
        dyslexiaLineHeight,
        visualCaptionMode,
        timeoutExtensionEnabled,
      });
      return true;
    } catch (e) {
      console.error('Failed to load split a11y settings', e);
      return false;
    }
  },

  triggerVisualHaptic: () => {
    if (!get().hapticFeedback) return;
    set({ visualHapticPulse: true });
    setTimeout(() => set({ visualHapticPulse: false }), 250);
  },

  resetAll: () => {
    const isShared = checkIsSharedDevice();
    if (isShared && typeof window !== 'undefined') {
      sessionStorage.clear();
    } else {
      accessibilityService.clearAllCookies();
    }
    set({
      ...DEFAULT_STATE,
      debounceDuration: 500,
      visualHapticPulse: false,
    });
  },
}));
