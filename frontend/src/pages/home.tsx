import React, { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

// Critical components loaded immediately
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Non-critical components lazy loaded
const ProductCarousel = lazy(() => import("../components/ProductCarousel"));
const ProductCard = lazy(() => import("@/components/ProductCard"));
const CartSidebar = lazy(() => import("@/components/CartSidebar"));

import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem, Order, User } from "@shared/schema";
import { ShoppingBag, User as UserIcon, Package } from "lucide-react";

function Home() {
  // IMMEDIATE BANNER RENDER TEST
  console.log("HOME COMPONENT IS RENDERING");

  // Add banner directly to body
  React.useEffect(() => {
    const banner = document.createElement('div');
    banner.innerHTML = 'EMERGENCY BANNER TEST - I AM VISIBLE';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 200px;
      background: red;
      color: white;
      font-size: 48px;
      font-weight: bold;
      text-align: center;
      line-height: 200px;
      z-index: 99999;
      border: 10px solid yellow;
    `;
    document.body.appendChild(banner);
    
    return () => {
      if (document.body.contains(banner)) {
        document.body.removeChild(banner);
      }
    };
  }, []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "Personal consultation",
    message: ""
  });

  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['/api/cart'],
    staleTime: 1000,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    },
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  console.log("HOME RENDERING JSX");
  
  return (
    <div className="min-h-screen bg-cream" style={{ marginTop: '220px' }}>
      <Header 
        cartItemCount={cartItemCount} 
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <Suspense fallback={<div>Loading...</div>}>
        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          isLoading={cartLoading}
        />
      </Suspense>
      
      {/* BANNER TEST - ABSOLUTE POSITIONING */}
      <div style={{
        position: 'relative',
        zIndex: 9999,
        width: '100%',
        height: '400px',
        backgroundColor: 'red',
        display: 'block',
        color: 'white',
        fontSize: '72px',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: '400px',
        border: '10px solid yellow'
      }}>
        BANNER TEST
      </div>
      
      {/* Most Sold Products Section */}
      <section className="pt-20 bg-gradient-to-br from-cream to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy mb-4 tracking-tight">Most Sold</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-deep-gold mx-auto mb-6"></div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">Discover the fragrances that captivate the world</p>
          </motion.div>

          <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
            <ProductCarousel
              products={products.slice(0, 12)}
              title="Most Sold"
              showBadges={true}
              badgeText={(index) => `#${index + 1} Bestseller`}
              badgeColor="bg-gradient-to-r from-red-500 to-pink-500"
              onAddToCart={(productId) => addToCartMutation.mutate(productId)}
              isAddingToCart={addToCartMutation.isPending}
            />
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;