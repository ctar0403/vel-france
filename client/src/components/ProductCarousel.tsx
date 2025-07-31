import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { OptimizedImage } from '@/components/OptimizedImage';
import { memo, useCallback, useMemo, lazy, Suspense } from 'react';

// Import motion directly (will be optimized later)
import { motion } from "framer-motion";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: string | number;
  discountPercentage?: number | null;
  imageUrl: string | null;
  description?: string;
  categories: string[];
}

interface ProductCarouselProps {
  products: Product[];
  title: string;
  onAddToCart?: (productId: string) => void;
  isAddingToCart?: boolean;
  autoplay?: boolean;
  showBadges?: boolean;
  badgeText?: (index: number) => string;
  badgeColor?: string;
}

const ProductCarousel = memo<ProductCarouselProps>(({
  products,
  title,
  onAddToCart,
  isAddingToCart = false,
  autoplay = false,
  showBadges = false,
  badgeText,
  badgeColor = "bg-gradient-to-r from-red-500 to-pink-500"
}) => {
  const formatProductName = useCallback((name: string, brand: string | null) => {
    return brand ? `${brand} – ${name}` : name;
  }, []);

  const truncateDescription = useCallback((description: string, maxLength: number = 60) => {
    if (!description) return '';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'
      : description;
  }, []);

  // Memoize swiper configuration for performance
  const swiperConfig = useMemo(() => ({
    modules: [Navigation, Pagination, Autoplay],
    spaceBetween: 20,
    slidesPerView: 2,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      clickable: true,
      dynamicBullets: true,
    },
    autoplay: autoplay ? {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    } : false,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      768: { slidesPerView: 3, spaceBetween: 25 },
      1024: { slidesPerView: 4, spaceBetween: 30 },
    },
    watchSlidesProgress: true,
    // Optimize for performance
    preventInteractionOnTransition: true,
    updateOnWindowResize: false,
  }), [autoplay]);

  return (
    <div className="product-carousel-container">
      <Swiper {...swiperConfig}>
        {products.map((product, index) => (
          <SwiperSlide key={product.id}>
            <Link 
              to={`/product/${product.id}`}
              className="block h-full"
            >
            <motion.div
              className="swiper-product-card group cursor-pointer h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Product Image */}
              <div className="product-image relative">
                <OptimizedImage
                  src={product.imageUrl || '/placeholder-perfume.jpg'}
                  alt={formatProductName(product.name, product.brand)}
                  className="w-full h-full object-cover"
                  priority={index < 4} // Prioritize first 4 images
                />
                
                {/* Badge - Hidden on mobile */}
                {showBadges && badgeText && (
                  <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full ${badgeColor} hidden md:block`}>
                    {badgeText(index)}
                  </div>
                )}
              </div>

              {/* Product Content - Matching Catalogue Exactly */}
              <div className="p-6 flex-grow flex flex-col min-h-[120px]">
                <h3 className="text-lg text-navy leading-tight line-clamp-2 mb-3 font-normal">
                  {formatProductName(product.name, product.brand)}
                </h3>

                <div className="flex flex-col gap-1">
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-base text-gold font-normal">
                          ₾{(parseFloat(product.price.toString()) * (1 - product.discountPercentage / 100)).toFixed(2)}
                        </span>
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                          -{product.discountPercentage}%
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 line-through">
                        ₾{parseFloat(product.price.toString()).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-base text-gold font-normal">
                      ₾{parseFloat(product.price.toString()).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      <div className="swiper-button-prev">
        <ChevronLeft className="w-5 h-5" />
      </div>
      <div className="swiper-button-next">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
});

ProductCarousel.displayName = 'ProductCarousel';

export default ProductCarousel;