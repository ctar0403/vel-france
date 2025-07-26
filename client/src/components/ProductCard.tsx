import { motion } from "framer-motion";
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
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'women': return 'FEMME';
      case 'men': return 'HOMME';
      case 'unisex': return 'MIXTE';
      default: return category.toUpperCase();
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'women': return 'text-pastel';
      case 'men': return 'text-navy';
      case 'unisex': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="relative overflow-hidden">
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'} 
            alt={`${product.name} luxury perfume`}
            className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Rupture de stock
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-roboto text-xl text-navy">{product.name}</h3>
            <Badge 
              variant="outline" 
              className={`text-sm font-semibold ${getCategoryStyle(product.category)}`}
            >
              {getCategoryLabel(product.category)}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.shortDescription || product.description}
          </p>
          
          {product.notes && (
            <div className="text-xs text-gray-500 mb-4 line-clamp-2">
              {product.notes}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-roboto font-bold text-gold">
              €{product.price}
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
                    <span>Panier</span>
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
                Se connecter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
