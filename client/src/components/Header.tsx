import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, User, ShoppingBag, Menu, Settings } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  user?: UserType | null;
}

export default function Header({ cartItemCount = 0, onCartClick, user }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
    setIsSearchOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="bg-white shadow-lg border-b border-gold/20 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="font-vibes text-3xl text-navy cursor-pointer" onClick={() => scrollToSection('home')}>
              Vel France
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 font-playfair">
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
            <button 
              onClick={() => scrollToSection('brands')}
              className="text-navy hover:text-gold transition-colors duration-300 font-medium"
            >
              Brands
            </button>
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
                  <span className="hidden sm:block text-navy font-playfair">
                    {user.firstName || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-navy hover:text-gold font-playfair"
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
                  
                  <nav className="flex flex-col space-y-4 font-playfair">
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
                    <button 
                      onClick={() => scrollToSection('brands')}
                      className="text-left text-navy hover:text-gold transition-colors duration-300 py-2 font-medium"
                    >
                      Brands
                    </button>
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
                          <p className="font-playfair text-navy">
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
