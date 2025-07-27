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
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gold/20 to-navy/10 rounded-full flex items-center justify-center animate-pulse">
            <ShoppingBag className="h-8 w-8 text-navy/40" />
          </div>
          <p className="font-roboto text-lg text-navy/70 tracking-wide">Loading your collection...</p>
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
            <Link href="/catalogue">
              <Button 
                variant="ghost" 
                className="text-navy/70 hover:text-navy hover:bg-gold/10 font-roboto font-medium tracking-wide transition-all duration-300 rounded-xl px-6 py-3 group"
              >
                <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                Continue Shopping
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="font-roboto text-4xl font-light text-navy tracking-wide">Shopping Cart</h1>
            </div>
            <div className="w-[180px]"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gold/20 to-navy/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-navy/40" />
            </div>
            <h2 className="font-roboto text-3xl font-light text-navy mb-4 tracking-wide">Your collection awaits</h2>
            <p className="text-navy/60 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Discover our curated selection of luxury fragrances crafted for the discerning connoisseur
            </p>
            <Link href="/catalogue">
              <Button className="bg-gradient-to-r from-[#002c8c88] via-[#002c8c] to-[#001f66] text-white font-roboto font-semibold tracking-wide px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <span className="text-lg">Explore Fragrances</span>
                  <ArrowLeft className="ml-3 h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Luxury Cart Items */}
            <div className="xl:col-span-2">
              <div className="bg-gradient-to-br from-white via-cream/20 to-white rounded-3xl border border-gold/30 shadow-xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-roboto text-2xl font-light text-navy tracking-wide">Your Selection</h2>
                  <div className="bg-gradient-to-r from-navy/10 to-gold/10 px-4 py-2 rounded-full">
                    <span className="font-roboto text-sm font-medium text-navy">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                  </div>
                </div>
                <div className="space-y-8">
                  {cartItems.map((item: CartItem & { product: Product }, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-gradient-to-r from-white via-cream/30 to-white rounded-2xl border border-gold/20 p-6 hover:shadow-lg hover:border-gold/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-6">
                        {/* Luxury Product Image */}
                        <div className="relative w-24 h-24 bg-gradient-to-br from-cream to-pastel-pink/30 rounded-xl flex items-center justify-center border border-gold/20 group-hover:border-gold/40 transition-colors duration-300">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={`${item.product.brand} ${item.product.name}`}
                              className="w-20 h-20 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="text-center">
                              <div className="text-3xl mb-1">🌸</div>
                              <div className="text-xs text-navy/60 font-roboto">Fragrance</div>
                            </div>
                          )}
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-gold to-deep-gold rounded-full opacity-80"></div>
                        </div>

                        {/* Enhanced Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-roboto text-xl font-medium text-navy mb-1 tracking-wide truncate">
                            {item.product.brand ? `${item.product.brand} - ${item.product.name}` : item.product.name}
                          </h3>
                          <p className="text-navy/60 text-sm font-roboto mb-2 capitalize">{item.product.category}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-gold font-roboto font-semibold text-lg">₾{parseFloat(item.product.price).toFixed(2)}</span>
                            <span className="text-navy/40 text-sm">per bottle</span>
                          </div>
                        </div>

                        {/* Sophisticated Quantity Controls */}
                        <div className="flex items-center bg-gradient-to-r from-cream/50 to-white rounded-xl border border-gold/20 p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            className="h-10 w-10 p-0 text-navy/70 hover:text-navy hover:bg-gold/20 rounded-lg transition-all duration-200"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="min-w-[3rem] text-center">
                            <span className="font-roboto font-semibold text-navy text-lg">{item.quantity}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updateQuantityMutation.isPending}
                            className="h-10 w-10 p-0 text-navy/70 hover:text-navy hover:bg-gold/20 rounded-lg transition-all duration-200"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Elegant Subtotal */}
                        <div className="text-right min-w-[100px]">
                          <p className="font-roboto text-xl font-bold text-navy mb-1">
                            ₾{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-navy/50 text-xs font-roboto">subtotal</p>
                        </div>

                        {/* Refined Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={removeItemMutation.isPending}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 p-0 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {/* Subtle bottom accent */}
                      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sophisticated Order Summary */}
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-white via-cream/20 to-white rounded-3xl border border-gold/30 shadow-xl p-8 sticky top-8">
                <div className="text-center mb-8">
                  <h2 className="font-roboto text-2xl font-light text-navy tracking-wide mb-2">Order Summary</h2>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div className="bg-gradient-to-r from-cream/30 to-white rounded-xl p-4 border border-gold/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-navy/70 font-roboto text-sm">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                      <span className="text-navy font-roboto font-semibold">₾{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-navy/70 font-roboto text-sm">Shipping</span>
                      <span className="text-emerald-600 font-roboto font-medium">Free</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-navy/70 font-roboto text-sm">VAT included</span>
                      <span className="text-navy/70 font-roboto text-sm">₾0.00</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-navy/5 to-gold/5 rounded-xl p-5 border border-gold/30">
                    <div className="flex justify-between items-center">
                      <span className="font-roboto text-lg font-medium text-navy">Total</span>
                      <span className="font-roboto text-2xl font-bold text-gold">₾{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <Link href="/checkout">
                    <Button 
                      className="w-full h-14 bg-gradient-to-r from-[#002c8c88] via-[#002c8c] to-[#001f66] text-white font-roboto font-semibold tracking-wide hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl group relative overflow-hidden"
                      disabled={cartItems.length === 0}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <CreditCard className="mr-3 h-6 w-6 group-hover:rotate-3 transition-transform duration-300" />
                        <span className="text-lg">Proceed to Checkout</span>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60"></div>
                    </Button>
                  </Link>

                  <Link href="/catalogue">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 border-2 border-navy/20 text-navy hover:border-navy hover:bg-navy/5 hover:text-navy font-roboto font-medium tracking-wide transition-all duration-300 rounded-xl group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-navy/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span>Continue Shopping</span>
                      </div>
                    </Button>
                  </Link>
                </div>

                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}