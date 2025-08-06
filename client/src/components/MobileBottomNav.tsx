import { Home, Store, ShoppingCart, User, LogIn } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export function MobileBottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();
  
  // Get cart items count
  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ['/api/cart'],
  });

  // Get user authentication status
  const { data: user } = useQuery<any>({
    queryKey: ['/api/user'],
  });

  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const isLoggedIn = !!user;

  const navItems = [
    {
      icon: Home,
      label: t('MobileBottomNav.home', 'Home'),
      path: '/',
      isActive: location === '/'
    },
    {
      icon: Store,
      label: t('MobileBottomNav.store', 'Store'),
      path: '/catalogue',
      isActive: location === '/catalogue' || location.startsWith('/product/')
    },
    {
      icon: ShoppingCart,
      label: t('MobileBottomNav.cart', 'Cart'),
      path: '/cart',
      isActive: location === '/cart',
      badge: cartCount > 0 ? cartCount : null
    },
    {
      icon: isLoggedIn ? User : LogIn,
      label: t('MobileBottomNav.account', 'Account'),
      path: isLoggedIn ? '/profile' : '/auth',
      isActive: location === '/profile' || location === '/admin' || location.startsWith('/order/') || location === '/auth'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999] md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="flex-1">
              <div className="flex flex-col items-center py-2 px-3">
                <div className="relative">
                  <Icon 
                    className={`w-6 h-6 ${
                      item.isActive 
                        ? 'text-gold' 
                        : 'text-gray-500'
                    }`} 
                  />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span 
                  className={`text-xs mt-1 ${
                    item.isActive 
                      ? 'text-gold font-medium' 
                      : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}