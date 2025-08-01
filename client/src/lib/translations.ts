import i18n from 'i18next';
import { useState, useEffect } from 'react';

// Create a cache for translations
let translationsCache: Record<string, Record<string, string>> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to convert flat keys to nested objects
function flatToNested(flat: Record<string, string>): Record<string, any> {
  const nested: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(flat)) {
    const keys = key.split('.');
    let current = nested;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
  }
  
  return nested;
}

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
    
    console.log(`Loaded ${translations.length} translations from API`);
    
    return {
      en: englishTranslations,
      ka: georgianTranslations
    };
  } catch (error) {
    console.warn('Failed to fetch translations from API, using fallback:', error);
    return { en: {}, ka: {} };
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
      
      console.log('Sample English translations:', Object.keys(translations.en).slice(0, 5));
      
      // Convert flat keys to nested objects for i18n
      const nestedEn = flatToNested(translations.en);
      const nestedKa = flatToNested(translations.ka);
      
      console.log('Nested structure sample:', Object.keys(nestedEn).slice(0, 5));
      
      // Add translations to i18n, merging with existing translations
      i18n.addResourceBundle('en', 'translation', nestedEn, true, true);
      i18n.addResourceBundle('ka', 'translation', nestedKa, true, true);
      
      console.log('Translations loaded successfully into i18n');
      
      // Test a specific translation
      console.log('Test translation for navigation.home:', i18n.t('navigation.home'));
      console.log('Current i18n language:', i18n.language);
    } else {
      console.warn('No translations received from API:', translations);
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

// Hook to ensure translations are loaded
export function useTranslationsReady(): boolean {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    loadTranslations().then(() => {
      setReady(true);
    });
  }, []);
  
  return ready;
}