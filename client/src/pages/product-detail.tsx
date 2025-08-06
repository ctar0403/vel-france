import React, { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Minus, Plus, Shield, Truck, RotateCcw, Loader2 } from "lucide-react";

// Payment method logos
import bogInstallmentLogo from "@assets/Untitled design (30)_1753640190162.webp";
import partByPartLogo from "@assets/Untitled (500 x 200 px)_1753642797466.webp";
import visaLogo from "@assets/Visa_2021.svg_1753638560432.webp";
import mastercardLogo from "@assets/Mastercard-logo.svg_1753638587439.webp";
import amexLogo from "@assets/American-Express-Color_1753638617821.webp";
import googlePayLogo from "@assets/Google_Pay_Logo.svg_1753638503746.webp";
import applePayLogo from "@assets/Apple_Pay_logo.svg_1753638450992.webp";
import bankLogo from "@assets/Untitled design (29)_1753639145761.webp";
import bogLogo2 from "@assets/BGEO.L-9c80f039_1753639252317.webp";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loadBOGSDK, isBOGSDKAvailable, preloadBOGSDK } from "@/lib/bogSDK";
import type { Product, CartItem } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import ResponsiveImage from "@/components/ResponsiveImage";
import { usePageMeta } from "@/hooks/usePageTitle";

// Declare BOG global for TypeScript
declare global {
  interface Window {
    BOG: {
      Calculator: {
        open: (config: {
          amount: number;
          bnpl?: boolean;
          onClose?: () => void;
          onRequest?: (selected: { amount: number; month: number; discount_code: string }, successCb: (orderId: string) => void, closeCb: () => void) => void;
          onComplete?: (data: { redirectUrl: string }) => boolean;
        }) => void;
      };
    };
  }
}

function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toast } = useToast();

  // Fetch cart items for header (with product data for sidebar)
  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
  });

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

  // Set page title and meta tags with product name
  usePageMeta('product', 'product', { productName: product?.name || 'Product' });

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
        title: t('product.addedtocart', 'Added to cart'), 
        description: t('product.addedtocartdescription', '{{quantity}} × {{productName}} added to your cart', { quantity, productName: product?.name })
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: t('common.error', 'Error'), 
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

  // Payment handler functions
  const handleCardPayment = () => {
    handleAddToCart();
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const handleInstallmentPayment = () => {
    handleAddToCart();
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const handleBnplPayment = () => {
    handleAddToCart();
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? t('product.removedfromwishlist', 'Removed from wishlist') : t('product.addedtowishlist', 'Added to wishlist'),
      description: t('product.wishlistdescription', '{{productName}} {{action}} your wishlist', { 
        productName: product?.name, 
        action: isWishlisted ? t('product.removedfrom', 'removed from') : t('product.addedto', 'added to')
      })
    });
  };

  // Calculate cart count for header 
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Header 
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
        />
        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          isLoading={false}
        />
        <div className="flex items-center justify-center h-96">
          <motion.div
            initial={{ opacity: 0.6, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
            className="rounded-full h-32 w-32 border-b-2 border-navy"
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream">
        <Header 
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
        />
        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          isLoading={false}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy mb-4">{t('product.productnotfound', 'Product not found')}</h2>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.goback', 'Go Back')}
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
      <Header 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        isLoading={false}
      />
      
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
            {t('product.backtocatalogue', 'Back to Catalogue')}
          </Button>
        </motion.div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Product Images Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-3xl border border-gold/20 shadow-2xl overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
              >
                <ResponsiveImage
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 600px"
                  width={600}
                  height={600}
                  priority
                />
              </motion.div>
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
                  
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy leading-tight">
                    {product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) 
                      ? `${product.brand} – ${product.name}` 
                      : product.name}
                  </h1>

                </div>
                
              </div>

              

              {/* Price */}
              <div className="space-y-2">
                {product.discountPercentage && product.discountPercentage > 0 ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">
                        ₾{(parseFloat(product.price) * (1 - product.discountPercentage / 100)).toFixed(2)}
                      </div>
                      <span className="text-sm sm:text-lg bg-red-500 text-white px-3 py-1 rounded-full font-medium self-start sm:self-center">
                        -{product.discountPercentage}% {t('product.off', 'OFF')}
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">
                      ₾{parseFloat(product.price).toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy">
                    ₾{parseFloat(product.price).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-navy">{t('product.description', 'Description')}</h3>
              <p className="text-navy/80 leading-relaxed">
                {(() => {
                  const currentLang = i18n.language || 'en';
                  const isGeorgian = currentLang === 'ka' || currentLang.startsWith('ka');
                  
                  if (isGeorgian && product.descriptionGeorgian) {
                    return product.descriptionGeorgian;
                  }
                  if (!isGeorgian && product.descriptionEnglish) {
                    return product.descriptionEnglish;
                  }
                  if (isGeorgian && !product.descriptionGeorgian && product.descriptionEnglish) {
                    return product.descriptionEnglish;
                  }
                  return product.description || '';
                })()}
              </p>
            </div>

            {/* Quantity & Purchase */}
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-navy font-medium">{t('product.quantity', 'Quantity')}:</span>
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

              {/* Modern Add to Cart Button */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending || !product.inStock}
                  className="w-full h-16 bg-gradient-to-r from-navy to-navy/90 hover:from-navy/90 hover:to-navy text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {addToCartMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('product.addingtocart', 'Adding to Cart...')}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {t('product.addtocart', 'Add to Cart')} - ₾{(product.discountPercentage && product.discountPercentage > 0 
                        ? parseFloat(product.price) * (1 - product.discountPercentage / 100) * quantity
                        : parseFloat(product.price) * quantity
                      ).toFixed(2)}
                    </>
                  )}
                </Button>

                {/* Payment Options */}
                <div className="space-y-3">
                  <div className="text-center text-navy/60 text-sm font-medium mb-4">
                    {t('product.orchoosepaymentoption', 'Or choose a payment option:')}
                  </div>

                  {/* Compact Card Payment Button */}
                  <div
                    onClick={handleCardPayment}
                    className="w-full shadow-md hover:shadow-lg cursor-pointer font-roboto hover:scale-[1.01] transition-all duration-200 rounded-2xl p-4 group relative bg-[#e8e8e8]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div>
                          <h3 className="text-base font-bold text-slate-800">{t('product.instantcardpayment', 'Instant Card Payment')}</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-800">
                          ₾{(product.discountPercentage && product.discountPercentage > 0 
                            ? parseFloat(product.price) * (1 - product.discountPercentage / 100) * quantity
                            : parseFloat(product.price) * quantity
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">{t('product.acceptedmethods', 'ACCEPTED METHODS')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 overflow-x-auto">
                          <img src={visaLogo} alt="Visa" className="h-4 w-auto object-contain opacity-80 hover:opacity-100 flex-shrink-0" loading="eager" />
                          <img src={mastercardLogo} alt="Mastercard" className="h-4 w-auto object-contain opacity-80 hover:opacity-100 flex-shrink-0" loading="eager" />
                          <img src={amexLogo} alt="American Express" className="h-4 w-auto object-contain opacity-80 hover:opacity-100 flex-shrink-0" loading="eager" />
                          <div className="w-px h-3 bg-gray-300"></div>
                          <img src={googlePayLogo} alt="Google Pay" className="h-3 w-auto object-contain opacity-80 hover:opacity-100 flex-shrink-0" loading="eager" />
                          <img src={applePayLogo} alt="Apple Pay" className="h-3 w-auto object-contain opacity-80 hover:opacity-100 flex-shrink-0" loading="eager" />
                          <div className="w-px h-3 bg-gray-300"></div>
                          <img src={bankLogo} alt="Bank Transfer" className="h-4 w-auto object-contain opacity-80 hover:opacity-100 flex-shrink-0" loading="eager" />
                          <img src={bogLogo2} alt="Bank of Georgia" className="h-4 w-auto object-contain opacity-80 hover:opacity-100 flex-shrink-0" loading="eager" />
                        </div>
                        
                      </div>
                    </div>
                  </div>

                  {/* BOG Installment Payment Button */}
                  <Button
                    type="button"
                    onClick={handleInstallmentPayment}
                    onMouseEnter={() => preloadBOGSDK()}
                    className="w-full h-16 sm:h-18 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white font-roboto font-medium hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-between rounded-2xl p-3 sm:p-4 group relative overflow-hidden"
                    disabled={addToCartMutation.isPending || !product.inStock}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center relative z-10 min-w-0 flex-1">
                      <img 
                        src={bogInstallmentLogo} 
                        alt="Bank of Georgia"
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-2 sm:mr-4 flex-shrink-0"
                      />
                      <div className="text-left min-w-0">
                        <div className="font-semibold text-sm sm:text-base tracking-wide truncate">{t('product.boginstallments', 'BOG Installments')}</div>
                        <div className="text-xs sm:text-sm opacity-90 text-orange-100 truncate">{t('product.flexiblemonthlyplan', 'Flexible monthly plan')}</div>
                      </div>
                    </div>
                    <div className="text-right relative z-10 flex-shrink-0 ml-2">
                      <div className="text-sm sm:text-lg font-bold text-white whitespace-nowrap">
                        ₾{(product.discountPercentage && product.discountPercentage > 0 
                          ? (parseFloat(product.price) * (1 - product.discountPercentage / 100) * quantity) / 12
                          : (parseFloat(product.price) * quantity) / 12
                        ).toFixed(2)}/mo</div>
                      <div className="text-xs sm:text-sm opacity-90 text-orange-100 whitespace-nowrap">{t('product.months', '12 months', { count: 12 })}</div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60"></div>
                  </Button>

                  {/* Part-by-Part Payment Button */}
                  <Button
                    type="button"
                    onClick={handleBnplPayment}
                    onMouseEnter={() => preloadBOGSDK()}
                    className="w-full h-16 sm:h-18 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white font-roboto font-medium hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-between rounded-2xl p-3 sm:p-4 group relative overflow-hidden"
                    disabled={addToCartMutation.isPending || !product.inStock}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-purple-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center relative z-10 min-w-0 flex-1">
                      <img 
                        src={partByPartLogo} 
                        alt="Part by Part"
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain mr-2 sm:mr-4 flex-shrink-0"
                      />
                      <div className="text-left min-w-0">
                        <div className="font-semibold text-sm sm:text-base tracking-wide truncate">{t('product.partbypart', 'Part-by-Part')}</div>
                        <div className="text-xs sm:text-sm opacity-90 text-purple-100 truncate">{t('product.interestfreeparts', '4 interest-free parts', { count: 4 })}</div>
                      </div>
                    </div>
                    <div className="text-right relative z-10 flex-shrink-0 ml-2">
                      <div className="text-sm sm:text-lg font-bold text-white whitespace-nowrap">
                        ₾{(product.discountPercentage && product.discountPercentage > 0 
                          ? (parseFloat(product.price) * (1 - product.discountPercentage / 100) * quantity) / 4
                          : (parseFloat(product.price) * quantity) / 4
                        ).toFixed(2)} × 4</div>
                      <div className="text-xs sm:text-sm opacity-90 text-purple-100 whitespace-nowrap">{t('product.zerointerest', 'Zero interest')}</div>
                    </div>
                  </Button>
                </div>

                {!product.inStock && (
                  <p className="text-red-600 text-center font-medium">{t('product.outofstock', 'Currently out of stock')}</p>
                )}


              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-6 border-t border-gold/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 text-navy/70">
                  <Shield className="w-5 h-5 text-gold" />
                  <span className="text-sm">{t('product.authenticguarantee', 'Authentic Guarantee')}</span>
                </div>
                <div className="flex items-center gap-3 text-navy/70">
                  <Truck className="w-5 h-5 text-gold" />
                  <span className="text-sm">{t('product.freeshipping', 'Free Shipping')}</span>
                </div>
                
              </div>
            </div>

            
          </motion.div>
        </div>
      </div>

      <Footer />


    </div>
  );
}

export default ProductDetailPage;