import { memo, useCallback } from 'react';
import { Link } from 'wouter';
import { LazyImage } from '@/components/LazyImage';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  discountPrice?: string;
  category: 'men' | 'women' | 'unisex';
}

interface OptimizedProductCardProps {
  product: Product;
  className?: string;
}

const OptimizedProductCard = memo(({ product, className = '' }: OptimizedProductCardProps) => {
  const handleImageError = useCallback(() => {
    console.warn(`Failed to load image for product ${product.id}`);
  }, [product.id]);

  const formatPrice = useCallback((price: string) => {
    return `${parseFloat(price).toFixed(2)}₾`;
  }, []);

  return (
    <Link href={`/product/${product.id}`}>
      <div className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <LazyImage
              src={product.imageUrl}
              alt={`${product.brand} ${product.name}`}
              className="w-full h-full"
              onError={handleImageError}
            />
            
            {/* Discount Badge */}
            {product.discountPrice && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Sale
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-playfair text-lg font-semibold text-navy mb-1 group-hover:text-gold transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-2 font-roboto">
              {product.brand}
            </p>
            
            {/* Price */}
            <div className="flex items-center gap-2">
              {product.discountPrice ? (
                <>
                  <span className="text-lg font-bold text-red-500 font-roboto">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through font-roboto">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-navy font-roboto">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export { OptimizedProductCard };