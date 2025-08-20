import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import socialThumbnail from '@assets/Untitled design (37)_1754507023303.png';

interface UsePageTitleOptions {
  productName?: string;
  [key: string]: any;
}

interface UsePageMetaOptions extends UsePageTitleOptions {
  description?: string;
  image?: string;
  url?: string;
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

export function usePageMeta(titleKey: string, descriptionKey: string, options: UsePageMetaOptions = {}) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Generate the title and description with interpolation if needed
    const title = t(`pageTitle.${titleKey}`, options) as string;
    const description = options.description || t(`pageDescription.${descriptionKey}`, options) as string;
    const image = options.image || socialThumbnail;
    const url = options.url || window.location.href;
    
    // Update basic meta tags
    document.title = title;
    document.documentElement.setAttribute('lang', i18n.language);
    
    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (meta) {
        meta.content = content;
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };
    
    // Update description meta tag
    updateMetaTag('description', description);
    
    // Update Open Graph meta tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'Vel France', true);
    
    // Update Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Additional meta tags for better social sharing
    updateMetaTag('twitter:site', '@VelFrance');
    updateMetaTag('twitter:creator', '@VelFrance');
    
  }, [titleKey, descriptionKey, options, t, i18n.language]);
}