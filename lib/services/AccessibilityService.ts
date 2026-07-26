import type { AccessibilityNeed, AccessibilitySettings, AppLanguage } from '@/lib/types';

export class AccessibilityService {
  private readonly COOKIE_MAX_AGE = 3600 * 24 * 7; // 7 days

  /**
   * Helper to write cookie safely.
   */
  public setCookie(name: string, value: string): void {
    if (typeof document === 'undefined') return;
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${this.COOKIE_MAX_AGE}; path=/`;
    } catch (e) {
      console.warn('Failed to write cookie', e);
    }
  }

  /**
   * Helper to read cookie safely.
   */
  public getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    try {
      const matches = document.cookie.match(
        new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
      );
      return matches ? decodeURIComponent(matches[1]) : null;
    } catch (e) {
      console.warn('Failed to read cookie', e);
      return null;
    }
  }

  /**
   * Clear all accessibility cookies.
   */
  public clearAllCookies(): void {
    if (typeof document === 'undefined') return;
    const cookieNames = [
      'bf_lang',
      'bf_high_contrast',
      'bf_font_multiplier',
      'bf_debounce_duration',
      'bf_dyslexia_mode',
      'bf_debounce_mode',
      'bf_dark_mode',
      'bf_color_blind_mode',
      'bf_easy_mode',
      'bf_haptic_feedback',
      'bf_low_reach_mode',
      'bf_setup_completed',
      'bf_tts_enabled',
      'bf_tts_autoplay',
      'bf_reduce_motion',
      'bf_switch_access_mode',
      'bf_switch_scan_interval',
      'bf_giant_touch_targets',
      'bf_dyslexia_typography',
      'bf_dyslexia_letter_spacing',
      'bf_dyslexia_line_height',
      'bf_visual_caption_mode',
      'bf_timeout_extension_enabled',
    ];
    cookieNames.forEach((c) => {
      document.cookie = `${c}=; max-age=0; path=/`;
    });
  }

  /**
   * Returns default settings object.
   */
  public getDefaultSettings(language: AppLanguage = 'ko'): AccessibilitySettings {
    return {
      language,
      selectedNeeds: [],
      highContrast: false,
      fontScale: 'normal',
      fontMultiplier: 1.0,
      lowReachMode: false,
      ttsEnabled: false,
      ttsAutoPlay: false,
      reduceMotion: false,
      hapticFeedback: true,
      dyslexiaMode: false,
      debounceMode: false,
      debounceDuration: 500,
      darkMode: false,
      switchAccessMode: false,
      switchScanInterval: 2000,
      colorBlindMode: false,
      easyMode: false,
      giantTouchTargets: false,
      dyslexiaTypography: false,
      dyslexiaLetterSpacing: 0.0,
      dyslexiaLineHeight: 1.2,
      visualCaptionMode: false,
      timeoutExtensionEnabled: false,
    };
  }

  /**
   * Merges multiple selected needs into a single technical settings object.
   */
  public mergeSettings(needs: AccessibilityNeed[], language: AppLanguage = 'ko'): AccessibilitySettings {
    const settings = this.getDefaultSettings(language);
    settings.selectedNeeds = needs;

    needs.forEach((need) => {
      switch (need) {
        case 'lowVision':
          settings.highContrast = true;
          settings.fontScale = 'xlarge';
          settings.fontMultiplier = Math.max(settings.fontMultiplier, 1.5);
          settings.ttsEnabled = true;
          break;
        case 'blindness':
          settings.highContrast = true;
          settings.fontScale = 'xlarge';
          settings.fontMultiplier = Math.max(settings.fontMultiplier, 1.5);
          settings.ttsEnabled = true;
          settings.ttsAutoPlay = true;
          break;
        case 'colorBlind':
          settings.colorBlindMode = true;
          settings.highContrast = true;
          settings.fontScale = 'xlarge';
          break;
        case 'photophobia':
          settings.darkMode = true;
          settings.highContrast = true;
          settings.fontScale = 'xlarge';
          break;
        case 'tremor':
          settings.debounceMode = true;
          settings.debounceDuration = Math.max(settings.debounceDuration, 500);
          break;
        case 'switchControl':
          settings.switchAccessMode = true;
          settings.ttsEnabled = true;
          settings.fontScale = 'large';
          settings.fontMultiplier = Math.max(settings.fontMultiplier, 1.25);
          break;
        case 'noFineControl':
          settings.giantTouchTargets = true;
          settings.fontScale = 'xlarge';
          settings.fontMultiplier = Math.max(settings.fontMultiplier, 1.5);
          break;
        case 'wheelchair':
          settings.lowReachMode = true;
          break;
        case 'cognitiveSimple':
          settings.easyMode = true;
          settings.reduceMotion = true;
          settings.ttsEnabled = true;
          break;
        case 'elderly':
          settings.fontScale = 'large';
          settings.fontMultiplier = Math.max(settings.fontMultiplier, 1.25);
          settings.timeoutExtensionEnabled = true;
          settings.reduceMotion = true;
          settings.ttsEnabled = true;
          break;
        case 'dyslexia':
          settings.dyslexiaTypography = true;
          settings.dyslexiaMode = true;
          settings.dyslexiaLetterSpacing = Math.max(settings.dyslexiaLetterSpacing, 0.03);
          settings.dyslexiaLineHeight = Math.max(settings.dyslexiaLineHeight, 1.6);
          settings.ttsEnabled = true;
          settings.reduceMotion = true;
          break;
        case 'hardOfHearing':
          settings.ttsEnabled = false;
          settings.hapticFeedback = true;
          settings.visualCaptionMode = true;
          break;
      }
    });

    return settings;
  }
}

export const accessibilityService = new AccessibilityService();

