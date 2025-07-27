import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, X, Grid, List, SlidersHorizontal, ShoppingCart, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

// Premium Product Card Component with Smooth Animations
function LuxuryProductCard({ product, index }: { product: Product; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.4, 0.0, 0.2, 1]
      }}
      layout
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-xl shadow-md overflow-hidden cursor-pointer mx-auto"
      style={{ width: '280px', height: '390px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsButtonHovered(false);
      }}
    >
      {/* Product Image - Perfect Square 280x280 */}
      <div className="relative w-full h-[280px] bg-gradient-to-br from-cream to-pink/10 overflow-hidden">
        {product.imageUrl ? (
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain"
            style={{
              aspectRatio: '1/1',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-pink/20" style={{ aspectRatio: '1/1' }}>
            <div className="text-4xl opacity-20">🌸</div>
          </div>
        )}

        {/* Add to Cart Button with smooth animations */}
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ 
            y: isHovered ? 0 : "100%",
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 p-3"
        >
          <motion.button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="w-full bg-navy/90 hover:bg-navy text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            <motion.div
              initial={false}
              animate={{ scale: isButtonHovered ? 1.1 : 1 }}
              className="flex items-center justify-center"
            >
              {addToCartMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : isButtonHovered ? (
                <ShoppingCart className="h-4 w-4" />
              ) : (
                'Add to Cart'
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="h-[110px] p-3 flex flex-col justify-center">
        <motion.h3 
          className="font-semibold text-navy text-sm mb-2 leading-tight line-clamp-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.2 }}
        >
          {formatProductName(product.name, product.brand)}
        </motion.h3>
        
        <div className="flex items-center justify-between">
          <motion.span 
            className="text-base font-bold text-gold"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.3 }}
          >
            ${parseFloat(product.price.toString()).toFixed(2)}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Catalogue() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<CatalogueFilters>({
    searchQuery: "",
    priceRange: [0, 1000],
    selectedBrands: [],
    selectedCategories: [],
    sortBy: "name-asc",
    viewMode: 'grid'
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 1000]);
  const [tempSearchQuery, setTempSearchQuery] = useState<string>("");
  
  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  
  const PRODUCTS_PER_PAGE = 12;
  
  // Debounce refs
  const filterTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize temp search from current filter
  useEffect(() => {
    setTempSearchQuery(filters.searchQuery);
  }, [filters.searchQuery]);

  // Parse URL parameters for initial filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get('brand');
    const categoryParam = urlParams.get('category');
    
    if (brandParam) {
      setFilters(prev => ({
        ...prev,
        selectedBrands: [brandParam]
      }));
    }
    
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        selectedCategories: [categoryParam]
      }));
    }
  }, [location]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Extract unique brands and categories from products
  const availableBrands = useMemo(() => {
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
    return brands.sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
    return categories.sort();
  }, [products]);

  // Calculate price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return [0, 1000];
    const prices = products.map(p => parseFloat(p.price.toString()));
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  // Initialize temp price range when products load
  useEffect(() => {
    if (priceRange[0] !== 0 || priceRange[1] !== 1000) {
      setTempPriceRange(priceRange as [number, number]);
      setFilters(prev => ({
        ...prev,
        priceRange: priceRange as [number, number]
      }));
    }
  }, [priceRange]);

  const updateFilter = useCallback((key: keyof CatalogueFilters, value: any) => {
    setIsFiltering(true);
    
    // Clear previous timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    // Apply filter immediately for instant UI feedback
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Set filtering state to false after a short delay
    filterTimeoutRef.current = setTimeout(() => {
      setIsFiltering(false);
    }, 150);
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setFilters(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brand)
        ? prev.selectedBrands.filter(b => b !== brand)
        : [...prev.selectedBrands, brand]
    }));
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  }, []);

  // Pre-process products for faster filtering
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

  // Filter and sort products with optimized performance
  const allFilteredProducts = useMemo(() => {
    let filtered = processedProducts;

    // Apply filters efficiently
    if (filters.searchQuery.trim()) {
      const searchTerm = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.searchableText.includes(searchTerm)
      );
    }

    if (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) {
      filtered = filtered.filter(product => 
        product.numericPrice >= filters.priceRange[0] && 
        product.numericPrice <= filters.priceRange[1]
      );
    }

    if (filters.selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        product.brand && filters.selectedBrands.includes(product.brand)
      );
    }

    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        filters.selectedCategories.includes(product.category)
      );
    }

    // Sort products efficiently
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

  // Get currently displayed products (paginated)
  const displayedProducts = useMemo(() => {
    return allFilteredProducts.slice(0, displayedCount);
  }, [allFilteredProducts, displayedCount]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayedCount(PRODUCTS_PER_PAGE);
  }, [filters]);

  const clearAllFilters = () => {
    const resetRange = [priceRange[0], priceRange[1]] as [number, number];
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
    setDisplayedCount(PRODUCTS_PER_PAGE);
  };

  // Load more products function
  const loadMoreProducts = useCallback(() => {
    if (displayedCount >= allFilteredProducts.length || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Realistic loading delay for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, allFilteredProducts.length));
      setIsLoadingMore(false);
    }, 800);
  }, [displayedCount, allFilteredProducts.length, isLoadingMore]);

  // Infinite scroll hook with balanced loading trigger
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = document.documentElement.offsetHeight;
      const threshold = 300; // Load when 300px from bottom (balanced)
      
      if (scrollPosition >= documentHeight - threshold && !isLoadingMore && displayedCount < allFilteredProducts.length) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts, isLoadingMore, displayedCount, allFilteredProducts.length]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any scroll modifications
      document.body.style.overflow = '';
    };
  }, []);

  const activeFiltersCount = 
    (filters.searchQuery.trim() ? 1 : 0) +
    (filters.selectedBrands.length > 0 ? 1 : 0) +
    (filters.selectedCategories.length > 0 ? 1 : 0) +
    (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1] ? 1 : 0);

  // Isolated search component with debounced search
  const SearchInput = () => {
    const [searchText, setSearchText] = useState("");
    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    
    const handleSearch = useCallback(() => {
      updateFilter('searchQuery', searchText);
      setTempSearchQuery(searchText);
    }, [searchText, updateFilter]);

    const handleClear = useCallback(() => {
      setSearchText("");
      updateFilter('searchQuery', "");
      setTempSearchQuery("");
    }, [updateFilter]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    };

    const handleTextChange = useCallback((value: string) => {
      setSearchText(value);
    }, []);

    // Sync only when filter changes externally (like clear all)
    useEffect(() => {
      if (filters.searchQuery === "") {
        setSearchText("");
      }
    }, [filters.searchQuery]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-navy tracking-wide">Discover Perfumes</h4>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent ml-4"></div>
        </div>
        <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-gold/10 shadow-sm">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search luxury fragrances, brands, or scent notes..."
                value={searchText}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex h-12 w-full rounded-xl border-2 border-gold/20 bg-gradient-to-r from-white to-cream/20 px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12 focus:border-gold focus:bg-white transition-all duration-200 shadow-sm font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {searchText && (
                  <button
                    onClick={handleClear}
                    className="h-7 w-7 p-0 hover:bg-gold/10 flex items-center justify-center rounded-full transition-all duration-200 group"
                  >
                    <X className="h-4 w-4 text-gray-400 group-hover:text-gold" />
                  </button>
                )}
                <div className="w-px h-6 bg-gold/20"></div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold/20 to-gold/30 flex items-center justify-center">
                  <Filter className="h-3 w-3 text-gold" />
                </div>
              </div>
            </div>
            
            {searchText.trim() && searchText !== filters.searchQuery && (
              <Button 
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-11 rounded-xl"
              >
                Search Fragrances
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const FilterPanel = () => (
    <div className="space-y-10">
      {/* Search */}
      <div className="relative">
        <SearchInput />
      </div>

      {/* Price Range */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-navy tracking-wide">Price Range</h4>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent ml-4"></div>
        </div>
        <div className="bg-gradient-to-r from-cream/30 to-white/50 rounded-xl p-6 border border-gold/10 shadow-sm">
          <div 
            className="relative w-full h-8 flex items-center cursor-pointer select-none"
            onMouseDown={(e) => {
              e.preventDefault();
              
              const rect = e.currentTarget.getBoundingClientRect();
              const totalWidth = rect.width;
              const clickX = e.clientX - rect.left;
              const clickPercent = clickX / totalWidth;
              const clickValue = priceRange[0] + (clickPercent * (priceRange[1] - priceRange[0]));
              
              const distToMin = Math.abs(clickValue - tempPriceRange[0]);
              const distToMax = Math.abs(clickValue - tempPriceRange[1]);
              const isMinHandle = distToMin < distToMax;
              
              let isDragging = true;
              
              const handleMouseMove = (e: MouseEvent) => {
                if (!isDragging) return;
                e.preventDefault();
                
                const newX = e.clientX - rect.left;
                const newPercent = Math.max(0, Math.min(1, newX / totalWidth));
                const newValue = Math.round(priceRange[0] + (newPercent * (priceRange[1] - priceRange[0])));
                
                if (isMinHandle) {
                  setTempPriceRange([Math.min(newValue, tempPriceRange[1]), tempPriceRange[1]]);
                } else {
                  setTempPriceRange([tempPriceRange[0], Math.max(newValue, tempPriceRange[0])]);
                }
              };
              
              const handleMouseUp = (e: MouseEvent) => {
                e.preventDefault();
                isDragging = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('selectstart', preventSelect);
                document.body.style.userSelect = '';
              };
              
              const preventSelect = (e: Event) => e.preventDefault();
              
              document.body.style.userSelect = 'none';
              document.addEventListener('selectstart', preventSelect);
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            {/* Track */}
            <div className="absolute w-full h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full shadow-inner">
              {/* Active Range */}
              <div 
                className="absolute h-3 bg-gradient-to-r from-gold/90 via-gold to-gold/90 rounded-full shadow-lg"
                style={{
                  left: `${((tempPriceRange[0] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
                  width: `${((tempPriceRange[1] - tempPriceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`
                }}
              />
            </div>
            
            {/* Min Handle */}
            <div 
              className="absolute w-7 h-7 border-3 border-gold rounded-full shadow-xl cursor-pointer hover:scale-125 hover:shadow-2xl transition-all duration-200 ring-2 ring-white/50 bg-[#737373]"
              style={{
                left: `calc(${((tempPriceRange[0] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}% - 14px)`,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2
              }}
            >
              <div className="absolute inset-1 bg-gold/20 rounded-full"></div>
            </div>
            
            {/* Max Handle */}
            <div 
              className="absolute w-7 h-7 border-3 border-gold rounded-full shadow-xl cursor-pointer hover:scale-125 hover:shadow-2xl transition-all duration-200 ring-2 ring-white/50 bg-[#737373]"
              style={{
                left: `calc(${((tempPriceRange[1] - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}% - 14px)`,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1
              }}
            >
              <div className="absolute inset-1 bg-gold/20 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center bg-gradient-to-r from-navy/5 to-gold/5 rounded-xl px-4 py-3 border border-gold/10">
          <div className="text-center">
            <div className="text-xs text-gray-500 font-medium">FROM</div>
            <div className="text-lg font-bold text-navy">${tempPriceRange[0]}</div>
          </div>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gold/40 to-transparent"></div>
          <div className="text-center">
            <div className="text-xs text-gray-500 font-medium">TO</div>
            <div className="text-lg font-bold text-navy">${tempPriceRange[1]}</div>
          </div>
        </div>
        
        {/* Filter Button */}
        {(tempPriceRange[0] !== filters.priceRange[0] || tempPriceRange[1] !== filters.priceRange[1]) && (
          <div className="mt-3">
            <Button 
              onClick={() => updateFilter('priceRange', tempPriceRange)}
              className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold"
            >
              Filter
            </Button>
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-navy tracking-wide">Luxury Brands</h4>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent ml-4"></div>
        </div>
        <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-gold/10 shadow-sm">
          <ScrollArea className="h-72 pr-3">
            <div className="space-y-3">
              {availableBrands.map(brand => (
                <div key={brand} className="group">
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gold/5 transition-all duration-200 cursor-pointer border border-transparent hover:border-gold/20"
                       onClick={() => toggleBrand(brand)}>
                    <div className="relative">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={filters.selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                        className="data-[state=checked]:bg-gold data-[state=checked]:border-gold border-2 border-gold/30 rounded-md w-5 h-5"
                      />
                      {filters.selectedBrands.includes(brand) && (
                        <div className="absolute inset-0 bg-gold/20 rounded-md animate-pulse"></div>
                      )}
                    </div>
                    <Label
                      htmlFor={`brand-${brand}`}
                      className="flex-1 font-medium text-navy group-hover:text-gold transition-colors cursor-pointer"
                    >
                      {brand}
                    </Label>
                    <div className="w-2 h-2 rounded-full bg-gold/20 group-hover:bg-gold/40 transition-colors"></div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-navy tracking-wide">Collections</h4>
          <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent ml-4"></div>
        </div>
        <div className="bg-gradient-to-br from-white to-cream/30 rounded-xl p-6 border border-gold/10 shadow-sm">
          <div className="space-y-4">
            {availableCategories.map(category => (
              <div key={category} className="group">
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-transparent to-gold/5 hover:from-gold/5 hover:to-gold/10 transition-all duration-200 cursor-pointer border border-transparent hover:border-gold/20"
                     onClick={() => toggleCategory(category)}>
                  <div className="relative">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="data-[state=checked]:bg-gold data-[state=checked]:border-gold border-2 border-gold/30 rounded-md w-5 h-5"
                    />
                    {filters.selectedCategories.includes(category) && (
                      <div className="absolute inset-0 bg-gold/20 rounded-md animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={`category-${category}`}
                      className="font-semibold text-navy group-hover:text-gold transition-colors capitalize text-lg cursor-pointer block"
                    >
                      {category}
                    </Label>
                    <div className="text-xs text-gray-500 mt-1">
                      {category === 'women' ? 'Elegant & Sophisticated' : 
                       category === 'men' ? 'Bold & Distinguished' : 
                       ''}
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gold/40 to-gold/60 group-hover:scale-125 transition-transform"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gold/20">
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            className="w-full bg-gradient-to-r from-white to-cream/50 border-2 border-gold/30 text-navy hover:bg-gradient-to-r hover:from-gold hover:to-gold/90 hover:text-white hover:border-gold transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-cream py-8"
      >
        <Header />
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-16 w-16 border-4 border-gold/20 border-t-gold mx-auto mb-6"
              />
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-navy text-lg font-medium"
              >
                Loading luxury catalogue...
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-1 w-48 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-cream"
    >
      <Header />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card className="sticky top-24 shadow-lg border-gold/20 bg-gradient-to-b from-white to-cream/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-navy">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Badge className="bg-gold text-navy font-semibold">{activeFiltersCount}</Badge>
                  )}
                </div>
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-transparent">
                  <FilterPanel />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar with Sorting and View Controls */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            >
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-gradient-to-b from-white to-cream/30">
                    <div className="py-4">
                      <h3 className="text-xl font-bold text-navy mb-6">Filters</h3>
                      <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-transparent">
                        <FilterPanel />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
                
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
                      Showing {displayedProducts.length} of {allFilteredProducts.length} {allFilteredProducts.length === 1 ? 'product' : 'products'}
                    </motion.span>
                  )}
                </motion.div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-48 bg-white border-gold/20 hover:border-gold/40 transition-colors">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gold/20">
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-gold/20 rounded-lg overflow-hidden">
                  <Button
                    variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilter('viewMode', 'grid')}
                    className={`rounded-none ${filters.viewMode === 'grid' ? 'bg-gold text-navy hover:bg-gold/90' : 'hover:bg-gold/10'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilter('viewMode', 'list')}
                    className={`rounded-none ${filters.viewMode === 'list' ? 'bg-gold text-navy hover:bg-gold/90' : 'hover:bg-gold/10'}`}
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
                    <Badge variant="secondary" className="gap-1 bg-gold/10 text-navy border-gold/20">
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
                    <Badge key={brand} variant="secondary" className="gap-1 bg-gold/10 text-navy border-gold/20">
                      {brand}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => toggleBrand(brand)}
                      />
                    </Badge>
                  ))}

                  {/* Category Filters */}
                  {filters.selectedCategories.map(category => (
                    <Badge key={category} variant="secondary" className="gap-1 capitalize bg-gold/10 text-navy border-gold/20">
                      {category}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => toggleCategory(category)}
                      />
                    </Badge>
                  ))}

                  {/* Price Range Filter */}
                  {(filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && (
                    <Badge variant="secondary" className="gap-1 bg-gold/10 text-navy border-gold/20">
                      ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => updateFilter('priceRange', priceRange)}
                      />
                    </Badge>
                  )}

                  {/* Clear All Button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-xs border-gold/30 text-navy hover:bg-gold/10"
                  >
                    Clear All
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Products Grid/List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {isFiltering && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center"
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-center gap-4 bg-white/95 px-8 py-4 rounded-2xl shadow-xl border border-gold/20"
                  >
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full"
                      />
                    </div>
                    <span className="text-navy font-semibold">Filtering products...</span>
                  </motion.div>
                </motion.div>
              )}
              {allFilteredProducts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="text-gray-400 mb-4">
                    <Filter className="h-16 w-16 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-navy mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters to see more products</p>
                  <Button onClick={clearAllFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={filters.viewMode === 'grid' 
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
                      : "space-y-4"
                    }
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {displayedProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index % PRODUCTS_PER_PAGE * 0.02,
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

                  {/* Loading Indicator appears at bottom when triggered */}
                  {isLoadingMore && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex items-center justify-center py-8 mt-4"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                          className="w-6 h-6 border-2 border-gray-300 border-t-navy rounded-full"
                        />
                        <span className="text-navy font-medium">Loading more products...</span>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </motion.div>
  );
}