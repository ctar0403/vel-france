import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { loadTranslations } from './translations';

import enTranslations from '../locales/en.json';
import kaTranslations from '../locales/ka.json';

// Start with static translations as fallbacks
const resources = {
  en: {
    translation: enTranslations,
  },
  ka: {
    translation: kaTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ka', // default language (Georgian)
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },
    
    // Support for pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
  });

// Load translations from database on initialization with priority over static files
loadTranslations().catch(console.error);

// Update HTML lang attribute and data-language for font switching
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng);
  document.documentElement.setAttribute('data-language', lng);
});

// Set initial language attributes
if (typeof window !== 'undefined') {
  const currentLang = i18n.language || 'ka';
  document.documentElement.setAttribute('lang', currentLang);
  document.documentElement.setAttribute('data-language', currentLang);
}

export default i18n;