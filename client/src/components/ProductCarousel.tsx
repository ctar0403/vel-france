import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
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
    <div className="product-carousel-container relative group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        navigation={{
          nextEl: '.carousel-button-next',
          prevEl: '.carousel-button-prev',
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
                <img
                  src={product.imageUrl || '/placeholder-perfume.webp'}
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

      {/* Minimalistic Professional Navigation Arrows */}
      <div className="carousel-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-md hover:shadow-lg rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100">
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </div>
      <div className="carousel-button-next absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-md hover:shadow-lg rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100">
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </div>
    </div>
  );
};

export default ProductCarousel;