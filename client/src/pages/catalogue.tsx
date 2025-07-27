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
import { Search, Filter, X, Grid, List, SlidersHorizontal, ShoppingCart, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Simple Search Input Component - Direct state management
const SearchInput = React.memo(({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search perfumes, brands..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 border-gold/30 focus:border-gold focus:ring-gold/20 bg-white"
        autoComplete="off"
      />
    </div>
  );
});

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CatalogueFilters>({
    searchQuery: "",
    priceRange: [0, 1000],
    selectedBrands: [],
    selectedCategories: [],
    sortBy: "name-asc",
    viewMode: 'grid'
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Simple debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search input changes
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesQuery = 
          product.name.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query);
        if (!matchesQuery) return false;
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
    setSearchTerm("");
    setFilters({
      searchQuery: "",
      priceRange: [priceRange[0], priceRange[1]] as [number, number],
      selectedBrands: [],
      selectedCategories: [],
      sortBy: "name-asc",
      viewMode: filters.viewMode
    });
  };

  const activeFiltersCount = 
    (searchTerm ? 1 : 0) +
    (filters.selectedBrands.length > 0 ? 1 : 0) +
    (filters.selectedCategories.length > 0 ? 1 : 0) +
    (filters.priceRange[0] !== priceRange[0] || filters.priceRange[1] !== priceRange[1] ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Search */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-navy border-b border-gold/20 pb-2">Search</h4>
        <SearchInput value={searchTerm} onChange={handleSearchInputChange} />
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-navy border-b border-gold/20 pb-2">Price Range</h4>
        <div className="px-3 py-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
            max={priceRange[1]}
            min={priceRange[0]}
            step={10}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm font-medium text-gold bg-cream/50 rounded-lg px-3 py-2">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-navy border-b border-gold/20 pb-2">Brands</h4>
        <ScrollArea className="h-60 rounded-lg border border-gold/20 bg-white/50 p-3">
          <div className="space-y-3">
            {availableBrands.map(brand => (
              <div key={brand} className="flex items-center space-x-3 p-2 hover:bg-cream/30 rounded-md transition-colors">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                  className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                />
                <Label 
                  htmlFor={`brand-${brand}`}
                  className="text-sm font-medium cursor-pointer text-navy flex-1"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-navy border-b border-gold/20 pb-2">Categories</h4>
        <div className="space-y-3">
          {availableCategories.map(category => (
            <div key={category} className="flex items-center space-x-3 p-2 hover:bg-cream/30 rounded-md transition-colors">
              <Checkbox
                id={`category-${category}`}
                checked={filters.selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <Label 
                htmlFor={`category-${category}`}
                className="text-sm font-medium cursor-pointer capitalize text-navy flex-1"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          onClick={clearAllFilters}
          className="w-full bg-white border-gold text-navy hover:bg-gold hover:text-white transition-all duration-200"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters ({activeFiltersCount})
        </Button>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy mb-2">Perfume Catalogue</h1>
          <p className="text-gray-600">Discover our complete collection of luxury fragrances</p>
        </div>

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

                <p className="text-sm text-gray-600">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
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
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      Search: "{searchTerm}"
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSearchTerm('')}
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
                  <Search className="h-16 w-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-navy mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
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