import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import enToKo from '@/public/locales/en-to-ko.json';

export function useTranslation() {
  const language = useAccessibilityStore((state) => state.language);

  const t = (key: string, replacements?: Record<string, string | number>) => {
    let text = key;
    if (language === 'ko') {
      text = (enToKo as Record<string, string>)[key] || key;
    }

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, String(v));
      });
    }

    return text;
  };

  return { t, language };
}
