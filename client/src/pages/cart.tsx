import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem } from "@shared/schema";
import { Plus, Minus, Trash2, ShoppingBag, CreditCard, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { toast } = useToast();

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Reconnecting...",
          variant: "destructive",  
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Unable to update quantity.",
        variant: "destructive",
      });
    },
  });

  // Remove item from cart
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item Removed",
        description: "The item has been removed from your cart.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Reconnecting...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Unable to remove item.",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
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
        <div className="text-navy">Loading your cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gold/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-navy hover:text-gold">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="font-playfair text-3xl text-navy">Shopping Cart</h1>
            <div className="w-[140px]"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingBag className="mx-auto h-16 w-16 text-gold/50 mb-4" />
            <h2 className="font-playfair text-2xl text-navy mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Discover our exquisite perfume collection</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-gold to-deep-gold text-navy font-playfair font-semibold hover:shadow-lg transition-all duration-300">
                Explore Perfumes
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gold/20 p-6">
                <h2 className="font-playfair text-xl text-navy mb-6">Cart Items ({cartItems.length})</h2>
                <div className="space-y-6">
                  {cartItems.map((item: CartItem & { product: Product }) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-4 pb-6 border-b border-gold/20 last:border-b-0"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-pastel-pink/20 rounded-lg flex items-center justify-center">
                        <img 
                          src={item.product.imageUrl || "/placeholder-perfume.jpg"} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-playfair text-lg text-navy font-semibold">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm">{item.product.category}</p>
                        <p className="text-gold font-semibold">₾{parseFloat(item.product.price).toFixed(2)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 bg-cream rounded-lg p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                          className="h-8 w-8 p-0 text-navy hover:bg-gold/20"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[2rem] text-center font-semibold text-navy">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updateQuantityMutation.isPending}
                          className="h-8 w-8 p-0 text-navy hover:bg-gold/20"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <p className="font-playfair font-semibold text-navy">
                          ₾{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gold/20 p-6 sticky top-8">
                <h2 className="font-playfair text-xl text-navy mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
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
                  <div className="border-t border-gold/20 pt-4">
                    <div className="flex justify-between">
                      <span className="font-playfair text-lg font-semibold text-navy">Total</span>
                      <span className="font-playfair text-lg font-semibold text-navy">₾{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button 
                    className="w-full bg-gradient-to-r from-gold to-deep-gold text-navy font-playfair font-semibold hover:shadow-lg transition-all duration-300 mb-4"
                    disabled={cartItems.length === 0}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="w-full border-navy text-navy hover:bg-navy hover:text-white"
                  >
                    Continue Shopping
                  </Button>
                </Link>

                {/* Security Badge */}
                <div className="mt-6 bg-pastel-pink/20 p-4 rounded-lg border border-gold/20">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Secure checkout powered by</p>
                    <p className="font-semibold text-navy">Bank of Georgia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}