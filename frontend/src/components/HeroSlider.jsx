import React, { useState, useEffect, useCallback } from 'react';

// Import desktop images
import desktop1 from '@assets/desktop-1.webp';
import desktop2 from '@assets/desktop-2.webp';
import desktop3 from '@assets/desktop-3.webp';
import desktop4 from '@assets/desktop-4.webp';
import desktop5 from '@assets/desktop-5.webp';
import desktop6 from '@assets/desktop-6.webp';

// Import mobile images
import mobile1 from '@assets/mobile-1.webp';
import mobile2 from '@assets/mobile-2.webp';
import mobile3 from '@assets/mobile-3.webp';
import mobile4 from '@assets/mobile-4.webp';
import mobile5 from '@assets/mobile-5.webp';
import mobile6 from '@assets/mobile-6.webp';

const HeroSlider = ({ autoSlideInterval = 7000, className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Slide data with paired desktop and mobile images
  const slides = [
    { desktop: desktop1, mobile: mobile1, alt: 'VelFrance - Up to 60% Discount' },
    { desktop: desktop2, mobile: mobile2, alt: 'Jean Paul Gaultier Divine' },
    { desktop: desktop3, mobile: mobile3, alt: 'Chanel N°5 Paris Parfum' },
    { desktop: desktop4, mobile: mobile4, alt: 'Miss Dior Absolutely Blooming' },
    { desktop: desktop5, mobile: mobile5, alt: 'Sauvage - The New Elixir' },
    { desktop: desktop6, mobile: mobile6, alt: 'Coco Mademoiselle' },
  ];

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Preload all images
  useEffect(() => {
    const imagePromises = slides.flatMap(slide => [
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = slide.desktop;
      }),
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = slide.mobile;
      })
    ]);

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(error => {
        console.warn('Some images failed to preload:', error);
        setImagesLoaded(true); // Continue anyway
      });
  }, [slides]);

  // Auto-slide functionality
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [slides.length, autoSlideInterval, imagesLoaded]);

  // Manual slide navigation
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  if (!imagesLoaded) {
    return (
      <div className={`w-full bg-gray-200 animate-pulse ${className}`} style={{ aspectRatio: isMobile ? '4/5' : '16/9' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden bg-black ${className}`}>
      {/* Main slider container */}
      <div className="relative w-full">
        {/* Slides */}
        <div 
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={isMobile ? slide.mobile : slide.desktop}
                alt={slide.alt}
                className="w-full h-auto object-cover"
                style={{ display: 'block' }}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 opacity-80 hover:opacity-100 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-200 opacity-80 hover:opacity-100 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;