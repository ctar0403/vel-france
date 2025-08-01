import React, { useState, useEffect, memo, useCallback, useMemo, lazy, Suspense } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

// Import motion directly for critical animations (will be optimized later)
import { motion } from "framer-motion";
import { Suspense } from "react";



// Critical components loaded immediately
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Non-critical components lazy loaded
const ProductCarousel = lazy(() => import("../components/ProductCarousel"));
const ProductCard = lazy(() => import("@/components/ProductCard"));
const CartSidebar = lazy(() => import("@/components/CartSidebar"));
const HeroSlider = lazy(() => import("@/components/HeroSlider"));
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem, Order, User } from "@shared/schema";
import { ShoppingBag, User as UserIcon, Package } from "lucide-react";




// Import new brand logos
import chanelLogo from "@assets/1_1753788502251_optimized.webp";
import versaceLogo from "@assets/2_1753788502252_optimized.webp";
import diorLogo from "@assets/3_1753788502252_optimized.webp";
import gucciLogo from "@assets/4_1753788502253_optimized.webp";
import armaneLogo from "@assets/5_1753788502254_optimized.webp";
import dgLogo from "@assets/6_1753788502254_optimized.webp";
import creedLogo from "@assets/7_1753788502255_optimized.webp";
import yslLogo from "@assets/8_1753788502255.webp";
import pradaLogo from "@assets/9_1753788502255.webp";
import claireFontaineLogo from "@assets/10_1753788502256_optimized.webp";

// Simple mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

interface CarouselProductCardProps {
  product: Product;
  index: number;
  badgeText: string;
  badgeColor: string;
  onAddToCart: () => void;
  isPending: boolean;
}

function CarouselProductCard({ product, index, badgeText, badgeColor, onAddToCart, isPending }: CarouselProductCardProps) {
  const [isCardHovered, setIsCardHovered] = React.useState(false);
  const [isButtonHovered, setIsButtonHovered] = React.useState(false);

  const formatProductName = (name: string, brand?: string | null) => {
    if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
      return `${brand} – ${name}`;
    }
    return name;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart();
  };

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        onHoverStart={() => setIsCardHovered(true)}
        onHoverEnd={() => setIsCardHovered(false)}
        className="carousel-product-card group relative bg-white rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
      >
        {/* Fixed Height Image Container */}
        <div className="aspect-square relative overflow-hidden flex-shrink-0">
          <motion.img
            src={product.imageUrl || "/placeholder-perfume.jpg"}
            alt={product.name}
            className="w-full h-full object-cover"
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            animate={{ 
              scale: isCardHovered ? 1.1 : 1,
              filter: isCardHovered ? "brightness(0.8)" : "brightness(1)"
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Elegant overlay gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isCardHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Badge - Hidden on mobile */}
          <div className="absolute top-4 left-4 mobile-hide-badge hidden md:block">
            <Badge className={`${badgeColor} text-white font-semibold px-3 py-1 text-sm`}>
              {badgeText}
            </Badge>
          </div>

          {/* Professional Add to Cart Button */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isCardHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.button
              onClick={handleAddToCart}
              disabled={isPending}
              onHoverStart={() => setIsButtonHovered(true)}
              onHoverEnd={() => setIsButtonHovered(false)}
              className={`relative backdrop-blur-sm px-6 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                isButtonHovered 
                  ? 'bg-[#000000] text-white border-[#000000]' 
                  : 'bg-white text-black border-white'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isCardHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div className="flex items-center gap-2">
                <motion.span
                  animate={{ 
                    opacity: isButtonHovered ? 0 : 1,
                  }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  Add to Cart
                </motion.span>
                
                <motion.div
                  animate={{ 
                    opacity: isButtonHovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={isPending ? { rotate: 360 } : {}}
                    transition={{ 
                      duration: 0.8, 
                      repeat: isPending ? Infinity : 0, 
                      ease: "linear" 
                    }}
                  >
                    <ShoppingBag className={`h-4 w-4 ${isButtonHovered ? 'text-white' : 'text-black'}`} />
                  </motion.div>
                  <span>Add to Cart</span>
                </motion.div>
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
        {/* Fixed Height Content Container */}
        <div className="mobile-content-height">
          <h3>
            {formatProductName(product.name, product.brand)}
          </h3>

          <div className="price-container">
            {product.discountPercentage && product.discountPercentage > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gold font-normal">
                    ₾{(parseFloat(product.price.toString()) * (1 - product.discountPercentage / 100)).toFixed(2)}
                  </span>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                    -{product.discountPercentage}%
                  </span>
                </div>
                <span className="text-xs text-gray-500 line-through">
                  ₾{parseFloat(product.price.toString()).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm text-gold font-normal">
                ₾{parseFloat(product.price.toString()).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
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
  const isMobile = useIsMobile();
  

  






  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    retry: false,
  });

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<(Order & { orderItems: any[] })[]>({
    queryKey: ["/api/orders"],
    retry: false,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Product Added",
        description: "The product has been added to your cart successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Unable to add the product to cart.",
        variant: "destructive",
      });
    },
  });

  // Newsletter subscription
  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", "/api/newsletter", { email });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You are now subscribed to our newsletter!",
      });
      setNewsletterEmail("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred during subscription.",
        variant: "destructive",
      });
    },
  });

  // Contact form submission
  const contactMutation = useMutation({
    mutationFn: async (data: typeof contactForm) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "We will respond to you as soon as possible.",
      });
      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        subject: "Personal consultation",
        message: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while sending the message.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      newsletterMutation.mutate(newsletterEmail);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(contactForm);
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const featuredProducts = products.slice(0, 3);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Define specific product lists in ranking order
  const mostSoldProductNames = [
    "Delina", "Bleu de Chanel", "Goddess", "Kirke", "Chance Eau Tendre", 
    "Libre", "Sauvage Elixir", "N5", "Stronger With You Intensely", 
    "Queen Of Silk", "K", "Le Male Elixir"
  ];

  const newArrivalsProductNames = [
    "Italian Leather", "Russian Leather", "Divine", "Ganymede", "Tilia", 
    "Encelade", "Libre Intense", "Homme Intense", "Erba Pura", 
    "Ombre Nomade", "Oud Satin Mood", "Paradoxe Intense"
  ];

  // Filter and sort products by ranking order
  const mostSoldProducts = mostSoldProductNames
    .map(name => products.find(product => product.name === name))
    .filter(product => product !== undefined) as Product[];

  const newArrivalsProducts = products.filter(product => 
    newArrivalsProductNames.includes(product.name)
  );

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
        isLoading={cartLoading}
      />
      
      {/* Hero Banner Slider */}
      <Suspense fallback={<div className="w-full h-[50vh] bg-gray-200 animate-pulse"></div>}>
        <HeroSlider />
      </Suspense>
      
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

          <ProductCarousel
            products={mostSoldProducts}
            title="Most Sold"
            showBadges={true}
            badgeText={(index) => `#${index + 1} Bestseller`}
            badgeColor="bg-gradient-to-r from-red-500 to-pink-500"
            onAddToCart={(productId) => addToCartMutation.mutate(productId)}
            isAddingToCart={addToCartMutation.isPending}
          />
        </div>
      </section>
      {/* Brand Logos Auto-Moving Carousel */}
      <section className="py-16 bg-navy overflow-hidden">
        
        
        <div className="relative">
          <div className="flex animate-marquee space-x-8 sm:space-x-12 lg:space-x-16 items-center">
            {/* First set of brand logos */}
            <div className="flex-shrink-0">
              <img src={chanelLogo} alt="Chanel" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={versaceLogo} alt="Versace" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={diorLogo} alt="Dior" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={gucciLogo} alt="Gucci" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={armaneLogo} alt="Armane" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={dgLogo} alt="Dolce & Gabbana" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={creedLogo} alt="Creed" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={yslLogo} alt="YSL" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={pradaLogo} alt="Prada" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={claireFontaineLogo} alt="Claire Fontaine" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            
            {/* Duplicate set for seamless loop */}
            <div className="flex-shrink-0">
              <img src={chanelLogo} alt="Chanel" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={versaceLogo} alt="Versace" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={diorLogo} alt="Dior" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={gucciLogo} alt="Gucci" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={armaneLogo} alt="Armane" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={dgLogo} alt="Dolce & Gabbana" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={creedLogo} alt="Creed" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={yslLogo} alt="YSL" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={pradaLogo} alt="Prada" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
            <div className="flex-shrink-0">
              <img src={claireFontaineLogo} alt="Claire Fontaine" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" width={200} height={80} loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>
      {/* New Arrivals Section */}
      <section className="py-20 bg-gradient-to-br from-cream to-white pt-[0px] pb-[0px]">
        <div className="container mx-auto px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy mb-4 tracking-tight">New Arrivals</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-deep-gold mx-auto mb-6"></div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">Fresh fragrances from the world's most prestigious houses</p>
          </motion.div>

          <ProductCarousel
            products={newArrivalsProducts.slice(0, 12)}
            title="New Arrivals"
            showBadges={true}
            badgeText={() => "New Arrival"}
            badgeColor="bg-gradient-to-r from-green-500 to-emerald-500"
            onAddToCart={(productId) => addToCartMutation.mutate(productId)}
            isAddingToCart={addToCartMutation.isPending}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
