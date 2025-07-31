import { memo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface CriticalHeaderProps {
  cartItemCount?: number;
}

// Ultra-lightweight header for critical rendering path
const CriticalHeader = memo(({ cartItemCount = 0 }: CriticalHeaderProps) => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', active: location === '/' },
    { href: '/catalogue', label: 'Catalogue', active: location.startsWith('/catalogue') },
    { href: '/contact', label: 'Contact', active: location === '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-navy">Vel France</h1>
              <p className="text-xs text-gray-600 -mt-1">Luxury Perfumes</p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={cn(
                "relative py-2 text-sm font-medium transition-colors hover:text-gold",
                item.active ? "text-gold" : "text-gray-700"
              )}>
                {item.label}
                {item.active && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold rounded-full" />
                )}
              </span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Search className="w-4 h-4" />
          </Button>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User */}
          <Link href={user ? '/profile' : '/auth'}>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "block py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                    item.active 
                      ? "bg-gold/10 text-gold" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
});

CriticalHeader.displayName = 'CriticalHeader';

export { CriticalHeader };