import React, { useState, useMemo, useCallback } from "react";
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
import type { Product } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CatalogueFilters {
  searchQuery: string;
  priceRange: [number, number];
  selectedBrands: string[];
  selectedCategories: string[];
  sortBy: string;
  viewMode: 'grid' | 'list';
}

// Premium Product Card Component
function LuxuryProductCard({ product, index }: { product: Product; index: number }) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={() => setIsCardHovered(true)}
      onHoverEnd={() => setIsCardHovered(false)}
      className="group relative bg-white rounded-2xl border border-gold/10 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer h-full flex flex-col"
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
            className="relative bg-white/95 backdrop-blur-sm text-navy px-6 py-3 rounded-full font-semibold text-sm tracking-wide shadow-lg border border-gold/30 hover:bg-gold hover:text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <ShoppingCart className="h-4 w-4" />
                </motion.div>
                <span>Add to Cart</span>
              </motion.div>
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* Fixed Height Content Container */}
      <div className="p-6 flex-grow flex flex-col min-h-[120px]">
        <motion.h3 
          className="text-lg font-bold text-navy leading-tight line-clamp-2 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.2 }}
        >
          {formatProductName(product.name, product.brand)}
        </motion.h3>

        <motion.span 
          className="text-base font-bold text-gold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.3 }}
        >
          ${parseFloat(product.price.toString()).toFixed(2)}
        </motion.span>
      </div>
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

  // Load products
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: 2,
    staleTime: 5 * 60 * 1000,
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

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink"
      >
        <Header />
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
      <Header />
      
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
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent ml-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-blue-500/10 shadow-sm">
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
                        className="flex h-12 w-full rounded-xl border-2 border-blue-500/20 bg-gradient-to-r from-white to-cream/20 px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-24 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm font-medium"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {tempSearchQuery && (
                          <button
                            onClick={() => {
                              setTempSearchQuery("");
                              updateFilter('searchQuery', "");
                            }}
                            className="p-1 hover:bg-blue-500/10 rounded-full transition-colors"
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </button>
                        )}
                        <Button
                          onClick={handleSearch}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium h-8 px-3"
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
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent ml-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-blue-500/10 shadow-sm">
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
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent ml-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-blue-500/10 shadow-sm">
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
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent ml-4"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-blue-500/10 shadow-sm">
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
                  className="w-full border-blue-500/20 text-navy hover:bg-blue-500/10"
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
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold text-navy tracking-tight"
                >
                  Luxury Perfume Collection
                </motion.h1>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-600 flex items-center gap-2"
                >
                  {isFiltering ? (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full"
                      />
                      <span>Filtering...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                    </motion.span>
                  )}
                </motion.div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-48 bg-white border-blue-500/20 hover:border-blue-500/40 transition-colors">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-500/20">
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-blue-500/20 rounded-lg overflow-hidden">
                  <Button
                    variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilter('viewMode', 'grid')}
                    className={`rounded-none ${filters.viewMode === 'grid' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-blue-500/10'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilter('viewMode', 'list')}
                    className={`rounded-none ${filters.viewMode === 'list' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-blue-500/10'}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
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
                    <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-navy border-blue-500/20">
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
                    <Badge key={brand} variant="secondary" className="gap-1 bg-blue-500/10 text-navy border-blue-500/20">
                      {brand}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => toggleBrand(brand)}
                      />
                    </Badge>
                  ))}

                  {/* Category Filters */}
                  {filters.selectedCategories.map(category => (
                    <Badge key={category} variant="secondary" className="gap-1 bg-blue-500/10 text-navy border-blue-500/20">
                      {category}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => toggleCategory(category)}
                      />
                    </Badge>
                  ))}

                  {/* Price Range Filter */}
                  {(filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && (
                    <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-navy border-blue-500/20">
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
            <motion.div
              key="products-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
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
                </motion.div>
              ) : (
                <motion.div
                  className={filters.viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
                    : "space-y-4"
                  }
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.02,
                          ease: "easeOut"
                        }}
                        layout
                      >
                        <LuxuryProductCard 
                          product={product} 
                          index={index} 
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </motion.div>
  );
}