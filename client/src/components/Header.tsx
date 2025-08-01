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
      <nav className="container mx-auto px-4 sm:px-4 lg:px-6 py-4 sm:py-4 w-full">
        <div className="flex items-center justify-between min-w-0 gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/">
              <img 
                src={logoImage}
                alt="Vel France Logo"
                className="h-12 sm:h-10 lg:h-12 cursor-pointer"
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
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Search */}
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-navy hover:text-gold p-2 sm:p-2">
                  <Search className="h-5 w-5 sm:h-5 sm:w-5" />
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

            {/* Desktop User Account & Cart - Hidden on Mobile */}
            <div className="hidden md:flex items-center space-x-3">
              {/* User Account */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
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
                      <span className="text-navy font-roboto text-sm">
                        {user.firstName || user.email?.split('@')[0]}
                      </span>
                    </div>
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin-panel">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-navy hover:text-gold font-roboto text-xs px-2"
                      >
                        Admin
                      </Button>
                    </Link>
                  )}
                  <LogoutButton 
                    variant="ghost" 
                    size="sm" 
                    className="text-navy hover:text-gold font-roboto" 
                  />
                </div>
              ) : (
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-navy hover:text-gold p-2"
                  >
                    <User className="h-5 w-5 mr-2" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-navy hover:text-gold p-2"
                onClick={onCartClick}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-gold to-deep-gold text-navy text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden text-navy hover:text-gold p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80 border-gold/20">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center justify-center">
                    <button onClick={() => setLocation('/')}>
                      <img 
                        src={logoImage}
                        alt="Vel France Logo"
                        className="h-16 cursor-pointer"
                      />
                    </button>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 font-roboto">
                    <button 
                      onClick={() => setLocation('/')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium block w-full"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => setLocation('/catalogue')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium block w-full"
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
                                    <button
                                      key={brand}
                                      onClick={() => {
                                        setLocation(`/catalogue?brand=${encodeURIComponent(brand)}`);
                                        setIsBrandsOpen(false);
                                      }}
                                      className="block w-full text-left text-sm text-navy hover:text-gold transition-colors duration-300 py-1 font-roboto"
                                    >
                                      {brand}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => setLocation('/contact')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium block w-full"
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
