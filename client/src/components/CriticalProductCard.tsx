import { memo, useState } from 'react';
import { Link } from 'wouter';
import { OptimizedImage } from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  discountPrice?: string;
}

interface CriticalProductCardProps {
  product: Product;
  priority?: boolean;
  onAddToCart?: (productId: string) => void;
}

// Highly optimized product card for critical rendering path
const CriticalProductCard = memo(({ 
  product, 
  priority = false,
  onAddToCart 
}: CriticalProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart || !onAddToCart) return;
    
    setIsAddingToCart(true);
    try {
      await onAddToCart(product.id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: string): string => {
    const numPrice = parseFloat(price);
    return `${numPrice.toFixed(2)}₾`;
  };

  const hasDiscount = product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price);

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-200">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden">
          <OptimizedImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            priority={priority}
            width={320}
            height={320}
          />
          
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              -{Math.round((1 - parseFloat(product.discountPrice!) / parseFloat(product.price)) * 100)}%
            </div>
          )}
          
          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-white text-gray-900 hover:bg-gray-100"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 hover:bg-white"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="text-sm text-gray-600 font-medium">{product.brand}</div>
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.discountPrice!)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

CriticalProductCard.displayName = 'CriticalProductCard';

export { CriticalProductCard };