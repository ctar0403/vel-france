import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  isAddingToCart?: boolean;
  showAddToCart?: boolean;
}

export default function ProductCard({ 
  product, 
  onAddToCart, 
  isAddingToCart = false,
  showAddToCart = true 
}: ProductCardProps) {
  const { t, i18n } = useTranslation();
  
  // Get the appropriate description based on current language
  const getDescription = () => {
    const currentLang = i18n.language || 'en';
    const isGeorgian = currentLang === 'ka' || currentLang.startsWith('ka');
    
    // For Georgian language, prefer Georgian description
    if (isGeorgian && product.descriptionGeorgian) {
      return product.descriptionGeorgian;
    }
    
    // For English/other languages, prefer English description
    if (!isGeorgian && product.descriptionEnglish) {
      return product.descriptionEnglish;
    }
    
    // Fallback: if Georgian but no Georgian description, try English
    if (isGeorgian && !product.descriptionGeorgian && product.descriptionEnglish) {
      return product.descriptionEnglish;
    }
    
    // Final fallback to legacy description field
    return product.description || '';
  };
  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case 'women': 
      case "women's": return 'WOMEN';
      case 'men': 
      case "men's": return 'MEN';
      case 'unisex': return 'UNISEX';
      case 'niche': return 'NICHE';
      default: return category.toUpperCase();
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'women': 
      case "women's": return 'text-pastel';
      case 'men': 
      case "men's": return 'text-navy';
      case 'unisex': return 'text-gray-600';
      case 'niche': return 'text-gold';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="relative overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={`${product.brand} ${product.name} luxury perfume`}
              className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-cream to-gray-100">
              <div className="text-center p-4">
                <div className="text-6xl mb-2">🍃</div>
                <div className="text-navy font-roboto text-sm">{t('ProductCard.imagecomingsoon', 'Image Coming Soon')}</div>
              </div>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {t('ProductCard.outofstock', 'Out of Stock')}
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-roboto text-xl text-navy">
              {product.brand ? `${product.brand} - ${product.name}` : product.name}
            </h3>
            <Badge 
              variant="outline" 
              className={`text-sm font-semibold ${getCategoryStyle(product.category)}`}
            >
              {getCategoryLabel(product.category)}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {getDescription()}
          </p>
          
          {/* Capacity */}
          {product.capacity && (
            <div className="flex items-center gap-1 mb-3">
              <span className="text-xs font-medium text-navy/60">{t('product.capacity', 'Capacity')}:</span>
              <span className="text-xs font-semibold text-navy bg-gold/15 px-2 py-0.5 rounded-full">
                {product.capacity}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-roboto font-bold text-gold">
              ₾{product.price}
            </span>
            
            {showAddToCart && onAddToCart && product.inStock && (
              <Button
                onClick={() => onAddToCart(product.id)}
                disabled={isAddingToCart}
                className="bg-navy hover:bg-navy/90 text-white px-4 py-2 rounded-full text-sm transition-all duration-300 transform hover:scale-105"
              >
                {isAddingToCart ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Plus className="h-4 w-4" />
                    <span>{t('ProductCard.addtocart', 'Add to Cart')}</span>
                  </div>
                )}
              </Button>
            )}
            
            {!showAddToCart && (
              <Button
                variant="outline"
                className="border-gold text-navy hover:bg-gold hover:text-navy px-4 py-2 rounded-full text-sm"
                onClick={() => window.location.href = '/api/login'}
              >
                {t('ProductCard.signin', 'Sign In')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
