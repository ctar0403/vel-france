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

// Premium Product Card Component - Matches Reference Design
function LuxuryProductCard({ product }: { product: Product }) {
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

  // Format product name to show brand - product name
  const formatProductName = (name: string, brand?: string | null) => {
    if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
      return `${brand} – ${name}`;
    }
    return name;
  };

  return (
    <div
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
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 ease-out"
            style={{
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              aspectRatio: '1/1',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cream to-pink/20" style={{ aspectRatio: '1/1' }}>
            <div className="text-4xl opacity-20">🌸</div>
          </div>
        )}

        {/* Add to Cart Button - Slides from bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-3 transition-transform duration-300 ease-out"
          style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            opacity: isHovered ? 1 : 0,
          }}
        >
          <button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            className="w-full py-2.5 px-4 rounded-full font-medium text-sm transition-all duration-200 ease-out shadow-lg"
            style={{
              backgroundColor: isButtonHovered ? '#3b82f6' : 'rgba(255, 255, 255, 0.95)',
              color: isButtonHovered ? 'white' : '#1e3a8a',
              backdropFilter: 'blur(10px)',
              transform: isButtonHovered ? 'scale(1.02)' : 'scale(1)',
            }}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            {isButtonHovered ? (
              <div className="flex items-center justify-center">
                <ShoppingCart className="h-4 w-4" />
              </div>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="h-[110px] p-3 flex flex-col justify-center">
        <h3 className="font-semibold text-navy text-sm mb-2 leading-tight line-clamp-3">
          {formatProductName(product.name, product.brand)}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-gold">
            ${parseFloat(product.price.toString()).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
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

  // Update filter price range when products load to match actual range
  useEffect(() => {
    if (products.length > 0) {
      const range = priceRange as [number, number];
      setFilters(prev => ({
        ...prev,
        priceRange: range
      }));
      setTempPriceRange(range);
    }
  }, [products, priceRange]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {

      // Search query filter
      if (filters.searchQuery.trim()) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(searchLower);
        const matchesBrand = product.brand?.toLowerCase().includes(searchLower);
        const matchesDescription = product.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesBrand && !matchesDescription) {
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
        if (!filters.selectedBrands.includes(product.brand)) return false;
      }

      // Category filter
      if (filters.selectedCategories.length > 0 && product.category) {
        if (!filters.selectedCategories.includes(product.category)) return false;
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
      default:
        break;
    }

    return filtered;
  }, [products, filters]);

  const updateFilter = (key: keyof CatalogueFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleBrand = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(brand)
        ? prev.selectedBrands.filter(b => b !== brand)
        : [...prev.selectedBrands, brand]
    }));
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  };

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
                className="w-full bg-gradient-to-r from-gold to-gold/90 hover:from-gold/90 hover:to-gold text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-11 rounded-xl"
              >Search</Button>
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
              e.preventDefault(); // Prevent text selection
              
              const rect = e.currentTarget.getBoundingClientRect();
              const totalWidth = rect.width;
              const clickX = e.clientX - rect.left;
              const clickPercent = clickX / totalWidth;
              const clickValue = priceRange[0] + (clickPercent * (priceRange[1] - priceRange[0]));
              
              // Determine which handle is closer
              const distToMin = Math.abs(clickValue - tempPriceRange[0]);
              const distToMax = Math.abs(clickValue - tempPriceRange[1]);
              const isMinHandle = distToMin < distToMax;
              
              let isDragging = true;
              
              const handleMouseMove = (e: MouseEvent) => {
                if (!isDragging) return;
                e.preventDefault(); // Prevent text selection during drag
                
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
                document.body.style.userSelect = ''; // Re-enable text selection
              };
              
              const preventSelect = (e: Event) => e.preventDefault();
              
              // Disable text selection during drag
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
        
        {/* Filter Button - shows when temp range differs from applied range */}
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
                       'Versatile & Timeless'}
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
      <div className="min-h-screen bg-cream py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-navy">Loading catalogue...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="container mx-auto px-4 py-8">
        

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
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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

                
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilter('viewMode', 'grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilter('viewMode', 'list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {/* Search Query Filter */}
                  {filters.searchQuery.trim() && (
                    <Badge variant="secondary" className="gap-1">
                      Search: "{filters.searchQuery}"
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          updateFilter('searchQuery', "");
                          setTempSearchQuery("");
                        }}
                      />
                    </Badge>
                  )}

                  {filters.selectedBrands.map(brand => (
                    <Badge key={brand} variant="secondary" className="gap-1">
                      {brand}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleBrand(brand)}
                      />
                    </Badge>
                  ))}
                  {filters.selectedCategories.map(category => (
                    <Badge key={category} variant="secondary" className="gap-1 capitalize">
                      {category}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleCategory(category)}
                      />
                    </Badge>
                  ))}
                  {(filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1]) && (
                    <Badge variant="secondary" className="gap-1">
                      ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => updateFilter('priceRange', priceRange)}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-16 w-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-navy mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more products</p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={filters.viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <LuxuryProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}