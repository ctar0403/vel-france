import { useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { loadTranslations } from '@/lib/translations';

interface TranslationProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function TranslationProvider({ children, fallback }: TranslationProviderProps) {
  const [translationsReady, setTranslationsReady] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const initializeTranslations = async () => {
      try {
        await loadTranslations(true); // Force fresh load
        setTranslationsReady(true);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Even if database translations fail, we can still use static ones
        setTranslationsReady(true);
      }
    };

    initializeTranslations();
  }, []);

  if (!translationsReady) {
    return fallback || (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-navy font-roboto">Loading translations...</div>
      </div>
    );
  }

  return <>{children}</>;
}