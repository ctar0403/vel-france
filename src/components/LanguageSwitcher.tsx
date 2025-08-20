import React from 'react';
import { useTranslation } from 'react-i18next';
import { refreshTranslations } from '@/lib/translations';
import { useLanguageRouter } from '@/lib/language-router';
import type { SupportedLanguage } from '@/lib/language-router';
import georgianFlag from '@assets/197380_1754501720841.png';
import ukFlag from '@assets/United-kingdom_flag_icon_round.svg_1754501741206.png';

const languages = [
  { code: 'en' as SupportedLanguage, name: 'English', flag: ukFlag },
  { code: 'ka' as SupportedLanguage, name: 'ქართული', flag: georgianFlag },
];

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const { currentLanguage, navigateToLanguage } = useLanguageRouter();

  const changeLanguage = async (languageCode: SupportedLanguage) => {
    // First refresh translations to get the latest from database
    await refreshTranslations();
    // Navigate to the current page in the new language
    navigateToLanguage(languageCode);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
            currentLanguage === language.code
              ? 'border-gold shadow-lg'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          aria-label={`Switch to ${language.name}`}
        >
          <img
            src={language.flag}
            alt={language.name}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;