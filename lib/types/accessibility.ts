export type FontScale = 'normal' | 'large' | 'xlarge';
export type A11yPreset = 'default' | 'visual' | 'hearing' | 'mobility' | 'cognitive';
export type MainDisabilityCategory = 'visual' | 'cognitive' | 'mobility' | 'hearing';
export type AppLanguage = 'ko' | 'en';

export interface AccessibilityProfileMetadata {
  id: string;
  category: MainDisabilityCategory;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  defaultPreset: A11yPreset;
  recommendedFontMultiplier?: number;
  recommendedDebounceMs?: number;
}

export interface AccessibilitySettings {
  language: AppLanguage;
  profileId: string | null;
  activePreset: A11yPreset;
  highContrast: boolean;
  fontScale: FontScale;
  fontMultiplier: number;
  lowReachMode: boolean;
  ttsEnabled: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  dyslexiaMode: boolean;
  debounceMode: boolean;
  debounceDuration: number;
  darkMode: boolean;
  switchAccessMode: boolean;
  colorBlindMode: boolean;
  easyMode: boolean;
}
