import { create } from 'zustand';
import { Language, translations, TranslationSchema } from './translations';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslationSchema;
}

const savedLang = (typeof window !== 'undefined' ? localStorage.getItem('roofray_language') : null) as Language | null;
const initialLanguage: Language = savedLang === 'bn' || savedLang === 'en' ? savedLang : 'en';

export const useLanguage = create<LanguageStore>((set) => ({
  language: initialLanguage,
  t: translations[initialLanguage],
  setLanguage: (lang: Language) => {
    try {
      localStorage.setItem('roofray_language', lang);
    } catch {
      // ignore
    }
    set({ language: lang, t: translations[lang] });
  },
  toggleLanguage: () => {
    set((state) => {
      const nextLang = state.language === 'en' ? 'bn' : 'en';
      try {
        localStorage.setItem('roofray_language', nextLang);
      } catch {
        // ignore
      }
      return { language: nextLang, t: translations[nextLang] };
    });
  },
}));
