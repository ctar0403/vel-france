import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CreditCard, ShieldCheck, ArrowLeft } from "lucide-react";
import type { CartItem, Product } from "@shared/schema";

// Payment method logos
import bogLogo from "@assets/BGEO.L-9c80f039_1753638321901.png";
import bogLogo2 from "@assets/BGEO.L-9c80f039_1753639252317.png";
import bankLogo from "@assets/Untitled design (29)_1753639145761.png";
import visaLogo from "@assets/Visa_2021.svg_1753638560432.png";
import mastercardLogo from "@assets/Mastercard-logo.svg_1753638587439.png";
import amexLogo from "@assets/American-Express-Color_1753638617821.png";
import googlePayLogo from "@assets/Google_Pay_Logo.svg_1753638503746.png";
import applePayLogo from "@assets/Apple_Pay_logo.svg_1753638450992.png";

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

export default function CheckoutPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
  });

  const [shippingForm, setShippingForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Georgia"
  });
  
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'installment' | 'bnpl'>('card');

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: {paymentMethod: 'card', calculatorResult?: never} | {paymentMethod: 'installment' | 'bnpl', calculatorResult: any}) => {
      const items = cartItems.map((item: CartItem & { product: Product }) => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const billingAddress = shippingForm;

      // Use different endpoints based on payment method
      if (paymentData.paymentMethod === 'card') {
        const response = await apiRequest("POST", "/api/payments/initiate", {
          shippingAddress: JSON.stringify(shippingForm),
          billingAddress: JSON.stringify(billingAddress),
          items,
          paymentMethod: 'card'
        });
        return response;
      } else {
        // Use calculator endpoint for installment/bnpl
        const response = await apiRequest("POST", "/api/payments/initiate-with-calculator", {
          shippingAddress: JSON.stringify(shippingForm),
          billingAddress: JSON.stringify(billingAddress),
          items,
          calculatorResult: paymentData.calculatorResult,
          paymentMethod: paymentData.paymentMethod
        });
        return response;
      }
    },
    onSuccess: (data: any) => {
      // Debug: Log the complete response
      console.log("Payment response received:", data);
      
      // Redirect to BOG payment page
      if (data.paymentUrl) {
        console.log("Redirecting to:", data.paymentUrl);
        window.location.href = data.paymentUrl;
      } else {
        console.error("No paymentUrl in response:", data);
        toast({
          title: "Payment Error",
          description: "Unable to redirect to payment page. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Payment error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Failed",
        description: "Unable to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const isShippingValid = requiredFields.every(field => shippingForm[field as keyof typeof shippingForm]);
    
    if (!isShippingValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping information fields.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation is now handled by individual payment buttons
  };

  const calculateTotal = () => {
    return cartItems.reduce((total: number, item: CartItem & { product: Product }) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
  };

  const total = calculateTotal();

  // Payment method handlers
  const handleCardPayment = () => {
    if (!validateForm()) return;
    paymentMutation.mutate({ paymentMethod: 'card' });
  };



  const handleInstallmentPayment = () => {
    if (!validateForm()) return;
    
    if (!window.BOG) {
      toast({
        title: "Payment Error",
        description: "BOG payment system is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    window.BOG.Calculator.open({
      amount: total,
      bnpl: false, // Standard installment plan
      onClose: () => {
        console.log("BOG Calculator closed");
      },
      onRequest: (selected, successCb, closeCb) => {
        console.log("BOG Calculator selection:", selected);
        
        // Use the calculator results to create payment
        paymentMutation.mutate({ 
          paymentMethod: 'installment', 
          calculatorResult: selected 
        });
        
        // Close the modal since we're handling the flow ourselves
        closeCb();
      },
      onComplete: ({ redirectUrl }) => {
        return false; // Prevent automatic redirect
      }
    });
  };

  const handleBnplPayment = () => {
    if (!validateForm()) return;
    
    if (!window.BOG) {
      toast({
        title: "Payment Error",
        description: "BOG payment system is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    window.BOG.Calculator.open({
      amount: total,
      bnpl: true, // Part-by-part plan
      onClose: () => {
        console.log("BOG Calculator closed");
      },
      onRequest: (selected, successCb, closeCb) => {
        console.log("BOG Calculator selection:", selected);
        
        // Use the calculator results to create payment
        paymentMutation.mutate({ 
          paymentMethod: 'bnpl', 
          calculatorResult: selected 
        });
        
        // Close the modal since we're handling the flow ourselves
        closeCb();
      },
      onComplete: ({ redirectUrl }) => {
        return false; // Prevent automatic redirect
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gold/20 to-navy/10 rounded-full flex items-center justify-center animate-pulse">
            <CreditCard className="h-8 w-8 text-navy/40" />
          </div>
          <p className="font-roboto text-lg text-navy/70 tracking-wide">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gold/20 to-navy/10 rounded-full flex items-center justify-center">
            <CreditCard className="h-16 w-16 text-navy/40" />
          </div>
          <h2 className="font-roboto text-3xl font-light text-navy mb-4 tracking-wide">Your cart is empty</h2>
          <p className="text-navy/60 text-lg mb-8">Add some luxury fragrances to proceed with checkout</p>
          <Link href="/catalogue">
            <Button className="bg-gradient-to-r from-[#002c8c88] via-[#002c8c] to-[#001f66] text-white font-roboto font-semibold tracking-wide px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300">
              Explore Fragrances
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink">
      {/* Luxury Header */}
      <div className="relative bg-gradient-to-r from-white via-cream/50 to-white border-b border-gold/30 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-navy/5 via-transparent to-gold/5"></div>
        <div className="container mx-auto px-6 py-8 relative">
          <div className="flex items-center justify-between">
            <Link href="/cart">
              <Button 
                variant="ghost" 
                className="text-navy/70 hover:text-navy hover:bg-gold/10 font-roboto font-medium tracking-wide transition-all duration-300 rounded-xl px-6 py-3 group"
              >
                <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Cart
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="font-roboto text-4xl font-light text-navy tracking-wide">Secure Checkout</h1>
            </div>
            <div className="w-[160px]"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
          {/* Enhanced Checkout Form */}
          <div className="xl:col-span-3 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Luxury Shipping Information */}
              <div className="bg-gradient-to-br from-white via-cream/20 to-white rounded-3xl border border-gold/30 shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-navy/10 to-gold/10 rounded-full flex items-center justify-center mr-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-navy to-gold rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                  </div>
                  <h3 className="font-roboto text-2xl font-light text-navy tracking-wide">Shipping Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="shipping-firstName" className="text-navy/80 font-roboto font-medium tracking-wide">First Name *</Label>
                    <Input
                      id="shipping-firstName"
                      value={shippingForm.firstName}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="h-12 border-2 border-navy/10 focus:border-gold/60 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 font-roboto text-navy placeholder:text-navy/40 hover:border-navy/20"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-lastName" className="text-navy/80 font-roboto font-medium tracking-wide">Last Name *</Label>
                    <Input
                      id="shipping-lastName"
                      value={shippingForm.lastName}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="h-12 border-2 border-navy/10 focus:border-gold/60 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 font-roboto text-navy placeholder:text-navy/40 hover:border-navy/20"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-email" className="text-navy/80 font-roboto font-medium tracking-wide">Email Address *</Label>
                    <Input
                      id="shipping-email"
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 border-2 border-navy/10 focus:border-gold/60 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 font-roboto text-navy placeholder:text-navy/40 hover:border-navy/20"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-phone" className="text-navy/80 font-roboto font-medium tracking-wide">Phone Number *</Label>
                    <Input
                      id="shipping-phone"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-12 border-2 border-navy/10 focus:border-gold/60 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 font-roboto text-navy placeholder:text-navy/40 hover:border-navy/20"
                      placeholder="+995 XXX XXX XXX"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="shipping-address" className="text-navy/80 font-roboto font-medium tracking-wide">Street Address *</Label>
                    <Textarea
                      id="shipping-address"
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, address: e.target.value }))}
                      className="min-h-[90px] border-2 border-navy/10 focus:border-gold/60 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 font-roboto text-navy placeholder:text-navy/40 hover:border-navy/20 resize-none"
                      placeholder="Enter your complete street address"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-city" className="text-navy/80 font-roboto font-medium tracking-wide">City *</Label>
                    <Input
                      id="shipping-city"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                      className="h-12 border-2 border-navy/10 focus:border-gold/60 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 font-roboto text-navy placeholder:text-navy/40 hover:border-navy/20"
                      placeholder="Tbilisi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-postalCode" className="text-navy/80 font-roboto font-medium tracking-wide">Postal Code *</Label>
                    <Input
                      id="shipping-postalCode"
                      value={shippingForm.postalCode}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="h-12 border-2 border-navy/10 focus:border-gold/60 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 font-roboto text-navy placeholder:text-navy/40 hover:border-navy/20"
                      placeholder="0100"
                      required
                    />
                  </div>
                </div>
              </div>

              

              

              {/* Luxury Payment Method Selection */}
              <div className="bg-gradient-to-br from-white via-cream/20 to-white rounded-3xl border border-gold/30 shadow-xl p-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-navy/10 to-gold/10 rounded-full flex items-center justify-center mr-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-navy to-gold rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                  </div>
                  <h3 className="font-roboto text-2xl font-light text-navy tracking-wide">Choose Payment Method</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Compact Card Payment Button */}
                  <div
                    onClick={handleCardPayment}
                    className="w-full bg-white shadow-md hover:shadow-lg cursor-pointer font-roboto hover:scale-[1.01] transition-all duration-200 rounded-2xl p-6 group relative"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <img 
                          src={bogLogo} 
                          alt="Bank of Georgia"
                          className="w-8 h-8 object-contain mr-4"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Instant Card Payment</h3>
                          <p className="text-sm text-slate-500">Bank of Georgia iPay</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-800">₾{total.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">Secure payment</div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-slate-600">ACCEPTED METHODS</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">SECURE</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={visaLogo} alt="Visa" className="h-5 object-contain opacity-80 hover:opacity-100" />
                          <img src={mastercardLogo} alt="Mastercard" className="h-5 object-contain opacity-80 hover:opacity-100" />
                          <img src={amexLogo} alt="American Express" className="h-5 object-contain opacity-80 hover:opacity-100" />
                          <div className="w-px h-4 bg-gray-300"></div>
                          <img src={googlePayLogo} alt="Google Pay" className="h-4 object-contain opacity-80 hover:opacity-100" />
                          <img src={applePayLogo} alt="Apple Pay" className="h-4 object-contain opacity-80 hover:opacity-100" />
                          <div className="w-px h-4 bg-gray-300"></div>
                          <img src={bankLogo} alt="Bank Transfer" className="h-5 object-contain opacity-80 hover:opacity-100" />
                          <img src={bogLogo2} alt="Bank of Georgia" className="h-5 object-contain opacity-80 hover:opacity-100" />
                        </div>
                        <span className="text-xs text-slate-500">Instant</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Installment Payment Button */}
                  <Button
                    type="button"
                    onClick={handleInstallmentPayment}
                    className="w-full h-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white font-roboto font-medium hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-between rounded-2xl p-6 group relative overflow-hidden"
                    disabled={paymentMutation.isPending}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center relative z-10">
                      <div className="w-14 h-10 bg-white rounded-xl flex items-center justify-center mr-5 shadow-md">
                        <span className="text-emerald-600 font-bold text-xs tracking-wider">LOAN</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg tracking-wide">BOG Installments</div>
                        <div className="text-sm opacity-90 text-emerald-100">Flexible monthly payment plan</div>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <div className="text-xl font-bold text-white">₾{(total / 12).toFixed(2)}/mo</div>
                      <div className="text-sm opacity-90 text-emerald-100">12 months available</div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60"></div>
                  </Button>

                  {/* Premium Part-by-Part Payment Button */}
                  <Button
                    type="button"
                    onClick={handleBnplPayment}
                    className="w-full h-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white font-roboto font-medium hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-between rounded-2xl p-6 group relative overflow-hidden"
                    disabled={paymentMutation.isPending}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center relative z-10">
                      <div className="w-14 h-10 bg-white rounded-xl flex items-center justify-center mr-5 shadow-md">
                        <span className="text-purple-600 font-bold text-xs tracking-wider">BNPL</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-lg tracking-wide">BOG Part-by-Part</div>
                        <div className="text-sm opacity-90 text-purple-100">Buy now, pay in 4 interest-free parts</div>
                      </div>
                    </div>
                    <div className="text-right relative z-10">
                      <div className="text-xl font-bold text-white">₾{(total / 4).toFixed(2)} × 4</div>
                      <div className="text-sm opacity-90 text-purple-100">Zero interest payments</div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60"></div>
                  </Button>
                </div>
              </div>

              {/* Premium Processing State */}
              {paymentMutation.isPending && (
                <div className="bg-gradient-to-r from-gold/10 via-white to-gold/10 rounded-3xl border border-gold/30 shadow-lg p-6">
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold/20 to-navy/10 rounded-full flex items-center justify-center mr-4 animate-pulse">
                      <Loader2 className="h-6 w-6 animate-spin text-gold" />
                    </div>
                    <div className="text-center">
                      <p className="text-navy font-roboto font-semibold text-lg tracking-wide">Processing Payment Request</p>
                      <p className="text-navy/60 text-sm mt-1">Connecting to Bank of Georgia secure gateway...</p>
                    </div>
                  </div>
                </div>
              )}

              
            </form>
          </div>

          {/* Luxury Order Summary */}
          <div className="xl:col-span-2">
            <div className="bg-gradient-to-br from-white via-cream/30 to-white rounded-3xl border border-gold/30 shadow-2xl p-8 sticky top-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-navy/10 to-gold/20 rounded-full flex items-center justify-center mr-4">
                  <CreditCard className="h-6 w-6 text-navy" />
                </div>
                <h2 className="font-roboto text-3xl font-light text-navy tracking-wide">Order Summary</h2>
              </div>
              
              <div className="space-y-6 mb-8">
                {cartItems.map((item: CartItem & { product: Product }) => (
                  <div key={item.id} className="bg-gradient-to-r from-white/60 to-cream/40 rounded-2xl p-5 border border-gold/20 shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gold/10 to-navy/5 rounded-xl flex items-center justify-center shadow-inner">
                        <img 
                          src={item.product.imageUrl || "/placeholder-perfume.jpg"} 
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-roboto font-medium text-navy text-lg tracking-wide">{item.product.name}</h4>
                        <p className="text-navy/60 font-roboto">Quantity: {item.quantity}</p>
                        <p className="text-navy/50 text-sm font-roboto mt-1">{item.product.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-roboto font-bold text-navy text-xl">
                          ₾{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-navy/60 text-sm font-roboto">
                          ₾{parseFloat(item.product.price).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-cream/30 to-white rounded-2xl p-6 border border-gold/30">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-navy/70 font-roboto font-medium tracking-wide">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span className="text-navy font-roboto font-semibold text-lg">₾{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-navy/70 font-roboto font-medium tracking-wide">Shipping</span>
                    <span className="text-emerald-600 font-roboto font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-navy/70 font-roboto font-medium tracking-wide">VAT included</span>
                    <span className="text-navy/70 font-roboto">₾0.00</span>
                  </div>
                </div>
                
                <div className="border-t border-gold/30 pt-4">
                  <div className="bg-gradient-to-r from-navy/5 to-gold/5 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-roboto text-xl font-medium text-navy tracking-wide">Total Amount</span>
                      <span className="font-roboto text-3xl font-bold text-gold">₾{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}