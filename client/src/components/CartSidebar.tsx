import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem } from "@shared/schema";
import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: (CartItem & { product: Product })[];
  isLoading?: boolean;
}

export default function CartSidebar({ isOpen, onClose, cartItems, isLoading }: CartSidebarProps) {
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    shippingAddress: "",
    billingAddress: "",
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
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité.",
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
        title: "Article retiré",
        description: "L'article a été retiré de votre panier.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de retirer l'article.",
        variant: "destructive",
      });
    },
  });

  // Create order
  const checkoutMutation = useMutation({
    mutationFn: async (data: typeof checkoutForm) => {
      const items = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      await apiRequest("POST", "/api/orders", {
        ...data,
        items
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Commande confirmée !",
        description: "Votre commande a été passée avec succès. Vous recevrez un email de confirmation.",
      });
      setIsCheckoutOpen(false);
      setCheckoutForm({ shippingAddress: "", billingAddress: "" });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Session expirée. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de finaliser la commande.",
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

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    checkoutMutation.mutate(checkoutForm);
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
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="fixed top-0 right-0 w-full md:w-96 h-full bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-playfair text-2xl text-navy">Votre Panier</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-navy"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
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
                  <div className="text-center py-16">
                    <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-playfair text-lg mb-2">
                      Votre panier est vide
                    </p>
                    <p className="text-gray-500 text-sm">
                      Découvrez nos parfums d'exception
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex space-x-4 p-4 border-b border-gray-100"
                      >
                        <img 
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80'} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-playfair text-navy">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">€{item.product.price}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0 border-gray-300"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3 py-1 bg-gray-100 rounded text-sm min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0 border-gray-300"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItemMutation.mutate(item.id)}
                            disabled={removeItemMutation.isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <span className="font-playfair font-bold text-gold">
                            €{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-playfair text-lg text-navy">Total:</span>
                    <span className="font-playfair text-2xl font-bold text-gold">
                      €{total.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-gold hover:bg-deep-gold text-navy py-3 font-playfair font-semibold transition-colors"
                    onClick={() => setIsCheckoutOpen(true)}
                    disabled={checkoutMutation.isPending}
                  >
                    Procéder au Paiement
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-navy">
              Finaliser la Commande
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCheckout} className="space-y-6">
            <div>
              <h3 className="font-playfair text-lg text-navy mb-4">Résumé de la commande</h3>
              <div className="bg-cream rounded-lg p-4 space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product.name} (x{item.quantity})</span>
                    <span>€{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gold/20 pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-gold">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-navy font-playfair mb-2">Adresse de livraison</label>
              <Textarea
                value={checkoutForm.shippingAddress}
                onChange={(e) => setCheckoutForm({...checkoutForm, shippingAddress: e.target.value})}
                className="border-gold/30 focus:border-gold resize-none"
                rows={4}
                placeholder="Nom complet&#10;Adresse&#10;Code postal, Ville&#10;Pays"
                required
              />
            </div>
            
            <div>
              <label className="block text-navy font-playfair mb-2">Adresse de facturation</label>
              <Textarea
                value={checkoutForm.billingAddress}
                onChange={(e) => setCheckoutForm({...checkoutForm, billingAddress: e.target.value})}
                className="border-gold/30 focus:border-gold resize-none"
                rows={4}
                placeholder="Même adresse ou adresse différente"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="border-gray-300"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-navy hover:bg-navy/90 text-white"
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? 'Traitement...' : 'Confirmer la Commande'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
