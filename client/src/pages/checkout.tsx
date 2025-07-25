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
  
  const [billingForm, setBillingForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Georgia"
  });

  const [sameBilling, setSameBilling] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'installment' | 'bnpl'>('card');

  const paymentMutation = useMutation({
    mutationFn: async (paymentMethod: 'card' | 'installment' | 'bnpl') => {
      const items = cartItems.map((item: CartItem & { product: Product }) => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const billingAddress = sameBilling ? shippingForm : billingForm;

      const response = await apiRequest("POST", "/api/payments/initiate", {
        shippingAddress: JSON.stringify(shippingForm),
        billingAddress: JSON.stringify(billingAddress),
        items,
        paymentMethod
      });

      return response;
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

    if (!sameBilling) {
      const isBillingValid = requiredFields.every(field => billingForm[field as keyof typeof billingForm]);
      if (!isBillingValid) {
        toast({
          title: "Missing Information", 
          description: "Please fill in all billing information fields.",
          variant: "destructive",
        });
        return false;
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-navy">Loading checkout...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-playfair text-2xl text-navy mb-4">Your cart is empty</h2>
          <Link href="/">
            <Button className="bg-gradient-to-r from-gold to-deep-gold text-navy font-playfair font-semibold">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gold/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/cart">
              <Button variant="ghost" className="text-navy hover:text-gold">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="font-playfair text-3xl text-navy">Secure Checkout</h1>
            <div className="w-[120px]"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white p-6 rounded-lg border border-gold/20">
                <h3 className="font-playfair text-xl text-navy mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping-firstName">First Name *</Label>
                    <Input
                      id="shipping-firstName"
                      value={shippingForm.firstName}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="border-gold/20 focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-lastName">Last Name *</Label>
                    <Input
                      id="shipping-lastName"
                      value={shippingForm.lastName}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="border-gold/20 focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-email">Email *</Label>
                    <Input
                      id="shipping-email"
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, email: e.target.value }))}
                      className="border-gold/20 focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-phone">Phone *</Label>
                    <Input
                      id="shipping-phone"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="border-gold/20 focus:border-gold"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="shipping-address">Address *</Label>
                    <Textarea
                      id="shipping-address"
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, address: e.target.value }))}
                      className="border-gold/20 focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-city">City *</Label>
                    <Input
                      id="shipping-city"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                      className="border-gold/20 focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping-postalCode">Postal Code *</Label>
                    <Input
                      id="shipping-postalCode"
                      value={shippingForm.postalCode}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="border-gold/20 focus:border-gold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-white p-6 rounded-lg border border-gold/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-xl text-navy">Billing Information</h3>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sameBilling}
                      onChange={(e) => setSameBilling(e.target.checked)}
                      className="rounded border-gold/20"
                    />
                    <span>Same as shipping</span>
                  </label>
                </div>
                
                {!sameBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billing-firstName">First Name *</Label>
                      <Input
                        id="billing-firstName"
                        value={billingForm.firstName}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="border-gold/20 focus:border-gold"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-lastName">Last Name *</Label>
                      <Input
                        id="billing-lastName"
                        value={billingForm.lastName}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="border-gold/20 focus:border-gold"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-email">Email *</Label>
                      <Input
                        id="billing-email"
                        type="email"
                        value={billingForm.email}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, email: e.target.value }))}
                        className="border-gold/20 focus:border-gold"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-phone">Phone *</Label>
                      <Input
                        id="billing-phone"
                        value={billingForm.phone}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="border-gold/20 focus:border-gold"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="billing-address">Address *</Label>
                      <Textarea
                        id="billing-address"
                        value={billingForm.address}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, address: e.target.value }))}
                        className="border-gold/20 focus:border-gold"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-city">City *</Label>
                      <Input
                        id="billing-city"
                        value={billingForm.city}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, city: e.target.value }))}
                        className="border-gold/20 focus:border-gold"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-postalCode">Postal Code *</Label>
                      <Input
                        id="billing-postalCode"
                        value={billingForm.postalCode}
                        onChange={(e) => setBillingForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="border-gold/20 focus:border-gold"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-pastel-pink/20 p-4 rounded-lg border border-gold/20">
                <div className="flex items-center text-navy">
                  <ShieldCheck className="mr-2 h-5 w-5 text-gold" />
                  <div>
                    <p className="font-playfair font-semibold">Secure Payment</p>
                    <p className="text-sm text-gray-600">
                      Your payment is processed securely through Bank of Georgia's encrypted payment system.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Link href="/cart" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-navy text-navy hover:bg-navy hover:text-white"
                    disabled={paymentMutation.isPending}
                  >
                    Back to Cart
                  </Button>
                </Link>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white p-6 rounded-lg border border-gold/20">
                <h3 className="font-playfair text-xl text-navy mb-6">Select Payment Method</h3>
                <div className="space-y-4">
                  {/* Card Payment Button */}
                  <Button
                    type="button"
                    onClick={() => validateForm() && paymentMutation.mutate('card')}
                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-playfair font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-between p-6"
                    disabled={paymentMutation.isPending}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-white rounded flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-bold text-sm">BOG</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Card Payment</div>
                        <div className="text-sm opacity-90">Pay with your debit or credit card</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">₾{total.toFixed(2)}</div>
                      <div className="text-sm opacity-90">One-time payment</div>
                    </div>
                  </Button>

                  {/* Installment Payment Button */}
                  <Button
                    type="button"
                    onClick={() => validateForm() && paymentMutation.mutate('installment')}
                    className="w-full h-16 bg-gradient-to-r from-green-600 to-green-700 text-white font-playfair font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-between p-6"
                    disabled={paymentMutation.isPending}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-white rounded flex items-center justify-center mr-4">
                        <span className="text-green-600 font-bold text-xs">LOAN</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">BOG Installments</div>
                        <div className="text-sm opacity-90">Pay in monthly installments*</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">₾{(total / 12).toFixed(2)}/mo</div>
                      <div className="text-sm opacity-90">for 12 months</div>
                    </div>
                  </Button>

                  {/* Part-by-Part Payment Button */}
                  <Button
                    type="button"
                    onClick={() => validateForm() && paymentMutation.mutate('bnpl')}
                    className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-playfair font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-between p-6"
                    disabled={paymentMutation.isPending}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-white rounded flex items-center justify-center mr-4">
                        <span className="text-purple-600 font-bold text-xs">BNPL</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">BOG Part-by-Part</div>
                        <div className="text-sm opacity-90">Buy now, pay later in parts*</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">₾{(total / 4).toFixed(2)} × 4</div>
                      <div className="text-sm opacity-90">Interest-free parts</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Processing State */}
              {paymentMutation.isPending && (
                <div className="bg-pastel-pink/20 p-4 rounded-lg border border-gold/20 flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-gold" />
                  <span className="text-navy font-playfair">Processing your payment request...</span>
                </div>
              )}

              {/* Payment Method Disclaimer */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">*Note:</span> Installment and Part-by-Part payments require BOG merchant account approval. 
                  If these options are not available for your account, the system will automatically redirect you to standard card payment.
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gold/20 p-6 sticky top-8">
              <h2 className="font-playfair text-xl text-navy mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item: CartItem & { product: Product }) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-pastel-pink/20 rounded-lg flex items-center justify-center">
                      <img 
                        src={item.product.imageUrl || "/placeholder-perfume.jpg"} 
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-navy text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-navy text-sm">
                        ₾{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t border-gold/20">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-navy">₾{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-navy">₾0.00</span>
                </div>
                <div className="border-t border-gold/20 pt-2">
                  <div className="flex justify-between">
                    <span className="font-playfair text-lg font-semibold text-navy">Total</span>
                    <span className="font-playfair text-lg font-semibold text-navy">₾{total.toFixed(2)}</span>
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