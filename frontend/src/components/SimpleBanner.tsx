import React, { useState, useEffect } from 'react';

const SimpleBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Desktop and mobile banner URLs using direct file references
  const slides = [
    {
      desktop: '/attached_assets/desktop-1.webp',
      mobile: '/attached_assets/mobile-1.webp',
      alt: 'VelFrance - Up to 60% Discount'
    },
    {
      desktop: '/attached_assets/desktop-2.webp',
      mobile: '/attached_assets/mobile-2.webp',
      alt: 'Jean Paul Gaultier Divine'
    },
    {
      desktop: '/attached_assets/desktop-3.webp',
      mobile: '/attached_assets/mobile-3.webp',
      alt: 'Chanel N°5 Paris Parfum'
    },
    {
      desktop: '/attached_assets/desktop-4.webp',
      mobile: '/attached_assets/mobile-4.webp',
      alt: 'Miss Dior Absolutely Blooming'
    },
    {
      desktop: '/attached_assets/desktop-5.webp',
      mobile: '/attached_assets/mobile-5.webp',
      alt: 'Sauvage - The New Elixir'
    },
    {
      desktop: '/attached_assets/desktop-6.webp',
      mobile: '/attached_assets/mobile-6.webp',
      alt: 'Coco Mademoiselle'
    }
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

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full overflow-hidden bg-black">
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

export default SimpleBanner;