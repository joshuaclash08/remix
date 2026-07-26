import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import ko from '@/public/locales/ko.json';
import en from '@/public/locales/en.json';

const dictionaries: Record<string, Record<string, string>> = {
  ko,
  en,
};

export function useTranslation() {
  const language = useAccessibilityStore((state) => state.language) || 'ko';

  const t = (key: string, replacements?: Record<string, string | number>) => {
    if (!key) return '';

    const currentDict = dictionaries[language] || dictionaries.ko;
    const fallbackDict = language === 'en' ? dictionaries.ko : dictionaries.en;

    let text = currentDict[key];

    if (!text && language === 'en') {
      text = dictionaries.en[key];
    }

    if (!text) {
      text = fallbackDict[key] || key;
    }

    if (replacements && text) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, String(v));
      });
    }

    return text;
  };

  return { t, language };
}

