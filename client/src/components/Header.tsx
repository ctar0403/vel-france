import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, User, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "@/components/LogoutButton";
import logoImage from "@assets/Your paragraph text (4)_1753542106373.png";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export default function Header({ cartItemCount = 0, onCartClick }: HeaderProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

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
    if (searchQuery.trim()) {
      // Navigate to catalogue page with search query
      setLocation(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };



  const handleCategoryClick = (category: string) => {
    // Navigate to catalogue page with category filter
    setLocation(`/catalogue?category=${encodeURIComponent(category)}`);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gold/20 sticky top-0 z-50 w-full">
      <nav className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 w-full">
        <div className="flex items-center justify-between min-w-0 gap-2 sm:gap-4">
          {/* Logo - Hidden on mobile since we have bottom nav */}
          <div className="hidden md:flex items-center flex-shrink-0">
            <Link href="/">
              <img 
                src={logoImage}
                alt="Vel France Logo"
                className="h-8 sm:h-10 lg:h-12 cursor-pointer"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center space-x-4 xl:space-x-6 font-roboto flex-1 min-w-0">
            <Link 
              href="/"
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Home
            </Link>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center text-navy hover:text-gold transition-colors duration-300 font-medium group">
                  Brands
                  <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 max-h-96 overflow-y-auto z-[9999] min-w-0" sideOffset={5} align="center">
                <div className="p-3">
                  {(() => {
                    // Group brands by first letter
                    const brandsByLetter = brands.reduce((acc, brand) => {
                      const firstLetter = brand.charAt(0).toUpperCase();
                      if (!acc[firstLetter]) {
                        acc[firstLetter] = [];
                      }
                      acc[firstLetter].push(brand);
                      return acc;
                    }, {} as Record<string, string[]>);

                    // Sort letters and render
                    return Object.keys(brandsByLetter).sort().map((letter) => (
                      <div key={letter} className="mb-4">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-[#000000] to-[#000000] text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {letter}
                          </div>
                          <div className="flex-1 h-px bg-gradient-to-r from-[#00000088] to-transparent ml-2"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 ml-8">
                          {brandsByLetter[letter].map((brand) => (
                            <DropdownMenuItem key={brand} asChild>
                              <Link
                                href={`/catalogue?brand=${encodeURIComponent(brand)}`}
                                className="cursor-pointer text-xs px-2 py-1.5 hover:bg-cream hover:text-gold transition-colors duration-200 rounded block"
                              >
                                {brand}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link 
              href="/catalogue"
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Catalogue
            </Link>
            <Link 
              href="/contact"
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Contact
            </Link>
          </div>
          
          {/* Mobile Search - Full Width */}
          <div className="flex md:hidden items-center flex-1 justify-center px-4">
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 w-full max-w-md cursor-pointer hover:bg-gray-100 transition-colors">
                  <Search className="h-4 w-4 text-gray-500 mr-3" />
                  <span className="text-gray-500 text-sm flex-1">Search for a perfume...</span>
                </div>
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
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Search */}
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-navy hover:text-gold p-1 sm:p-2">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
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
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link href="/profile">
                  <div className="flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gold rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-navy" />
                      </div>
                    )}
                    <span className="hidden md:block text-navy font-roboto text-sm">
                      {user.firstName || user.email?.split('@')[0]}
                    </span>
                  </div>
                </Link>
                <LogoutButton 
                  variant="ghost" 
                  size="sm" 
                  className="text-navy hover:text-gold font-roboto hidden sm:flex" 
                />
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-navy hover:text-gold p-1 sm:p-2"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-navy hover:text-gold p-1 sm:p-2"
              onClick={onCartClick}
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-gold to-deep-gold text-navy text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden text-navy hover:text-gold p-1 sm:p-2">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80 border-gold/20">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-2">
                    <h1 className="font-vibes text-3xl text-navy">Vel France</h1>
                    <span className="text-gold text-lg">✦</span>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 font-roboto">
                    <Link 
                      href="/"
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium block"
                    >
                      Home
                    </Link>
                    <Link 
                      href="/catalogue"
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium block"
                    >
                      Catalogue
                    </Link>
                    <div>
                      <button 
                        onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                        className="flex items-center justify-between w-full text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                      >
                        Brands
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isBrandsOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isBrandsOpen && (
                        <div className="ml-4 mt-2 max-h-64 overflow-y-auto border-l border-gold/20 pl-4">
                          {(() => {
                            // Group brands by first letter for mobile
                            const brandsByLetter = brands.reduce((acc, brand) => {
                              const firstLetter = brand.charAt(0).toUpperCase();
                              if (!acc[firstLetter]) {
                                acc[firstLetter] = [];
                              }
                              acc[firstLetter].push(brand);
                              return acc;
                            }, {} as Record<string, string[]>);

                            // Sort letters and render
                            return Object.keys(brandsByLetter).sort().map((letter) => (
                              <div key={letter} className="mb-3">
                                <div className="flex items-center mb-1">
                                  <div className="w-5 h-5 bg-gradient-to-r from-[#000000] to-[#000000] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {letter}
                                  </div>
                                  <div className="flex-1 h-px bg-gradient-to-r from-[#00000088] to-transparent ml-2"></div>
                                </div>
                                <div className="space-y-1 ml-7">
                                  {brandsByLetter[letter].map((brand) => (
                                    <Link
                                      key={brand}
                                      href={`/catalogue?brand=${encodeURIComponent(brand)}`}
                                      onClick={() => setIsBrandsOpen(false)}
                                      className="block w-full text-left text-sm text-navy hover:text-gold transition-colors duration-300 py-1 font-roboto"
                                    >
                                      {brand}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>

                    <Link 
                      href="/contact"
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Contact
                    </Link>
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
                      
                      <LogoutButton 
                        variant="outline" 
                        className="w-full border-navy text-navy hover:bg-navy hover:text-white"
                        showIcon={false}
                      />
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
