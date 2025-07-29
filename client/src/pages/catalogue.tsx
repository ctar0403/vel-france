import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, X, Grid, List, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, CartItem } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { Link, useLocation } from "wouter";

interface CatalogueFilters {
  searchQuery: string;
  priceRange: [number, number];
  selectedBrands: string[];
  selectedCategories: string[];
  sortBy: string;
  viewMode: 'grid' | 'list';
}

// Premium Product Card Component
function LuxuryProductCard({ product }: { product: Product; index?: number }) {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
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
        title: "Added to cart", 
        description: `${product.name} has been added to your cart` 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
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

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        onHoverStart={() => setIsCardHovered(true)}
        onHoverEnd={() => setIsCardHovered(false)}
        className="group relative bg-white rounded-2xl border border-gold/10 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
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

        {/* Professional Add to Cart Button */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isCardHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            onHoverStart={() => setIsButtonHovered(true)}
            onHoverEnd={() => setIsButtonHovered(false)}
            className={`relative backdrop-blur-sm px-6 py-3 rounded-full font-semibold text-sm tracking-wide shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              isButtonHovered 
                ? 'bg-[#001f66] text-white border-[#001f66]' 
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
                  animate={addToCartMutation.isPending ? { rotate: 360 } : {}}
                  transition={{ 
                    duration: 0.8, 
                    repeat: addToCartMutation.isPending ? Infinity : 0, 
                    ease: "linear" 
                  }}
                >
                  <ShoppingCart className={`h-4 w-4 ${isButtonHovered ? 'text-white' : 'text-black'}`} />
                </motion.div>
                <span>Add to Cart</span>
              </motion.div>
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
      {/* Fixed Height Content Container */}
      <div className="p-6 flex-grow flex flex-col min-h-[120px]">
        <h3 className="text-lg text-navy leading-tight line-clamp-2 mb-3 font-normal">
          {formatProductName(product.name, product.brand)}
        </h3>

        <span className="text-base text-gold font-normal">
          ₾{parseFloat(product.price.toString()).toFixed(2)}
        </span>
      </div>
      </motion.div>
    </Link>
  );
}

export default function Catalogue() {
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Parse URL parameters for initial filters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  
  // Filter state
  const [filters, setFilters] = useState<CatalogueFilters>({
    searchQuery: urlParams.get('search') || "",
    priceRange: [0, 0], // No price filter by default
    selectedBrands: urlParams.get('brand') ? [urlParams.get('brand')!] : [],
    selectedCategories: urlParams.get('category') ? [urlParams.get('category')!] : [],
    sortBy: "name-asc",
    viewMode: 'grid'
  });

  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([15, 150]); // Will be updated when products load
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
    
    return range;
  }, [products]);

  // Initialize temp price range and filters when products load
  useEffect(() => {
    if (products.length > 0 && (tempPriceRange[0] === 15 && tempPriceRange[1] === 150)) {
      setTempPriceRange(priceRange as [number, number]);
      // Initialize filters price range to full range (no filter)
      // Only update price range, preserve other filters
      setFilters(prev => ({ ...prev, priceRange: priceRange as [number, number] }));
    }
  }, [products, priceRange, tempPriceRange]);

  // Update filters when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const urlCategory = urlParams.get('category');
    const urlBrand = urlParams.get('brand');
    const urlSearch = urlParams.get('search');

    setFilters(prev => ({
      ...prev,
      searchQuery: urlSearch || "",
      selectedBrands: urlBrand ? [urlBrand] : [],
      selectedCategories: urlCategory ? [urlCategory] : [],
    }));

    if (urlSearch) {
      setTempSearchQuery(urlSearch);
    }
  }, [location]);

  // Get unique brands and categories
  const availableBrands = useMemo(() => {
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
    return brands.sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    
    products.forEach(product => {
      // Add primary category
      if (product.category) {
        categorySet.add(product.category);
      }
      
      // Add all categories from categories array
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(cat => categorySet.add(cat));
      }
    });
    
    return Array.from(categorySet).filter(Boolean).sort();
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

    // Apply price filter only if it differs from the full price range
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

    // Apply category filter - check both category and categories array
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(product => {
        // Check if primary category matches
        const primaryCategoryMatch = filters.selectedCategories.includes(product.category);
        
        // Check if any category in categories array matches
        const categoriesArrayMatch = product.categories && Array.isArray(product.categories) 
          ? product.categories.some(cat => filters.selectedCategories.includes(cat))
          : false;
        
        return primaryCategoryMatch || categoriesArrayMatch;
      });
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
    setFilters({
      searchQuery: "",
      priceRange: priceRange as [number, number], // Reset to full price range
      selectedBrands: [],
      selectedCategories: [],
      sortBy: "name-asc",
      viewMode: filters.viewMode
    });
    setTempPriceRange(priceRange as [number, number]); // Reset temp to full range for slider
    setTempSearchQuery("");
    setIsFiltering(false);
  }, [priceRange, filters.viewMode]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    const hasPriceFilter = (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]);
    return (
      (filters.searchQuery.trim() ? 1 : 0) +
      (filters.selectedBrands.length > 0 ? 1 : 0) +
      (filters.selectedCategories.length > 0 ? 1 : 0) +
      (hasPriceFilter ? 1 : 0)
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
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="space-y-6">
              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-navy tracking-wide">Discover Perfumes</h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#002c8c88] to-transparent ml-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-[#002c8c88] shadow-sm">
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search luxury fragrances, brands, or scent notes..."
                        value={tempSearchQuery}
                        onChange={(e) => setTempSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                          }
                        }}
                        className="flex h-12 w-full rounded-xl border-2 border-[#002c8c88] bg-gradient-to-r from-white to-cream/20 px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002c8c88] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-24 focus:border-[#002c8c] focus:bg-white transition-all duration-200 shadow-sm font-medium"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {tempSearchQuery && (
                          <button
                            onClick={() => {
                              setTempSearchQuery("");
                              updateFilter('searchQuery', "");
                            }}
                            className="p-1 hover:bg-[#002c8c88] rounded-full transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </button>
                        )}
                        <Button
                          onClick={handleSearch}
                          size="sm"
                          className="bg-[#002c8c] hover:bg-[#001f66] text-white font-medium h-8 px-3"
                        >
                          Search
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-navy tracking-wide">Price Range</h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#002c8c88] to-transparent ml-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-[#002c8c88] shadow-sm">
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
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${tempPriceRange[0]}</span>
                      <span>${tempPriceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-navy tracking-wide">Brands</h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#002c8c88] to-transparent ml-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-[#002c8c88] shadow-sm">
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {availableBrands.map((brand) => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={filters.selectedBrands.includes(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <Label htmlFor={`brand-${brand}`} className="text-sm font-medium cursor-pointer">
                            {brand}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-navy tracking-wide">Categories</h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#002c8c88] to-transparent ml-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-[#002c8c88] shadow-sm">
                  <div className="space-y-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`category-${category}`} className="text-sm font-medium cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="w-full border-[#002c8c88] text-navy hover:bg-[#002c8c88]"
                >
                  Clear All Filters ({activeFiltersCount})
                </Button>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header Controls */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
            >
              <div className="flex flex-col gap-2">
                
                
                
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-48 bg-white border-[#002c8c88] hover:border-[#002c8c] transition-colors">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#002c8c88]">
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                  </SelectContent>
                </Select>

                
              </div>
            </motion.div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="flex flex-wrap gap-2">
                  {/* Search Query Filter */}
                  {filters.searchQuery.trim() && (
                    <Badge variant="secondary" className="gap-1 bg-[#002c8c88] text-navy border-[#002c8c88]">
                      Search: "{filters.searchQuery}"
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => {
                          updateFilter('searchQuery', "");
                          setTempSearchQuery("");
                        }}
                      />
                    </Badge>
                  )}

                  {/* Brand Filters */}
                  {filters.selectedBrands.map(brand => (
                    <Badge key={brand} variant="secondary" className="gap-1 bg-[#002c8c88] text-navy border-[#002c8c88]">
                      {brand}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => toggleBrand(brand)}
                      />
                    </Badge>
                  ))}

                  {/* Category Filters */}
                  {filters.selectedCategories.map(category => (
                    <Badge key={category} variant="secondary" className="gap-1 bg-[#002c8c88] text-navy border-[#002c8c88]">
                      {category}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => toggleCategory(category)}
                      />
                    </Badge>
                  ))}

                  {/* Price Range Filter */}
                  {(filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && (
                    <Badge variant="secondary" className="gap-1 bg-[#002c8c88] text-navy border-[#002c8c88]">
                      ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => {
                          updateFilter('priceRange', priceRange);
                          setTempPriceRange(priceRange as [number, number]);
                        }}
                      />
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}

            {/* Products Grid */}
            <div>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Filter className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your filters to see more results</p>
                  {activeFiltersCount > 0 && (
                    <Button onClick={clearAllFilters} variant="outline">
                      Clear all filters
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className={filters.viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
                    : "space-y-4"
                  }
                >
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="opacity-0 animate-fade-in"
                      style={{
                        animationDelay: `${index * 20}ms`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <LuxuryProductCard 
                        product={product} 
                        index={index} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </motion.div>
  );
}