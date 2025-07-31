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



// Critical components loaded immediately
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Non-critical components lazy loaded
const ProductCarousel = lazy(() => import("../components/ProductCarousel"));
const ProductCard = lazy(() => import("@/components/ProductCard"));
const CartSidebar = lazy(() => import("@/components/CartSidebar"));
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem, Order, User } from "@shared/schema";
import { ShoppingBag, User as UserIcon, Package, ChevronLeft, ChevronRight } from "lucide-react";

import banner1 from "@assets/1_1753538704078.png";
import banner2 from "@assets/2_1753538710752.png";
import banner3 from "@assets/3_1753538715604.png";
import banner4 from "@assets/4_1753538720559.png";
import banner5 from "@assets/5_1753538726165.png";
import banner7 from "@assets/7_1753734195721.png";
import banner8 from "@assets/8_1753734262383.png";
import banner9 from "@assets/9_1753734226839.png";
import banner10 from "@assets/10_1753734237960.png";
import banner11 from "@assets/11_1753734243609.png";
import bannerDuplicate from "@assets/786357ce-da6e-4e20-8116-d7c79ef6e062_1753734276964.png";

// Import new brand logos
import chanelLogo from "@assets/1_1753788502251.png";
import versaceLogo from "@assets/2_1753788502252.png";
import diorLogo from "@assets/3_1753788502252.png";
import gucciLogo from "@assets/4_1753788502253.png";
import armaneLogo from "@assets/5_1753788502254.png";
import dgLogo from "@assets/6_1753788502254.png";
import creedLogo from "@assets/7_1753788502255.png";
import yslLogo from "@assets/8_1753788502255.png";
import pradaLogo from "@assets/9_1753788502255.png";
import claireFontaineLogo from "@assets/10_1753788502256.png";

// Optimized hook to detect mobile screen size with debouncing
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkIsMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth <= 768);
      }, 100); // Debounce resize events
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkIsMobile);
    };
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "Personal consultation",
    message: ""
  });
  const isMobile = useIsMobile();

  // Banner images for slideshow in requested order
  const banners = [
    { image: banner11, alt: "Vel France luxury perfume collection with up to 60% discount" },
    { image: banner9, alt: "Chanel No. 5 perfume with blonde model in red Chanel outfit" },
    { image: banner5, alt: "Jean Paul Gaultier Divine perfume with golden luxury styling" },
    { image: banner8, alt: "Dior Sauvage Elixir - The New Elixir with dramatic sunset backdrop" },
    { image: banner7, alt: "Coco Mademoiselle by Chanel with elegant model" },
    { image: banner10, alt: "Miss Dior Parfum with sophisticated brunette model" }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Handle banner click to redirect to catalogue
  const handleBannerClick = () => {
    setLocation('/catalogue');
  };

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
      {/* Welcome Section */}
      <section className="relative w-full overflow-hidden h-[40vh] sm:h-[50vh] lg:h-[60vh] xl:h-[70vh]">
        {/* Slideshow Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div 
            className="flex h-full transition-transform duration-1000 ease-in-out"
            style={{ 
              transform: `translateX(-${currentSlide * (100 / banners.length)}%)`,
              width: `${banners.length * 100}%`
            }}
          >
            {banners.map((banner, index) => (
              <div 
                key={index}
                className="h-full flex-shrink-0"
                style={{ width: `${100 / banners.length}%` }}
              >
                <img 
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div 
          className="absolute inset-0 bg-navy/40 cursor-pointer" 
          onClick={handleBannerClick}
        />
        
        {/* Navigation Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 opacity-60 hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 opacity-60 hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        

      </section>
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
              <img src={chanelLogo} alt="Chanel" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={versaceLogo} alt="Versace" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={diorLogo} alt="Dior" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={gucciLogo} alt="Gucci" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={armaneLogo} alt="Armane" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={dgLogo} alt="Dolce & Gabbana" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={creedLogo} alt="Creed" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={yslLogo} alt="YSL" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={pradaLogo} alt="Prada" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={claireFontaineLogo} alt="Claire Fontaine" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            
            {/* Duplicate set for seamless loop */}
            <div className="flex-shrink-0">
              <img src={chanelLogo} alt="Chanel" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={versaceLogo} alt="Versace" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={diorLogo} alt="Dior" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={gucciLogo} alt="Gucci" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={armaneLogo} alt="Armane" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={dgLogo} alt="Dolce & Gabbana" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={creedLogo} alt="Creed" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={yslLogo} alt="YSL" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={pradaLogo} alt="Prada" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-shrink-0">
              <img src={claireFontaineLogo} alt="Claire Fontaine" className="h-12 sm:h-16 lg:h-20 w-auto object-contain hover:scale-105 transition-transform duration-300" />
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
