import React, { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Minus, Plus, Shield, Truck, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function ProductDetailPage() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const [quantity, setQuantity] = useState(1);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

  // Fetch product data
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    },
    enabled: !!productId,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        productId: product!.id,
        quantity: quantity
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ 
        title: "Added to cart", 
        description: `${quantity} × ${product?.name} added to your cart` 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    // Add to cart and redirect to checkout
    addToCartMutation.mutate();
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product?.name} ${isWishlisted ? "removed from" : "added to"} your wishlist`
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-navy"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy mb-4">Product not found</h2>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Single product image
  const productImage = product.imageUrl || "/placeholder-perfume.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream/50">
      <Header />
      
      {/* Main Product Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-navy hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalogue
          </Button>
        </motion.div>

        {/* Product Layout */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16">
          {/* Product Images Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-3xl border border-gold/20 shadow-2xl overflow-hidden">
              <motion.img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>

          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-gold/10 text-gold border-gold/20 mb-3">
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)} Fragrance
                  </Badge>
                  <h1 className="text-4xl font-bold text-navy leading-tight">
                    {product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) 
                      ? `${product.brand} – ${product.name}` 
                      : product.name}
                  </h1>

                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleWishlist}
                  className="text-navy hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-navy/60">4.8 (127 reviews)</span>
              </div>

              {/* Price */}
              <div className="text-4xl font-bold text-navy">
                ₾{parseFloat(product.price).toFixed(2)}
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-navy">Description</h3>
              <p className="text-navy/80 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity & Purchase */}
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-navy font-medium">Quantity:</span>
                <div className="flex items-center border border-gold/30 rounded-full overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 hover:bg-gold/10 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 hover:bg-gold/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending || !product.inStock}
                    className="h-14 bg-white border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="h-14 bg-gradient-to-r from-navy to-navy/90 hover:from-navy/90 hover:to-navy text-white"
                  >
                    Buy Now
                  </Button>
                </div>

                {!product.inStock && (
                  <p className="text-red-600 text-center font-medium">Currently out of stock</p>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-6 border-t border-gold/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 text-navy/70">
                  <Shield className="w-5 h-5 text-gold" />
                  <span className="text-sm">Authentic Guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-navy/70">
                  <Truck className="w-5 h-5 text-gold" />
                  <span className="text-sm">Free Shipping</span>
                </div>
                <div className="flex items-center gap-3 text-navy/70">
                  <RotateCcw className="w-5 h-5 text-gold" />
                  <span className="text-sm">30-Day Returns</span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4 pt-4">
              <span className="text-navy/60">Share:</span>
              <Button variant="ghost" size="icon" className="text-navy/60 hover:text-navy">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />


    </div>
  );
}

export default ProductDetailPage;