import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, X, Grid, List, ShoppingCart, Heart, Star, Search, Sparkles, ArrowRight, Eye, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";

interface CatalogueFilters {
  searchQuery: string;
  priceRange: [number, number];
  selectedBrands: string[];
  selectedCategories: string[];
  sortBy: string;
  viewMode: 'grid' | 'list';
}

// Advanced Luxury Product Card Component
function LuxuryProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ 
        title: "✨ Added to cart", 
        description: `${product.name} has been added to your luxury collection`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Unable to add to cart", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  const formatProductName = (name: string, brand?: string | null) => {
    if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
      return `${brand} – ${name}`;
    }
    return name;
  };

  // Generate mock rating for visual appeal
  const rating = 4.2 + (Math.random() * 0.8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      onHoverStart={() => setIsCardHovered(true)}
      onHoverEnd={() => setIsCardHovered(false)}
      className="group relative bg-white rounded-3xl border-2 border-gray-100/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer h-full flex flex-col backdrop-blur-sm"
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
    >
      {/* Luxury Badge */}
      <motion.div 
        className="absolute top-4 left-4 z-10 bg-gradient-to-r from-gold/90 to-yellow-500/90 backdrop-blur-sm rounded-full px-3 py-1"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-white" />
          <span className="text-xs font-semibold text-white tracking-wide">LUXURY</span>
        </div>
      </motion.div>

      {/* Wishlist Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setIsLiked(!isLiked);
          toast({
            title: isLiked ? "Removed from wishlist" : "Added to wishlist",
            description: isLiked ? "Item removed from your favorites" : "Item saved to your favorites",
            className: "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200"
          });
        }}
        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Heart 
          className={`h-4 w-4 transition-colors duration-300 ${
            isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'
          }`} 
        />
      </motion.button>

      {/* Enhanced Image Container */}
      <div className="aspect-square relative overflow-hidden flex-shrink-0">
        <motion.img
          src={product.imageUrl || "/placeholder-perfume.jpg"}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ 
            scale: isCardHovered ? 1.15 : 1,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        
        {/* Dynamic overlay with glassmorphism */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/20 to-transparent backdrop-blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: isCardHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Advanced Action Buttons */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isCardHovered ? 1 : 0,
            y: isCardHovered ? 0 : 20
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* Quick View Button */}
          <motion.button
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-navy p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: "Quick View",
                description: "Product details coming soon",
                className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              });
            }}
          >
            <Eye className="h-5 w-5" />
          </motion.button>

          {/* Enhanced Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="bg-gradient-to-r from-navy to-blue-700 hover:from-blue-700 hover:to-navy text-white px-6 py-3 rounded-full font-semibold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-navy/20 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div className="flex items-center gap-2">
              <motion.div
                animate={addToCartMutation.isPending ? { rotate: 360 } : {}}
                transition={{ 
                  duration: 1, 
                  repeat: addToCartMutation.isPending ? Infinity : 0, 
                  ease: "linear" 
                }}
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.div>
              <span>{addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}</span>
              <ArrowRight className="h-4 w-4 opacity-75" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Rating overlay */}
        <motion.div
          className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: isCardHovered ? 1 : 0,
            x: isCardHovered ? 0 : -20
          }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
        </motion.div>
      </div>

      {/* Enhanced Content Container */}
      <div className="p-6 flex-grow flex flex-col justify-between min-h-[140px] bg-gradient-to-b from-white to-gray-50/30">
        <div>
          <motion.h3 
            className="text-lg text-navy leading-tight line-clamp-2 mb-2 font-medium group-hover:text-blue-700 transition-colors duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            {formatProductName(product.name, product.brand)}
          </motion.h3>

          {/* Product category badge */}
          <motion.div
            className="mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            <span className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium tracking-wide">
              {product.category || 'Perfume'}
            </span>
          </motion.div>
        </div>

        <div className="flex items-center justify-between">
          <motion.span 
            className="text-xl font-bold bg-gradient-to-r from-gold to-yellow-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.6 }}
          >
            ${parseFloat(product.price.toString()).toFixed(2)}
          </motion.span>

          {/* Quick add button for mobile */}
          <motion.button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="lg:hidden bg-gradient-to-r from-navy to-blue-700 text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0"
        animate={{
          x: isCardHovered ? ['0%', '100%'] : '0%',
          opacity: isCardHovered ? [0, 0.6, 0] : 0
        }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </motion.div>
  );
}

export default function Catalogue() {
  const { toast } = useToast();
  
  // Filter state
  const [filters, setFilters] = useState<CatalogueFilters>({
    searchQuery: "",
    priceRange: [0, 0], // Start with no price filter
    selectedBrands: [],
    selectedCategories: [],
    sortBy: "name-asc",
    viewMode: 'grid'
  });

  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 0]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load products
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch cart items for cart count
  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    retry: false,
  });

  // Calculate price range
  const priceRange = useMemo(() => {
    if (products.length === 0) return [0, 1000];
    const prices = products.map(p => parseFloat(p.price.toString()));
    const range: [number, number] = [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
    
    // Initialize filters with actual price range on first load
    if (filters.priceRange[0] === 0 && filters.priceRange[1] === 0 && range[0] !== 0) {
      setFilters(prev => ({ ...prev, priceRange: range }));
      setTempPriceRange(range);
    }
    
    return range;
  }, [products, filters.priceRange]);

  // Get unique brands and categories
  const availableBrands = useMemo(() => {
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
    return brands.sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
    return categories.sort();
  }, [products]);

  // Update filter function
  const updateFilter = useCallback((key: keyof CatalogueFilters, value: any) => {
    setIsFiltering(true);
    setFilters(prev => ({ ...prev, [key]: value }));
    setTimeout(() => setIsFiltering(false), 300);
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    updateFilter('searchQuery', tempSearchQuery.trim());
    setTempSearchQuery("");
  }, [tempSearchQuery, updateFilter]);

  // Toggle functions
  const toggleBrand = useCallback((brand: string) => {
    const newBrands = filters.selectedBrands.includes(brand)
      ? filters.selectedBrands.filter(b => b !== brand)
      : [...filters.selectedBrands, brand];
    updateFilter('selectedBrands', newBrands);
  }, [filters.selectedBrands, updateFilter]);

  const toggleCategory = useCallback((category: string) => {
    const newCategories = filters.selectedCategories.includes(category)
      ? filters.selectedCategories.filter(c => c !== category)
      : [...filters.selectedCategories, category];
    updateFilter('selectedCategories', newCategories);
  }, [filters.selectedCategories, updateFilter]);

  // Process and filter products
  const processedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      searchableText: [
        product.name,
        product.brand,
        product.description,
        product.notes,
        product.category
      ].filter(Boolean).join(' ').toLowerCase(),
      numericPrice: parseFloat(product.price.toString())
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!processedProducts.length) return [];
    
    let filtered = [...processedProducts];

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.searchableText.includes(searchTerm)
      );
    }

    // Apply price filter
    if (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) {
      filtered = filtered.filter(product => 
        product.numericPrice >= filters.priceRange[0] && 
        product.numericPrice <= filters.priceRange[1]
      );
    }

    // Apply brand filter
    if (filters.selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        product.brand && filters.selectedBrands.includes(product.brand)
      );
    }

    // Apply category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        filters.selectedCategories.includes(product.category)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.numericPrice - b.numericPrice);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.numericPrice - a.numericPrice);
        break;
      case "brand":
        filtered.sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
        break;
    }

    return filtered;
  }, [processedProducts, filters, priceRange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const resetRange = priceRange as [number, number];
    setFilters({
      searchQuery: "",
      priceRange: resetRange,
      selectedBrands: [],
      selectedCategories: [],
      sortBy: "name-asc",
      viewMode: filters.viewMode
    });
    setTempPriceRange(resetRange);
    setTempSearchQuery("");
    setIsFiltering(false);
  }, [priceRange, filters.viewMode]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return (
      (filters.searchQuery.trim() ? 1 : 0) +
      (filters.selectedBrands.length > 0 ? 1 : 0) +
      (filters.selectedCategories.length > 0 ? 1 : 0) +
      (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1] ? 1 : 0)
    );
  }, [filters, priceRange]);

  // Calculate cart count for header
  const cartItemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: "Product successfully added to your cart!",
      });
    },
    onError: (error) => {
      console.error("Add to cart error:", error);
      toast({
        title: "Error",
        description: "Unable to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink"
      >
        <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-gold/30 border-t-gold rounded-full"
          />
        </div>
        <Footer />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink"
    >
      <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        isLoading={false}
      />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-navy via-blue-900 to-navy py-20 mb-12 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Luxury <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent font-normal">Fragrance</span> Collection
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Discover the world's most exquisite perfumes from renowned luxury houses
            </motion.p>
            
            {/* Advanced Search Bar */}
            <motion.div 
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
                <div className="flex items-center">
                  <div className="flex-1 flex items-center">
                    <Search className="h-6 w-6 text-white/60 ml-4 mr-3" />
                    <input
                      type="text"
                      placeholder="Search luxury fragrances, brands, notes, or collections..."
                      value={tempSearchQuery}
                      onChange={(e) => setTempSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      className="flex-1 bg-transparent text-white placeholder:text-white/60 text-lg py-4 px-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {tempSearchQuery && (
                      <button
                        onClick={() => {
                          setTempSearchQuery("");
                          updateFilter('searchQuery', "");
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <X className="h-5 w-5 text-white/60" />
                      </button>
                    )}
                    <Button
                      onClick={handleSearch}
                      className="bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-500 hover:to-gold text-navy font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gold/10 rounded-full blur-xl"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="container mx-auto px-4 pb-8"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Advanced Sidebar Filters */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="sticky top-4 space-y-6">
              {/* Filter Header */}
              <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-navy to-blue-700 p-2 rounded-xl">
                      <SlidersHorizontal className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-navy">Refine Your Search</h3>
                  </div>
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-gold to-yellow-500 text-navy px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {activeFiltersCount}
                    </motion.div>
                  )}
                </div>

                {/* Mobile Search */}
                <div className="lg:hidden mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search fragrances..."
                      value={tempSearchQuery}
                      onChange={(e) => setTempSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-navy focus:outline-none transition-colors bg-white/50"
                    />
                    {tempSearchQuery && (
                      <button
                        onClick={() => {
                          setTempSearchQuery("");
                          updateFilter('searchQuery', "");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="w-full mt-3 bg-gradient-to-r from-navy to-blue-700 text-white"
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Enhanced Price Filter */}
              <motion.div 
                className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                    <span className="text-white font-bold text-sm">$</span>
                  </div>
                  <h4 className="text-lg font-bold text-navy">Price Range</h4>
                </div>
                <div className="space-y-4">
                  <Slider
                    value={tempPriceRange}
                    onValueChange={(value) => setTempPriceRange(value as [number, number])}
                    onValueCommit={(value) => updateFilter('priceRange', value)}
                    max={priceRange[1]}
                    min={priceRange[0]}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-xl border border-green-200">
                      <span className="text-sm font-semibold text-green-700">${tempPriceRange[0]}</span>
                    </div>
                    <div className="text-gray-400">—</div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-xl border border-green-200">
                      <span className="text-sm font-semibold text-green-700">${tempPriceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Brand Filter */}
              <motion.div 
                className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-2 rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-navy">Luxury Brands</h4>
                </div>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {availableBrands.map((brand) => (
                      <motion.div 
                        key={brand} 
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleBrand(brand)}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={filters.selectedBrands.includes(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <Label htmlFor={`brand-${brand}`} className="font-medium cursor-pointer text-gray-700">
                            {brand}
                          </Label>
                        </div>
                        {filters.selectedBrands.includes(brand) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-r from-purple-500 to-violet-600 text-white px-2 py-1 rounded-full text-xs font-semibold"
                          >
                            ✓
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>

              {/* Enhanced Category Filter */}
              <motion.div 
                className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-2 rounded-xl">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-navy">Categories</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {availableCategories.map((category) => (
                    <motion.div 
                      key={category} 
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`category-${category}`} className="font-medium cursor-pointer text-gray-700">
                          {category}
                        </Label>
                      </div>
                      {filters.selectedCategories.includes(category) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded-full text-xs font-semibold"
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Clear Filters */}
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  <Button
                    onClick={clearAllFilters}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters ({activeFiltersCount})
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Main Content */}
          <div className="flex-1">
            {/* Advanced Header Controls */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg mb-8"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex flex-col gap-3">
                  <motion.h2 
                    className="text-2xl font-bold text-navy"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    {filteredProducts.length} Luxury {filteredProducts.length === 1 ? 'Fragrance' : 'Fragrances'}
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 font-medium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                  >
                    Curated collection of premium perfumes from prestigious houses
                  </motion.p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Enhanced Sort Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6 }}
                  >
                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger className="w-56 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-navy transition-all duration-300 shadow-sm rounded-xl h-12">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-navy to-blue-700 p-1.5 rounded-lg">
                            <SlidersHorizontal className="h-4 w-4 text-white" />
                          </div>
                          <SelectValue placeholder="Sort by..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-xl">
                        <SelectItem value="name-asc">
                          <div className="flex items-center gap-2">
                            <span>📝</span>
                            <span>Name (A-Z)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="name-desc">
                          <div className="flex items-center gap-2">
                            <span>📝</span>
                            <span>Name (Z-A)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="price-asc">
                          <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span>Price (Low to High)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="price-desc">
                          <div className="flex items-center gap-2">
                            <span>💎</span>
                            <span>Price (High to Low)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="brand">
                          <div className="flex items-center gap-2">
                            <span>🏷️</span>
                            <span>Brand</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* View Mode Toggle */}
                  <motion.div 
                    className="flex items-center bg-gray-100 rounded-xl p-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.7 }}
                  >
                    <Button
                      variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => updateFilter('viewMode', 'grid')}
                      className={`rounded-lg ${filters.viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-navy to-blue-700 text-white shadow-md' 
                        : 'text-gray-600 hover:text-navy'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => updateFilter('viewMode', 'list')}
                      className={`rounded-lg ${filters.viewMode === 'list' 
                        ? 'bg-gradient-to-r from-navy to-blue-700 text-white shadow-md' 
                        : 'text-gray-600 hover:text-navy'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Active Filters Display */}
            {activeFiltersCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: 1.8 }}
                className="bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-2xl p-6 border-2 border-blue-100 mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">Active Filters</h3>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {activeFiltersCount}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* Enhanced Search Query Filter */}
                  {filters.searchQuery.trim() && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2"
                    >
                      <Search className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">"{filters.searchQuery}"</span>
                      <button
                        onClick={() => {
                          updateFilter('searchQuery', "");
                          setTempSearchQuery("");
                        }}
                        className="bg-emerald-200 hover:bg-emerald-300 text-emerald-700 rounded-full p-1 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )}

                  {/* Enhanced Brand Filters */}
                  {filters.selectedBrands.map((brand, index) => (
                    <motion.div
                      key={brand}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-purple-100 to-violet-100 border-2 border-purple-200 rounded-xl px-4 py-2 flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="text-purple-700 font-medium">{brand}</span>
                      <button
                        onClick={() => toggleBrand(brand)}
                        className="bg-purple-200 hover:bg-purple-300 text-purple-700 rounded-full p-1 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}

                  {/* Enhanced Category Filters */}
                  {filters.selectedCategories.map((category, index) => (
                    <motion.div
                      key={category}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (filters.selectedBrands.length + index) * 0.1 }}
                      className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-200 rounded-xl px-4 py-2 flex items-center gap-2"
                    >
                      <span className="text-blue-600 font-bold text-sm">🏷️</span>
                      <span className="text-blue-700 font-medium">{category}</span>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="bg-blue-200 hover:bg-blue-300 text-blue-700 rounded-full p-1 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}

                  {/* Enhanced Price Range Filter */}
                  {(filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 rounded-xl px-4 py-2 flex items-center gap-2"
                    >
                      <span className="text-green-600 font-bold text-sm">💰</span>
                      <span className="text-green-700 font-medium">${filters.priceRange[0]} - ${filters.priceRange[1]}</span>
                      <button
                        onClick={() => {
                          updateFilter('priceRange', priceRange);
                          setTempPriceRange(priceRange as [number, number]);
                        }}
                        className="bg-green-200 hover:bg-green-300 text-green-700 rounded-full p-1 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Enhanced Products Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
            >
              {filteredProducts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.2 }}
                  className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-gray-100"
                >
                  <motion.div 
                    className="mb-6"
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                      <Filter className="h-12 w-12 text-gray-400" />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-3">No fragrances match your criteria</h3>
                  <p className="text-gray-500 mb-8 text-lg">Discover new scents by adjusting your search parameters</p>
                  {activeFiltersCount > 0 && (
                    <Button 
                      onClick={clearAllFilters} 
                      className="bg-gradient-to-r from-navy to-blue-700 hover:from-blue-700 hover:to-navy text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear all filters
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div
                  className={filters.viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
                    : "grid grid-cols-1 lg:grid-cols-2 gap-6"
                  }
                >
                  {filteredProducts.map((product, index) => (
                    <LuxuryProductCard 
                      key={product.id}
                      product={product} 
                      index={index} 
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </motion.div>
  );
}