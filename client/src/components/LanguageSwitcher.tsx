import React from 'react';
import { useTranslation } from 'react-i18next';
import { refreshTranslations } from '@/lib/translations';
import ResponsiveImage from '@/components/ResponsiveImage';
import georgianFlag from '@assets/197380_1754501720841.png';
import ukFlag from '@assets/United-kingdom_flag_icon_round.svg_1754501741206.png';

const languages = [
  { code: 'en', name: 'English', flag: ukFlag },
  { code: 'ka', name: 'ქართული', flag: georgianFlag },
];

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const changeLanguage = async (languageCode: string) => {
    // First refresh translations to get the latest from database
    await refreshTranslations();
    // Then change language
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
            i18n.language === language.code
              ? 'border-gold shadow-lg'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          aria-label={`Switch to ${language.name}`}
        >
          <ResponsiveImage
            src={language.flag}
            alt={language.name}
            className="w-full h-full object-cover"
            imageType="flagIcon"
            width={28}
            height={28}
            loading="eager"
            priority={true}
          />
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;