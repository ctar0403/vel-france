import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem } from "@shared/schema";
import { X, Plus, Minus, Trash2, ShoppingCart, CreditCard, Eye } from "lucide-react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: (CartItem & { product: Product })[];
  isLoading?: boolean;
}

export default function CartSidebar({ isOpen, onClose, cartItems, isLoading }: CartSidebarProps) {
  const { toast } = useToast();

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



  const total = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };



  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 bg-black/50 z-40 will-change-opacity"
              onClick={onClose}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 w-full md:w-[420px] h-full bg-gradient-to-b from-white via-cream/20 to-white shadow-2xl z-50 flex flex-col will-change-transform border-l border-gold/20"
            >
              {/* Elegant Header */}
              <div className="relative p-8 bg-gradient-to-r from-navy/5 to-gold/5 border-b border-gold/30">
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-cream/40"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="font-roboto text-2xl font-light text-navy tracking-wide">Shopping Cart</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-navy/60 hover:text-navy hover:bg-gold/10 rounded-full w-10 h-10 p-0 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Premium Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-cream/10">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex space-x-4 p-4 border-b border-gray-100 animate-pulse">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded" />
                          <div className="h-3 bg-gray-300 rounded w-2/3" />
                          <div className="h-6 bg-gray-300 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gold/20 to-navy/10 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-navy/40" />
                    </div>
                    <h4 className="text-navy font-roboto text-xl mb-3 font-light">
                      Your collection awaits
                    </h4>
                    <p className="text-navy/60 text-sm leading-relaxed max-w-xs mx-auto">
                      Discover our curated selection of luxury fragrances crafted for the discerning connoisseur
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15, delay: index * 0.01, ease: [0.4, 0, 0.2, 1] }}
                        className="group relative bg-gradient-to-br from-white to-cream/30 rounded-2xl p-5 mb-4 border border-gold/20 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {/* Luxury Product Card */}
                        <div className="flex space-x-4">
                          <div className="relative">
                            <img 
                              src={item.product.imageUrl || 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80'} 
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gold/20"
                            />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {item.quantity}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-roboto text-navy font-medium text-sm leading-tight mb-1 line-clamp-2">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-navy/60 mb-3">₾{item.product.price} each</p>
                            
                            {/* Elegant Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-8 h-8 p-0 border-gold/30 hover:border-gold hover:bg-gold/10 rounded-full transition-all duration-200"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={updateQuantityMutation.isPending}
                              >
                                <Minus className="h-3 w-3 text-navy/70" />
                              </Button>
                              <div className="px-3 py-1 bg-gradient-to-r from-gold/10 to-navy/5 rounded-lg text-sm font-medium text-navy min-w-[2.5rem] text-center border border-gold/20">
                                {item.quantity}
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-8 h-8 p-0 border-gold/30 hover:border-gold hover:bg-gold/10 rounded-full transition-all duration-200"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={updateQuantityMutation.isPending}
                              >
                                <Plus className="h-3 w-3 text-navy/70" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end justify-between">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItemMutation.mutate(item.id)}
                              disabled={removeItemMutation.isPending}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 p-0 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="text-right">
                              <p className="font-roboto font-bold text-lg text-gold">
                                ₾{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Luxury Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-gold/30 bg-gradient-to-r from-navy/5 to-gold/5 p-6 space-y-6">
                  {/* Total Section */}
                  <div className="bg-gradient-to-br from-white to-cream/40 rounded-2xl p-5 border border-gold/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-roboto text-sm text-navy/70">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span className="font-roboto text-lg font-bold text-navy">
                        ₾{total.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 my-3"></div>
                    <div className="flex items-center justify-between">
                      <span className="font-roboto text-lg font-medium text-navy">Total</span>
                      <span className="font-roboto text-2xl font-bold bg-gradient-to-r from-gold to-gold/80 bg-clip-text text-transparent">
                        ₾{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Luxury Action Buttons */}
                  <div className="space-y-3">
                    <Link href="/cart" onClick={onClose} className="block">
                      <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-navy/20 text-navy hover:border-navy hover:bg-navy/5 hover:text-navy font-roboto font-medium tracking-wide transition-all duration-300 rounded-xl group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-navy/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <Eye className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-base">View Full Cart</span>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/checkout" onClick={onClose} className="block">
                      <Button
                        className="w-full h-14 bg-gradient-to-r from-[#002c8c88] via-[#002c8c] to-[#001f66] text-white font-roboto font-semibold tracking-wide hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-xl group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <CreditCard className="mr-3 h-6 w-6 group-hover:rotate-3 transition-transform duration-300" />
                          <span className="text-lg">Proceed to Checkout</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60"></div>
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>


    </>
  );
}
