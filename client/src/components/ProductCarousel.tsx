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
                
                {/* Badge */}
                {showBadges && badgeText && (
                  <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full ${badgeColor} mobile-hide-badge`}>
                    {badgeText(index)}
                  </div>
                )}

                {/* Quick Add to Cart */}
                <motion.button
                  className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddToCart?.(product.id)}
                  disabled={isAddingToCart}
                >
                  <ShoppingCart className="w-4 h-4 text-navy" />
                </motion.button>
              </div>

              {/* Product Content */}
              <div className="product-content">
                <h3 className="product-title">
                  {formatProductName(product.name, product.brand)}
                </h3>

                {product.description && (
                  <p className="product-description">
                    {truncateDescription(product.description)}
                  </p>
                )}

                {/* Price */}
                <div className="product-price">
                  {product.discountPercentage && product.discountPercentage > 0 ? (
                    <div className="product-price discounted">
                      <span>
                        ₾{(parseFloat(product.price.toString()) * (1 - product.discountPercentage / 100)).toFixed(2)}
                      </span>
                      <span className="original-price">
                        ₾{parseFloat(product.price.toString()).toFixed(2)}
                      </span>
                      <span className="discount-badge">
                        -{product.discountPercentage}%
                      </span>
                    </div>
                  ) : (
                    <span>₾{parseFloat(product.price.toString()).toFixed(2)}</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  className="add-to-cart-btn"
                  onClick={() => onAddToCart?.(product.id)}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
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