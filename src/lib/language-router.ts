import { useLocation } from 'wouter';
import i18n from './i18n';

export const SUPPORTED_LANGUAGES = ['ka', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Georgian is default (no prefix), English uses /en prefix
export const getLanguageFromPath = (path: string): SupportedLanguage => {
  if (path.startsWith('/en')) {
    return 'en';
  }
  return 'ka'; // Default to Georgian
};

export const getPathWithoutLanguage = (path: string): string => {
  if (path.startsWith('/en')) {
    return path.substring(3) || '/';
  }
  return path;
};

export const getPathWithLanguage = (path: string, language: SupportedLanguage): string => {
  const cleanPath = getPathWithoutLanguage(path);
  if (language === 'en') {
    return `/en${cleanPath === '/' ? '' : cleanPath}`;
  }
  return cleanPath;
};

export const useLanguageRouter = () => {
  const [location, setLocation] = useLocation();
  
  const currentLanguage = getLanguageFromPath(location);
  const pathWithoutLanguage = getPathWithoutLanguage(location);
  
  const navigateToLanguage = (language: SupportedLanguage, path?: string) => {
    const targetPath = path || pathWithoutLanguage;
    const newPath = getPathWithLanguage(targetPath, language);
    setLocation(newPath);
    i18n.changeLanguage(language);
  };
  
  const navigateToPath = (path: string) => {
    const newPath = getPathWithLanguage(path, currentLanguage);
    setLocation(newPath);
  };
  
  return {
    currentLanguage,
    pathWithoutLanguage,
    navigateToLanguage,
    navigateToPath,
    location
  };
};

// Initialize language from URL on app start
export const initializeLanguageFromURL = () => {
  const currentPath = window.location.pathname;
  const languageFromPath = getLanguageFromPath(currentPath);
  
  // Set i18n language based on URL
  i18n.changeLanguage(languageFromPath);
  
  return languageFromPath;
};