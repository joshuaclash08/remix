export type FontScale = 'normal' | 'large' | 'xlarge';
export type A11yPreset = 'default' | 'visual' | 'hearing' | 'mobility' | 'cognitive';
export type MainDisabilityCategory = 'visual' | 'cognitive' | 'mobility' | 'hearing';
export type AppLanguage = 'ko' | 'en';

export type AccessibilityNeed =
  | 'lowVision'
  | 'blindness'
  | 'colorBlind'
  | 'photophobia'
  | 'tremor'
  | 'switchControl'
  | 'noFineControl'
  | 'wheelchair'
  | 'cognitiveSimple'
  | 'elderly'
  | 'dyslexia'
  | 'hardOfHearing';

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
  selectedNeeds: AccessibilityNeed[];
  highContrast: boolean;
  fontScale: FontScale;
  fontMultiplier: number;
  lowReachMode: boolean;
  ttsEnabled: boolean;
  ttsAutoPlay: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  dyslexiaMode: boolean;
  debounceMode: boolean;
  debounceDuration: number;
  darkMode: boolean;
  switchAccessMode: boolean;
  switchScanInterval: number;
  colorBlindMode: boolean;
  easyMode: boolean;
  giantTouchTargets: boolean;
  dyslexiaTypography: boolean;
  dyslexiaLetterSpacing: number; // e.g. 0 ~ 0.05 (em)
  dyslexiaLineHeight: number; // e.g. 1.2 ~ 2.0
  visualCaptionMode: boolean;
  timeoutExtensionEnabled: boolean;
}

