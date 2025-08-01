import i18n from 'i18next';

// Create a cache for translations
let translationsCache: Record<string, Record<string, string>> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to fetch translations from the backend
export async function fetchTranslationsFromAPI(): Promise<Record<string, Record<string, string>>> {
  try {
    const response = await fetch('/api/translations');
    if (!response.ok) {
      throw new Error('Failed to fetch translations');
    }
    
    const translations = await response.json();
    
    // Convert array of translation objects to language key-value pairs
    const englishTranslations: Record<string, string> = {};
    const georgianTranslations: Record<string, string> = {};
    
    translations.forEach((translation: any) => {
      englishTranslations[translation.key] = translation.englishText;
      georgianTranslations[translation.key] = translation.georgianText || translation.englishText;
    });
    
    return {
      en: englishTranslations,
      ka: georgianTranslations
    };
  } catch (error) {
    console.warn('Failed to fetch translations from API, using fallback:', error);
    return {};
  }
}

// Function to load translations with caching
export async function loadTranslations(force = false): Promise<void> {
  const now = Date.now();
  
  // Check if cache is still valid
  if (!force && translationsCache.en && (now - lastFetchTime < CACHE_DURATION)) {
    return;
  }
  
  try {
    const translations = await fetchTranslationsFromAPI();
    
    if (translations.en && translations.ka) {
      translationsCache = translations;
      lastFetchTime = now;
      
      // Add translations to i18n
      i18n.addResourceBundle('en', 'translation', translations.en, true, true);
      i18n.addResourceBundle('ka', 'translation', translations.ka, true, true);
    }
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

// Function to get translation with fallback
export function getTranslation(key: string, fallback?: string): string {
  const translation = i18n.t(key);
  
  // If translation is the same as key (not found) and we have a fallback
  if (translation === key && fallback) {
    return fallback;
  }
  
  return translation;
}

// Function to force refresh translations
export async function refreshTranslations(): Promise<void> {
  await loadTranslations(true);
}