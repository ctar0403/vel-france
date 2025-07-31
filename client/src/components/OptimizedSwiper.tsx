import { memo, useCallback, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { LazyImage } from '@/components/LazyImage';
import type { SwiperOptions } from 'swiper/types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface OptimizedSwiperProps {
  images: string[];
  autoplay?: boolean;
  navigation?: boolean;
  pagination?: boolean;
  loop?: boolean;
  spaceBetween?: number;
  slidesPerView?: number | 'auto';
  breakpoints?: SwiperOptions['breakpoints'];
  className?: string;
}

const OptimizedSwiper = memo(({
  images,
  autoplay = true,
  navigation = true,
  pagination = true,
  loop = true,
  spaceBetween = 0,
  slidesPerView = 1,
  breakpoints,
  className = '',
}: OptimizedSwiperProps) => {
  const swiperModules = useMemo(() => {
    const modules = [];
    if (navigation) modules.push(Navigation);
    if (pagination) modules.push(Pagination);
    if (autoplay) modules.push(Autoplay);
    return modules;
  }, [navigation, pagination, autoplay]);

  const swiperConfig: SwiperOptions = useMemo(() => ({
    modules: swiperModules,
    spaceBetween,
    slidesPerView,
    loop: loop && images.length > 1,
    autoplay: autoplay ? {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    } : false,
    navigation: navigation ? {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    } : false,
    pagination: pagination ? {
      clickable: true,
      dynamicBullets: images.length > 5,
    } : false,
    breakpoints,
    preloadImages: false,
    lazy: true,
    watchSlidesProgress: true,
    observer: true,
    observeParents: true,
  }), [swiperModules, spaceBetween, slidesPerView, loop, autoplay, navigation, pagination, breakpoints, images.length]);

  const handleImageError = useCallback((index: number) => {
    console.warn(`Failed to load image at index ${index}`);
  }, []);

  if (!images.length) {
    return (
      <div className={`aspect-video bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Swiper {...swiperConfig}>
        {images.map((image, index) => (
          <SwiperSlide key={`slide-${index}`}>
            <div className="relative w-full aspect-video">
              <LazyImage
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full"
                onError={() => handleImageError(index)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});

OptimizedSwiper.displayName = 'OptimizedSwiper';

export { OptimizedSwiper };