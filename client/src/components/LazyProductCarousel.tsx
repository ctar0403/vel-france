import { memo, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CriticalProductCard } from '@/components/CriticalProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  discountPrice?: string;
}

interface LazyProductCarouselProps {
  products: Product[];
  slidesToShow?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const LazyProductCarousel = memo(({
  products,
  slidesToShow = 4,
  autoPlay = false,
  autoPlayInterval = 4000
}: LazyProductCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const maxIndex = Math.max(0, products.length - slidesToShow);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-play functionality
  useState(() => {
    if (!autoPlay || products.length <= slidesToShow) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  });

  const visibleProducts = useMemo(() => {
    return products.slice(currentIndex, currentIndex + slidesToShow);
  }, [products, currentIndex, slidesToShow]);

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No products available
      </div>
    );
  }

  const showNavigation = products.length > slidesToShow;

  return (
    <div className="relative">
      {/* Navigation buttons */}
      {showNavigation && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg"
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg"
            disabled={currentIndex >= maxIndex}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Products grid */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)` }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "flex-shrink-0 px-2",
                slidesToShow === 4 ? "w-1/4" : `w-1/${slidesToShow}`
              )}
            >
              <CriticalProductCard
                product={product}
                priority={index < 2} // First 2 products get priority loading
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {showNavigation && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-200",
                index === currentIndex ? "bg-gold" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
});

LazyProductCarousel.displayName = 'LazyProductCarousel';

export { LazyProductCarousel };