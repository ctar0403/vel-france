import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

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

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  onAddToCart,
  isAddingToCart = false,
  autoplay = false,
  showBadges = false,
  badgeText,
  badgeColor = "bg-gradient-to-r from-red-500 to-pink-500"
}) => {
  const formatProductName = (name: string, brand: string | null) => {
    return brand ? `${brand} – ${name}` : name;
  };

  const truncateDescription = (description: string, maxLength: number = 60) => {
    if (!description) return '';
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...'
      : description;
  };

  return (
    <div className="product-carousel-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={autoplay ? {
          delay: 3000,
          disableOnInteraction: false,
        } : false}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 25,
          },
          1280: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
        }}
        className="product-swiper"
      >
        {products.map((product, index) => (
          <SwiperSlide key={product.id}>
            <motion.div
              className="swiper-product-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Product Image */}
              <div className="product-image relative">
                <img
                  src={product.imageUrl || '/placeholder-perfume.jpg'}
                  alt={formatProductName(product.name, product.brand)}
                  loading="lazy"
                />
                
                {/* Badge - Hidden on mobile */}
                {showBadges && badgeText && (
                  <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full ${badgeColor} hidden md:block`}>
                    {badgeText(index)}
                  </div>
                )}
              </div>

              {/* Product Content */}
              <div className="product-content">
                <h3 className="product-title font-medium text-gray-900 mb-2">
                  {formatProductName(product.name, product.brand)}
                </h3>

                {/* Price - matching catalogue design */}
                <div className="mt-auto">
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-red-600">
                        ₾{(parseFloat(product.price.toString()) * (1 - product.discountPercentage / 100)).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₾{parseFloat(product.price.toString()).toFixed(2)}
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        -{product.discountPercentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold text-gray-900">
                      ₾{parseFloat(product.price.toString()).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
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
};

export default ProductCarousel;