import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '@/components/ResponsiveImage';

// Import desktop images
import desktop1 from '@assets/4_1754504202405.webp';
import desktop2 from '@assets/Desktop-2_1754051373227.webp';
import desktop3 from '@assets/Desktop-3_1754051373227.webp';
import desktop4 from '@assets/Desktop-4_1754051373228.webp';
import desktop5 from '@assets/Desktop-5_1754051373228.webp';
import desktop6 from '@assets/Desktop-6_1754051373224.webp';

// Import mobile images
import mobile1 from '@assets/4_1754504202405_mobile.webp';
import mobile2 from '@assets/Mobile-2_1754051370154.webp';
import mobile3 from '@assets/Mobile-3_1754051370154.webp';
import mobile4 from '@assets/Mobile-4_1754051370154.webp';
import mobile5 from '@assets/Mobile-5_1754051370155.webp';
import mobile6 from '@assets/Mobile-6_1754051370152.webp';

interface HeroSliderProps {
  className?: string;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Handle banner click
  const handleBannerClick = () => {
    setLocation('/catalogue');
  };

  // Slide data with desktop and mobile versions
  const slides = [
    { desktop: desktop1, mobile: mobile1, alt: t('HeroSlider.velfrancediscount', 'VelFrance - Up to 60% Discount') },
    { desktop: desktop2, mobile: mobile2, alt: t('HeroSlider.jeanpaulgaultier', 'Jean Paul Gaultier - Gaultier Divine') },
    { desktop: desktop3, mobile: mobile3, alt: t('HeroSlider.chanelno5shop', 'Chanel No. 5 - Shop Now') },
    { desktop: desktop4, mobile: mobile4, alt: t('HeroSlider.missdior', 'Miss Dior - Absolutely Blooming') },
    { desktop: desktop5, mobile: mobile5, alt: t('HeroSlider.sauvageelixir', 'Sauvage - The New Elixir') },
    { desktop: desktop6, mobile: mobile6, alt: t('HeroSlider.cocomademoiselle', 'Coco Mademoiselle') }
  ];

  // Check if mobile viewport - using matchMedia to avoid forced reflows
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const checkMobile = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    checkMobile(mediaQuery);
    
    // Listen for changes
    mediaQuery.addEventListener('change', checkMobile);
    return () => mediaQuery.removeEventListener('change', checkMobile);
  }, []);

  // Preload all images
  useEffect(() => {
    const imagePromises: Promise<void>[] = [];
    
    slides.forEach(slide => {
      // Preload desktop image
      const desktopImg = new Image();
      const desktopPromise = new Promise<void>((resolve) => {
        desktopImg.onload = () => resolve();
        desktopImg.onerror = () => resolve(); // Continue even if image fails
      });
      desktopImg.src = slide.desktop;
      imagePromises.push(desktopPromise);

      // Preload mobile image
      const mobileImg = new Image();
      const mobilePromise = new Promise<void>((resolve) => {
        mobileImg.onload = () => resolve();
        mobileImg.onerror = () => resolve(); // Continue even if image fails
      });
      mobileImg.src = slide.mobile;
      imagePromises.push(mobilePromise);
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  // Auto-advance slides with pause on hover/touch
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (!imagesLoaded || isPaused) return;

    const interval = setInterval(() => {
      requestAnimationFrame(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      });
    }, 7000); // 7 seconds

    return () => clearInterval(interval);
  }, [imagesLoaded, slides.length, isPaused]);

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => prev === 0 ? slides.length - 1 : prev - 1);
    }
  };

  if (!imagesLoaded) {
    return (
      <div className={`w-full bg-gray-100 animate-pulse ${className}`}>
        <div className="aspect-[16/9] md:aspect-[21/9] w-full bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider container */}
      <div 
        className="flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <div 
              onClick={handleBannerClick}
              className="cursor-pointer w-full h-full"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleBannerClick()}
              aria-label={t('HeroSlider.gotocatalogue', 'Go to catalogue')}
            >
              <img
                src={isMobile ? slide.mobile : slide.desktop}
                alt={slide.alt}
                className="w-full h-auto object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                {...(index === 0 && { fetchpriority: "high" as const })}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced slide indicators - larger on mobile for better touch targets */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white opacity-100 scale-125' 
                : 'bg-white opacity-50 hover:opacity-75'
            }`}
            aria-label={t('HeroSlider.gotoslide', `Go to slide ${index + 1}`)}
          />
        ))}
      </div>

      {/* Always visible navigation arrows for both desktop and mobile */}
      <button
        onClick={() => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 z-10 opacity-90 hover:opacity-100"
        aria-label={t('HeroSlider.previousslide', 'Previous slide')}
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={() => setCurrentSlide((currentSlide + 1) % slides.length)}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 sm:p-3 rounded-full transition-all duration-300 z-10 opacity-90 hover:opacity-100"
        aria-label={t('HeroSlider.nextslide', 'Next slide')}
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default HeroSlider;