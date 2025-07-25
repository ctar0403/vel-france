import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import type { CartItem, Product } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: (CartItem & { product: Product })[];
  totalAmount: number;
}

export default function PaymentModal({ isOpen, onClose, cartItems, totalAmount }: PaymentModalProps) {
  const { toast } = useToast();
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

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const items = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const billingAddress = sameBilling ? shippingForm : billingForm;

      const response = await apiRequest("POST", "/api/payments/initiate", {
        shippingAddress: JSON.stringify(shippingForm),
        billingAddress: JSON.stringify(billingAddress),
        items
      });

      return response;
    },
    onSuccess: (data: any) => {
      // Redirect to BOG payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Payment Error",
          description: "Unable to redirect to payment page. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Unable to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    const isShippingValid = requiredFields.every(field => shippingForm[field as keyof typeof shippingForm]);
    
    if (!isShippingValid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping information fields.",
        variant: "destructive",
      });
      return;
    }

    if (!sameBilling) {
      const isBillingValid = requiredFields.every(field => billingForm[field as keyof typeof billingForm]);
      if (!isBillingValid) {
        toast({
          title: "Missing Information", 
          description: "Please fill in all billing information fields.",
          variant: "destructive",
        });
        return;
      }
    }

    paymentMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-cream border-gold/20">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl text-navy flex items-center">
            <CreditCard className="mr-2 h-6 w-6 text-gold" />
            Secure Checkout
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white p-4 rounded-lg border border-gold/20">
            <h3 className="font-playfair text-lg text-navy mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span className="font-semibold">₾{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gold/20 pt-2 flex justify-between items-center font-playfair text-lg font-semibold text-navy">
                <span>Total</span>
                <span>₾{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white p-4 rounded-lg border border-gold/20">
            <h3 className="font-playfair text-lg text-navy mb-3">Shipping Information</h3>
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
          <div className="bg-white p-4 rounded-lg border border-gold/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-playfair text-lg text-navy">Billing Information</h3>
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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-navy text-navy hover:bg-navy hover:text-white"
              disabled={paymentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-gold to-deep-gold text-navy font-playfair font-semibold hover:shadow-lg transition-all duration-300"
              disabled={paymentMutation.isPending}
            >
              {paymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₾{totalAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}