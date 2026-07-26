import type { A11yPreset, AccessibilitySettings } from '@/lib/types';

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
      'bf_disability_profile',
      'bf_active_preset',
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
    ];
    cookieNames.forEach((c) => {
      document.cookie = `${c}=; max-age=0; path=/`;
    });
  }

  /**
   * Translate preset string into default settings configuration.
   */
  public getPresetConfig(preset: A11yPreset): Partial<AccessibilitySettings> {
    switch (preset) {
      case 'visual':
        return {
          activePreset: 'visual',
          highContrast: true,
          fontScale: 'xlarge',
          fontMultiplier: 1.5,
          ttsEnabled: true,
          reduceMotion: false,
        };
      case 'hearing':
        return {
          activePreset: 'hearing',
          highContrast: true,
          fontScale: 'large',
          ttsEnabled: false,
          hapticFeedback: true,
          reduceMotion: false,
        };
      case 'mobility':
        return {
          activePreset: 'mobility',
          fontScale: 'large',
          highContrast: false,
          ttsEnabled: true,
          reduceMotion: false,
          debounceMode: true,
          debounceDuration: 500,
        };
      case 'cognitive':
        return {
          activePreset: 'cognitive',
          reduceMotion: true,
          fontScale: 'large',
          highContrast: false,
          ttsEnabled: true,
          easyMode: true,
        };
      case 'default':
      default:
        return {
          activePreset: 'default',
          highContrast: false,
          fontScale: 'normal',
          fontMultiplier: 1.0,
          ttsEnabled: false,
          reduceMotion: false,
          hapticFeedback: true,
          dyslexiaMode: false,
          debounceMode: false,
          darkMode: false,
          colorBlindMode: false,
          easyMode: false,
          lowReachMode: false,
        };
    }
  }
}

export const accessibilityService = new AccessibilityService();
