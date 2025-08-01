import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useTranslationsReady } from "@/lib/translations";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useEffect } from "react";
import Home from "@/pages/home";
import Catalogue from "@/pages/catalogue";
import ProductDetail from "@/pages/product-detail";
import Contact from "@/pages/contact";
import AuthPage from "@/pages/auth";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Profile from "@/pages/profile";
import OrderDetails from "@/pages/order-details";
import OrderPage from "@/pages/order";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import AdminTranslations from "@/pages/admin-translations";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";
import Delivery from "@/pages/delivery";
import Returns from "@/pages/returns";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";

// Component to handle scroll restoration on route changes
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top when location changes
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  const { user, isLoading } = useAuth();
  const translationsReady = useTranslationsReady();

  if (isLoading || !translationsReady) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-navy font-roboto">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Payment routes available to all users */}
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/payment-cancel" component={PaymentCancel} />
        
        {/* Public order route for unique URLs */}
        <Route path="/order/:orderCode" component={OrderPage} />
        
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/catalogue" component={Catalogue} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/contact" component={Contact} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin-panel" component={Admin} />
        <Route path="/admin-translations" component={AdminTranslations} />
        <Route path="/delivery" component={Delivery} />
        <Route path="/returns" component={Returns} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        
        {/* Protected routes - only accessible when logged in */}
        {user && (
          <>
            <Route path="/profile" component={Profile} />
            <Route path="/order/:orderId" component={OrderDetails} />
          </>
        )}
        
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <MobileBottomNav />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
