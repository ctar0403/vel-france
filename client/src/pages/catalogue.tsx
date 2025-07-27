import React, { useState, useMemo, useEffect, useCallback } from "react";
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
    setFilters(prev => ({ ...prev, [key]: value }));
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      if (filters.searchQuery.trim()) {
        const searchTerm = filters.searchQuery.toLowerCase();
        const searchableText = [
          product.name,
          product.brand,
          product.description,
          product.notes,
          product.category
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Price range filter
      const price = parseFloat(product.price.toString());
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      // Brand filter
      if (filters.selectedBrands.length > 0 && product.brand) {
        if (!filters.selectedBrands.includes(product.brand)) {
          return false;
        }
      }

      // Category filter
      if (filters.selectedCategories.length > 0) {
        if (!filters.selectedCategories.includes(product.category)) {
          return false;
        }
      }

      return true;
    });

    // Sort products
    switch (filters.sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filtered.sort((a, b) => parseFloat(a.price.toString()) - parseFloat(b.price.toString()));
        break;
      case "price-desc":
        filtered.sort((a, b) => parseFloat(b.price.toString()) - parseFloat(a.price.toString()));
        break;
      case "brand":
        filtered.sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
        break;
    }

    return filtered;
  }, [products, filters]);

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
  };

  const activeFiltersCount = 
    (filters.searchQuery.trim() ? 1 : 0) +
    (filters.selectedBrands.length > 0 ? 1 : 0) +
    (filters.selectedCategories.length > 0 ? 1 : 0) +
    (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1] ? 1 : 0);

  // Isolated search component outside main render
  const SearchInput = () => {
    const [searchText, setSearchText] = useState("");
    
    const handleSearch = () => {
      updateFilter('searchQuery', searchText);
      setTempSearchQuery(searchText);
    };

    const handleClear = () => {
      setSearchText("");
      updateFilter('searchQuery', "");
      setTempSearchQuery("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };

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
                onChange={(e) => setSearchText(e.target.value)}
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
          {/* Products Grid/List with smooth animations */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {filteredProducts.length === 0 ? (
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
                <motion.div 
                  className={filters.viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
                    : "space-y-4"
                  }
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, index) => (
                      <LuxuryProductCard 
                        key={product.id} 
                        product={product} 
                        index={index} 
                      />
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