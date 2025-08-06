import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface UsePageTitleOptions {
  productName?: string;
  [key: string]: any;
}

export function usePageTitle(titleKey: string, options: UsePageTitleOptions = {}) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Generate the title with interpolation if needed
    const title = t(`pageTitle.${titleKey}`, options) as string;
    
    // Update the document title
    document.title = title;
    
    // Update the HTML lang attribute
    document.documentElement.setAttribute('lang', i18n.language);
  }, [titleKey, options, t, i18n.language]);
}