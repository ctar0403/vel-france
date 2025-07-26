import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

  // Banner images for slideshow
  const banners = [
    { image: banner1, alt: "Luxury perfume collection with 60% discount in Paris setting" },
    { image: banner2, alt: "Chanel No. 5 perfume with citrus and botanical elements" },
    { image: banner3, alt: "Creed Aventus luxury fragrance bottle in elegant black and white" },
    { image: banner4, alt: "Bleu de Chanel perfume bottle on oceanic waves background" },
    { image: banner5, alt: "Jean Paul Gaultier Divine perfume with golden luxury styling" }
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
        user={user as any}
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
              transform: `translateX(-${currentSlide * 20}%)`,
              width: '500%'
            }}
          >
            {banners.map((banner, index) => (
              <div 
                key={index}
                className="h-full flex-shrink-0 w-1/5"
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
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="relative z-10 text-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl mb-3 text-white font-light tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              Vel France
            </h1>
            <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto text-white/90 font-light leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Discover the art of luxury perfumery where every fragrance tells a story
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="bg-white text-black hover:bg-gray-100 px-7 py-3 text-sm font-medium tracking-wide transition-all duration-200 border-0"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                EXPLORE COLLECTION
              </Button>
              <Button
                variant="outline"
                className="bg-transparent hover:bg-white/10 text-white border border-white/60 hover:border-white px-7 py-3 text-sm font-medium tracking-wide transition-all duration-200"
                onClick={() => document.getElementById('account')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                MY ACCOUNT
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Account Dashboard */}
      <section id="account" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-5xl text-navy mb-4">My Account</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-playfair text-lg">
              Manage your orders and discover your purchase history
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <motion.div
              className="bg-cream rounded-2xl shadow-xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ShoppingBag className="h-12 w-12 text-gold mx-auto mb-4" />
              <h3 className="font-playfair text-2xl text-navy mb-2">Current Cart</h3>
              <p className="text-3xl font-bold text-gold">{cartItemCount}</p>
              <p className="text-gray-600">items</p>
            </motion.div>
            
            <motion.div
              className="bg-cream rounded-2xl shadow-xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Package className="h-12 w-12 text-gold mx-auto mb-4" />
              <h3 className="font-playfair text-2xl text-navy mb-2">Orders</h3>
              <p className="text-3xl font-bold text-gold">{orders.length}</p>
              <p className="text-gray-600">total</p>
            </motion.div>
            
            <motion.div
              className="bg-cream rounded-2xl shadow-xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <UserIcon className="h-12 w-12 text-gold mx-auto mb-4" />
              <h3 className="font-playfair text-2xl text-navy mb-2">Member Since</h3>
              <p className="text-lg font-bold text-gold">
                {(user as User)?.createdAt ? new Date((user as User).createdAt!).getFullYear() : '2024'}
              </p>
              <p className="text-gray-600">Premium Client</p>
            </motion.div>
          </div>

          {/* Recent Orders */}
          {orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-playfair text-3xl text-navy mb-8 text-center">My Recent Orders</h3>
              <div className="grid gap-6">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gold/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-playfair text-lg text-navy">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-gray-600">
                          {new Date(order.createdAt!).toLocaleDateString('en-US')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-playfair text-2xl font-bold text-gold">€{order.total}</p>
                        <Badge 
                          variant={order.status === 'delivered' ? 'default' : 'secondary'}
                          className={order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {order.status === 'pending' && 'Pending'}
                          {order.status === 'confirmed' && 'Confirmed'}
                          {order.status === 'shipped' && 'Shipped'}
                          {order.status === 'delivered' && 'Delivered'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-gray-600">
                      {order.orderItems?.length || 0} item(s)
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-5xl text-navy mb-4">Our Creations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-playfair text-lg">
              An exclusive selection of artisanal perfumes crafted with the most precious ingredients
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <ProductCard 
                  product={product} 
                  onAddToCart={(id) => addToCartMutation.mutate(id)}
                  isAddingToCart={addToCartMutation.isPending}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Product Catalog */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-5xl text-navy mb-4">Complete Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-playfair text-lg">
              Explore our complete range of exceptional perfumes
            </p>
          </motion.div>
          
          {/* Product Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { key: 'all', label: 'All' },
              { key: 'women', label: 'Women' },
              { key: 'men', label: 'Men' },
              { key: 'unisex', label: 'Unisex' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                className={`px-6 py-2 rounded-full font-playfair transition-all duration-300 ${
                  selectedCategory === key 
                    ? 'bg-gold text-navy hover:bg-deep-gold' 
                    : 'bg-white border-gold text-navy hover:bg-gold hover:text-navy'
                }`}
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {productsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-cream rounded-2xl shadow-xl overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gray-300" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2" />
                    <div className="h-3 bg-gray-300 rounded mb-4 w-2/3" />
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-300 rounded w-16" />
                      <div className="h-8 bg-gray-300 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-600 font-playfair text-lg">
                  No products found in this category
                </p>
              </div>
            ) : (
              filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (index % 8) * 0.1 }}
                >
                  <ProductCard 
                    product={product} 
                    onAddToCart={(id) => addToCartMutation.mutate(id)}
                    isAddingToCart={addToCartMutation.isPending}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-vibes text-5xl text-navy mb-6">Our Story</h2>
              <h3 className="font-playfair text-2xl text-navy mb-6">The Art of French Perfumery</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Since 1932, Vel France has perpetuated the tradition of exceptional French perfumery. 
                Our master perfumers create unique compositions using the finest ingredients, 
                sourced from around the world.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Each perfume tells a story, evokes an emotion, captures a moment of eternity. 
                Our artisanal craftsmanship is passed down from generation to generation, preserving 
                the authenticity and excellence of French perfumery.
              </p>
              <div className="flex items-center space-x-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-gold">90+</div>
                  <div className="text-sm text-gray-600">Years of Excellence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-gold">50+</div>
                  <div className="text-sm text-gray-600">Unique Creations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-gold">100%</div>
                  <div className="text-sm text-gray-600">Artisanal</div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Master perfumer crafting fragrance in French atelier" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-gold text-navy p-6 rounded-2xl shadow-xl">
                <div className="font-vibes text-2xl">Handcrafted</div>
                <div className="font-playfair text-sm">Paris, France</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-5xl text-navy mb-4">Contact Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-playfair text-lg">
              We would be delighted to accompany you in your quest for the perfect perfume
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-navy font-playfair mb-2">First Name</label>
                    <Input 
                      value={contactForm.firstName}
                      onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                      className="bg-cream border-gold/30 focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-navy font-playfair mb-2">Last Name</label>
                    <Input 
                      value={contactForm.lastName}
                      onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                      className="bg-cream border-gold/30 focus:border-gold"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-navy font-playfair mb-2">Email</label>
                  <Input 
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="bg-cream border-gold/30 focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-navy font-playfair mb-2">Subject</label>
                  <Select 
                    value={contactForm.subject} 
                    onValueChange={(value) => setContactForm({...contactForm, subject: value})}
                  >
                    <SelectTrigger className="bg-cream border-gold/30 focus:border-gold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal consultation">Personal consultation</SelectItem>
                      <SelectItem value="Product information">Product information</SelectItem>
                      <SelectItem value="Customer service">Customer service</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-navy font-playfair mb-2">Message</label>
                  <Textarea 
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="bg-cream border-gold/30 focus:border-gold resize-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-navy hover:bg-navy/90 text-white py-3 font-playfair font-semibold"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-cream rounded-2xl shadow-xl p-8 mb-8">
                <h3 className="font-playfair text-2xl text-navy mb-6">Our Contact Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <i className="fas fa-map-marker-alt text-gold w-5"></i>
                    <div>
                      <div className="font-playfair text-navy">Address</div>
                      <div className="text-gray-600">25 Place Vendôme, 75001 Paris</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <i className="fas fa-phone text-gold w-5"></i>
                    <div>
                      <div className="font-playfair text-navy">Phone</div>
                      <div className="text-gray-600">+33 1 42 60 30 70</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <i className="fas fa-envelope text-gold w-5"></i>
                    <div>
                      <div className="font-playfair text-navy">Email</div>
                      <div className="text-gray-600">contact@velfrance.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <i className="fas fa-clock text-gold w-5"></i>
                    <div>
                      <div className="font-playfair text-navy">Hours</div>
                      <div className="text-gray-600">Mon-Sat: 10am-7pm</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2145!2d2.3292!3d48.8674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sPlace%20Vend%C3%B4me%2C%2075001%20Paris%2C%20France!5e0!3m2!1sen!2sus!4v1234567890" 
                  width="100%" 
                  height="300" 
                  style={{border:0}} 
                  allowFullScreen 
                  loading="lazy"
                  title="Vel France Location"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-navy text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-4xl mb-4">Join Our Newsletter</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Discover our new creations exclusively and benefit from privileged offers
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row max-w-md mx-auto gap-4">
              <Input 
                type="email" 
                placeholder="Your email address" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 text-navy bg-white border-none"
                required
              />
              <Button 
                type="submit" 
                className="bg-gold hover:bg-deep-gold text-navy px-8 py-3 font-playfair font-semibold"
                disabled={newsletterMutation.isPending}
              >
                {newsletterMutation.isPending ? "..." : "Subscribe"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
