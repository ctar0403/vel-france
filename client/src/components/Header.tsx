import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, User, ShoppingBag, Menu, Settings, ChevronDown } from "lucide-react";
import type { User as UserType } from "@shared/schema";
import logoImage from "@assets/Your paragraph text (2)_1753541928630.png";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  user?: UserType | null;
}

export default function Header({ cartItemCount = 0, onCartClick, user }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isBrandsHovered, setIsBrandsHovered] = useState(false);

  const brands = [
    "Armani", "Azzaro", "Boss", "Bottega Veneta", "Burberry", "Bvlgari", "Byredo", 
    "Calvin Klein", "Carolina Herrera", "Chanel", "Creed", "Davidoff", "Dior", 
    "Dolce & Gabbana", "Givenchy", "Gucci", "Hermes", "Initio", "Jean Paul Gaultier", 
    "Kilian", "Lancome", "Louis Vuitton", "Le Labo", "Maison Francis Kurkdjian", 
    "Maison Margiela", "Mancera", "Marc Antoine Barrois", "Marc Jacobs", "Memo", 
    "Molecule", "Montblanc", "Moschino", "Mugler", "Narciso", "Nasomatto", 
    "Orto Parisi", "Paco Rabanne", "Parfums de Marly", "Prada", "Roja", "Sospiro", 
    "Tiziana Terenzi", "Tom Ford", "Trussardi", "Valentino", "Versace", "Viktor&Rolf", 
    "Xerjoff", "Yves Saint Laurent", "Zadig & Voltaire"
  ];

  // Group brands by first letter
  const brandsByLetter = brands.reduce((acc, brand) => {
    const firstLetter = brand.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(brand);
    return acc;
  }, {} as Record<string, string[]>);

  // Sort letters alphabetically
  const sortedLetters = Object.keys(brandsByLetter).sort();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
    setIsSearchOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBrandClick = (brand: string) => {
    // TODO: Implement brand filtering
    console.log("Selected brand:", brand);
    scrollToSection('products');
  };

  return (
    <header className="bg-white shadow-lg border-b border-gold/20 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src={logoImage}
              alt="Vel France Logo"
              className="h-12 cursor-pointer"
              onClick={() => scrollToSection('home')}
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 font-roboto">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('products')}
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Catalogue
            </button>
            <Popover open={isBrandsHovered} onOpenChange={setIsBrandsHovered}>
              <PopoverTrigger asChild>
                <div
                  onMouseEnter={() => setIsBrandsHovered(true)}
                  onMouseLeave={() => setIsBrandsHovered(false)}
                >
                  <button className="flex items-center text-navy hover:text-gold transition-colors duration-300 font-medium group">
                    Brands
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isBrandsHovered ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[1400px] max-w-none p-0 bg-white border border-gold/20 shadow-2xl max-h-[80vh] overflow-hidden" 
                align="center"
                side="bottom"
                sideOffset={10}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onMouseEnter={() => setIsBrandsHovered(true)}
                onMouseLeave={() => setIsBrandsHovered(false)}
              >
                <div className="p-8 overflow-y-auto scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
                  <h3 className="font-roboto-slab text-xl font-semibold text-navy mb-8 border-b border-gold/20 pb-3 text-center">
                    Luxury Brands Collection
                  </h3>
                  <div className="grid grid-cols-9 gap-6">
                    {sortedLetters.map((letter) => (
                      <div key={letter} className="space-y-2">
                        <h4 className="font-roboto text-lg font-bold text-gold border-b border-gold/30 pb-1 mb-3 text-center">
                          {letter}
                        </h4>
                        <div className="space-y-1">
                          {brandsByLetter[letter].map((brand) => (
                            <button
                              key={brand}
                              onClick={() => handleBrandClick(brand)}
                              className="block w-full text-left text-xs text-navy hover:bg-cream hover:text-gold cursor-pointer font-roboto px-3 py-2 rounded-md transition-colors duration-200 border border-transparent hover:border-gold/20 whitespace-nowrap"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <button 
              onClick={() => scrollToSection('mens')}
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Men's
            </button>
            <button 
              onClick={() => scrollToSection('womens')}
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Women's
            </button>
            <button 
              onClick={() => scrollToSection('unisex')}
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Unisex
            </button>
            <button 
              onClick={() => scrollToSection('niche')}
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Niche
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Contact
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-navy hover:text-gold">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto border-gold/20">
                <div className="container mx-auto px-4 py-8">
                  <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                    <div className="flex space-x-4">
                      <Input
                        type="text"
                        placeholder="Search for a perfume..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 text-lg py-3 border-gold/30 focus:border-gold"
                      />
                      <Button type="submit" className="bg-gold hover:bg-deep-gold text-navy px-8">
                        Search
                      </Button>
                    </div>
                  </form>
                </div>
              </SheetContent>
            </Sheet>

            {/* User Account */}
            {user ? (
              <div className="flex items-center space-x-2">
                {user.isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/admin'}
                    className="text-navy hover:text-gold"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-navy" />
                    </div>
                  )}
                  <span className="hidden sm:block text-navy font-roboto">
                    {user.firstName || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-navy hover:text-gold font-roboto"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/login'}
                className="text-navy hover:text-gold"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-navy hover:text-gold"
              onClick={onCartClick}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-gold to-deep-gold text-navy text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden text-navy hover:text-gold">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-gold/20">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-2">
                    <h1 className="font-vibes text-3xl text-navy">Vel France</h1>
                    <span className="text-gold text-lg">✦</span>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 font-roboto">
                    <button 
                      onClick={() => scrollToSection('home')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => scrollToSection('products')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Catalogue
                    </button>
                    <div>
                      <button 
                        onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                        className="flex items-center justify-between w-full text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                      >
                        Brands
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isBrandsOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isBrandsOpen && (
                        <div className="ml-4 mt-2 max-h-48 overflow-y-auto border-l border-gold/20 pl-4">
                          {brands.map((brand) => (
                            <button
                              key={brand}
                              onClick={() => {
                                handleBrandClick(brand);
                                setIsBrandsOpen(false);
                              }}
                              className="block w-full text-left text-sm text-navy hover:text-gold transition-colors duration-300 py-1.5 font-roboto"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => scrollToSection('mens')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Men's
                    </button>
                    <button 
                      onClick={() => scrollToSection('womens')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Women's
                    </button>
                    <button 
                      onClick={() => scrollToSection('unisex')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Unisex
                    </button>
                    <button 
                      onClick={() => scrollToSection('niche')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Niche
                    </button>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Contact
                    </button>
                  </nav>

                  {user && (
                    <div className="border-t border-gold/20 pt-6">
                      <div className="flex items-center space-x-3 mb-4">
                        {user.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-navy" />
                          </div>
                        )}
                        <div>
                          <p className="font-roboto text-navy">
                            {user.firstName || 'User'}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      
                      {user.isAdmin && (
                        <Button
                          variant="outline"
                          className="w-full mb-3 border-gold text-navy hover:bg-gold hover:text-navy"
                          onClick={() => window.location.href = '/admin'}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Administration
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        className="w-full border-navy text-navy hover:bg-navy hover:text-white"
                        onClick={() => window.location.href = '/api/logout'}
                      >
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
