import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import FloatingParticles from "@/components/FloatingParticles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartSidebar from "@/components/CartSidebar";
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


export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
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

  return (
    <div className="min-h-screen bg-cream">
      <FloatingParticles />
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
      <section className="relative w-full overflow-hidden" style={{ aspectRatio: '1024/400' }}>
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
        <div className="absolute inset-0 bg-navy/40" />
        <div className="absolute inset-0 lace-border" />
        
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-navy mb-4 tracking-tight">Most Sold</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-deep-gold mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover the fragrances that captivate the world</p>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="flex space-x-8 pb-6 overflow-x-auto">
              {products.slice(0, 12).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="flex-shrink-0 w-80 group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 hover:scale-105">
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      <img 
                        src={product.imageUrl || ''} 
                        alt={product.name}
                        className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold px-3 py-1 text-sm shadow-lg">
                          #{index + 1} Bestseller
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full w-12 h-12 p-0 bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
                          onClick={() => addToCartMutation.mutate(product.id)}
                          disabled={addToCartMutation.isPending}
                        >
                          <ShoppingBag className="h-5 w-5 text-navy" />
                        </Button>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="font-bold text-xl text-navy mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">{product.name}</h3>
                      <p className="text-gold font-semibold mb-4 text-lg">{product.brand}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-navy">${product.price}</span>
                        <Link href={`/product/${product.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-2 border-gold text-gold hover:bg-gold hover:text-navy transition-all duration-300 font-semibold px-4 py-2"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos Auto-Moving Carousel */}
      <section className="py-16 bg-navy overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Luxury Brands We Carry</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-deep-gold mx-auto"></div>
          </motion.div>
        </div>
        
        <div className="relative">
          <div className="flex animate-marquee space-x-16 items-center">
            {/* First set of brand logos */}
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">CHANEL</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">DIOR</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-xl font-bold text-black tracking-wider">ARMANI</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">CREED</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">GUCCI</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-xl font-bold text-black tracking-wider">VERSACE</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">YSL</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">PRADA</div>
            </div>
            
            {/* Duplicate set for seamless loop */}
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">CHANEL</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">DIOR</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-xl font-bold text-black tracking-wider">ARMANI</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">CREED</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">GUCCI</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-xl font-bold text-black tracking-wider">VERSACE</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">YSL</div>
            </div>
            <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl font-bold text-black tracking-wider">PRADA</div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-gradient-to-br from-cream to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-navy mb-4 tracking-tight">New Arrivals</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-deep-gold mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Fresh fragrances from the world's most prestigious houses</p>
          </motion.div>

          <div className="relative overflow-hidden">
            <div className="flex space-x-8 pb-6 overflow-x-auto">
              {products.slice(12, 24).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="flex-shrink-0 w-80 group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 hover:scale-105">
                    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
                      <img 
                        src={product.imageUrl || ''} 
                        alt={product.name}
                        className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold px-3 py-1 text-sm shadow-lg">
                          New Arrival
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-full w-12 h-12 p-0 bg-white/95 hover:bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
                          onClick={() => addToCartMutation.mutate(product.id)}
                          disabled={addToCartMutation.isPending}
                        >
                          <ShoppingBag className="h-5 w-5 text-navy" />
                        </Button>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="font-bold text-xl text-navy mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-300">{product.name}</h3>
                      <p className="text-gold font-semibold mb-4 text-lg">{product.brand}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-navy">${product.price}</span>
                        <Link href={`/product/${product.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-2 border-gold text-gold hover:bg-gold hover:text-navy transition-all duration-300 font-semibold px-4 py-2"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
