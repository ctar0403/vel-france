import React, { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Minus, Plus, Shield, Truck, RotateCcw, Loader2 } from "lucide-react";

// Payment method logos
import bogInstallmentLogo from "@assets/Untitled design (30)_1753640190162.png";
import partByPartLogo from "@assets/Untitled (500 x 200 px)_1753642797466.png";
import visaLogo from "@assets/Visa_2021.svg_1753638560432.png";
import mastercardLogo from "@assets/Mastercard-logo.svg_1753638587439.png";
import amexLogo from "@assets/American-Express-Color_1753638617821.png";
import googlePayLogo from "@assets/Google_Pay_Logo.svg_1753638503746.png";
import applePayLogo from "@assets/Apple_Pay_logo.svg_1753638450992.png";
import bankLogo from "@assets/Untitled design (29)_1753639145761.png";
import bogLogo2 from "@assets/BGEO.L-9c80f039_1753639252317.png";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const [quantity, setQuantity] = useState(1);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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

  // Payment handler functions
  const handleCardPayment = () => {
    handleAddToCart();
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  const handleInstallmentPayment = () => {
    if (!product) return;
    
    const totalAmount = parseFloat(product.price) * quantity;
    setIsProcessingPayment(true);

    // Handle adding to cart first
    addToCartMutation.mutate();

    if (typeof window !== 'undefined' && window.BOG) {
      window.BOG.Calculator.open({
        amount: totalAmount,
        bnpl: false,
        onClose: () => {
          setIsProcessingPayment(false);
        },
        onRequest: (selected, successCb, closeCb) => {
          setTimeout(() => {
            const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            successCb(orderId);
            toast({
              title: "Installment Plan Approved",
              description: `Your ${selected.month}-month installment plan has been set up.`
            });
          }, 2000);
        },
        onComplete: (data) => {
          setIsProcessingPayment(false);
          toast({
            title: "Payment Successful",
            description: "Your installment payment has been processed successfully."
          });
          return true;
        }
      });
    } else {
      toast({
        title: "Payment Service Unavailable",
        description: "BOG payment service is currently unavailable. Please try again later.",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
  };

  const handleBnplPayment = () => {
    if (!product) return;
    
    const totalAmount = parseFloat(product.price) * quantity;
    setIsProcessingPayment(true);

    // Handle adding to cart first
    addToCartMutation.mutate();

    if (typeof window !== 'undefined' && window.BOG) {
      window.BOG.Calculator.open({
        amount: totalAmount,
        bnpl: true,
        onClose: () => {
          setIsProcessingPayment(false);
        },
        onRequest: (selected, successCb, closeCb) => {
          setTimeout(() => {
            const orderId = `BNPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            successCb(orderId);
            toast({
              title: "Part-by-Part Payment Approved",
              description: "Your 4-part payment plan has been set up."
            });
          }, 2000);
        },
        onComplete: (data) => {
          setIsProcessingPayment(false);
          toast({
            title: "Payment Successful",
            description: "Your part-by-part payment has been processed successfully."
          });
          return true;
        }
      });
    } else {
      toast({
        title: "Payment Service Unavailable",
        description: "Part-by-part payment service is currently unavailable. Please try again later.",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
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
                  
                  <h1 className="text-4xl font-bold text-navy leading-tight">
                    {product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) 
                      ? `${product.brand} – ${product.name}` 
                      : product.name}
                  </h1>

                </div>
                
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
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart - ₾{(parseFloat(product.price) * quantity).toFixed(2)}
                    </>
                  )}
                </Button>

                {/* Payment Options */}
                <div className="space-y-3">
                  <div className="text-center text-navy/60 text-sm font-medium mb-4">
                    Or choose a payment option:
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
                          <h3 className="text-base font-bold text-slate-800">Instant Card Payment</h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-800">₾{(parseFloat(product.price) * quantity).toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">ACCEPTED METHODS</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">SECURE</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={visaLogo} alt="Visa" className="h-4 object-contain opacity-80 hover:opacity-100" />
                          <img src={mastercardLogo} alt="Mastercard" className="h-4 object-contain opacity-80 hover:opacity-100" />
                          <img src={amexLogo} alt="American Express" className="h-4 object-contain opacity-80 hover:opacity-100" />
                          <div className="w-px h-3 bg-gray-300"></div>
                          <img src={googlePayLogo} alt="Google Pay" className="h-3 object-contain opacity-80 hover:opacity-100" />
                          <img src={applePayLogo} alt="Apple Pay" className="h-3 object-contain opacity-80 hover:opacity-100" />
                          <div className="w-px h-3 bg-gray-300"></div>
                          <img src={bankLogo} alt="Bank Transfer" className="h-4 object-contain opacity-80 hover:opacity-100" />
                          <img src={bogLogo2} alt="Bank of Georgia" className="h-4 object-contain opacity-80 hover:opacity-100" />
                        </div>
                        <span className="text-xs text-slate-500">Instant</span>
                      </div>
                    </div>
                  </div>

                  {/* BOG Installment Payment Button */}
                  <Button
                    type="button"
                    onClick={handleInstallmentPayment}
                    className="w-full h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white font-roboto font-medium hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-between rounded-2xl p-4 group relative overflow-hidden"
                    disabled={isProcessingPayment || !product.inStock}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center relative z-10">
                      <img 
                        src={bogInstallmentLogo} 
                        alt="Bank of Georgia"
                        className="w-10 h-10 object-contain mr-4"
                      />
                      <div className="text-left">
                        <div className="font-semibold text-base tracking-wide">BOG Installments</div>
                        <div className="text-sm opacity-90 text-orange-100">Flexible monthly payment plan</div>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <div className="text-lg font-bold text-white">₾{((parseFloat(product.price) * quantity) / 12).toFixed(2)}/mo</div>
                      <div className="text-sm opacity-90 text-orange-100">12 months available</div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60"></div>
                  </Button>

                  {/* Part-by-Part Payment Button */}
                  <Button
                    type="button"
                    onClick={handleBnplPayment}
                    className="w-full h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white font-roboto font-medium hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-between rounded-2xl p-4 group relative overflow-hidden"
                    disabled={isProcessingPayment || !product.inStock}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-purple-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center relative z-10">
                      <img 
                        src={partByPartLogo} 
                        alt="Part by Part"
                        className="w-10 h-10 object-contain mr-4"
                      />
                      <div className="text-left">
                        <div className="font-semibold text-base tracking-wide">Part-by-Part</div>
                        <div className="text-sm opacity-90 text-purple-100">Buy now, pay in 4 interest-free parts</div>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <div className="text-lg font-bold text-white">₾{((parseFloat(product.price) * quantity) / 4).toFixed(2)} × 4</div>
                      <div className="text-sm opacity-90 text-purple-100">Zero interest payments</div>
                    </div>
                  </Button>
                </div>

                {!product.inStock && (
                  <p className="text-red-600 text-center font-medium">Currently out of stock</p>
                )}

                {/* Processing State */}
                {isProcessingPayment && (
                  <div className="bg-gradient-to-r from-gold/10 via-white to-gold/10 rounded-2xl border border-gold/30 shadow-lg p-4">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-gold/20 to-navy/10 rounded-full flex items-center justify-center mr-3 animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin text-gold" />
                      </div>
                      <div className="text-center">
                        <p className="text-navy font-medium text-sm">Processing Payment Request</p>
                        <p className="text-navy/60 text-xs">Connecting to Bank of Georgia...</p>
                      </div>
                    </div>
                  </div>
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