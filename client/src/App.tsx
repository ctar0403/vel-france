import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RouteLoadingSpinner } from "@/components/LazyWrapper";
import { useEffect, Suspense, lazy } from "react";

// Critical pages loaded immediately (needed for initial load)
import Home from "@/pages/home";
import Catalogue from "@/pages/catalogue";
import ProductDetail from "@/pages/product-detail";

// Lazy load non-critical pages to reduce bundle size by ~585 KiB
const Contact = lazy(() => import("@/pages/contact"));
const AuthPage = lazy(() => import("@/pages/auth"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Profile = lazy(() => import("@/pages/profile"));
const OrderDetails = lazy(() => import("@/pages/order-details"));
const OrderPage = lazy(() => import("@/pages/order"));

// Admin pages - separate chunk for admin functionality
const Admin = lazy(() => import("@/pages/admin"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));

// Payment pages - separate chunk for payment flow
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const PaymentCancel = lazy(() => import("@/pages/payment-cancel"));

// Static pages - separate chunk for informational content
const Delivery = lazy(() => import("@/pages/delivery"));
const Returns = lazy(() => import("@/pages/returns"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const NotFound = lazy(() => import("@/pages/not-found"));

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-navy font-roboto">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoadingSpinner />}>
        <Switch>
          {/* Critical routes loaded immediately */}
          <Route path="/" component={Home} />
          <Route path="/catalogue" component={Catalogue} />
          <Route path="/product/:id" component={ProductDetail} />
          
          {/* Lazy loaded routes */}
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/payment-cancel" component={PaymentCancel} />
          <Route path="/order/:orderCode" component={OrderPage} />
          <Route path="/contact" component={Contact} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/admin" component={AdminLogin} />
          <Route path="/admin-panel" component={Admin} />
          <Route path="/delivery" component={Delivery} />
          <Route path="/returns" component={Returns} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          
          {/* Protected routes */}
          {user && (
            <>
              <Route path="/profile" component={Profile} />
              <Route path="/order-details/:orderCode" component={OrderDetails} />
            </>
          )}
          
          {/* 404 catch all */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      <MobileBottomNav />
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
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
