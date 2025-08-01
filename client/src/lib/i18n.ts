import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { loadTranslations } from './translations';

// Start with empty resources - will be loaded from database
const resources = {
  en: {
    translation: {},
  },
  ka: {
    translation: {},
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },
    
    // Support for pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
  });

// Load translations from database on initialization
loadTranslations().catch(console.error);

export default i18n;