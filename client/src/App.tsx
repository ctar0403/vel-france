import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useEffect, Suspense, lazy } from "react";
import { optimizedQueryClient } from "./lib/optimizedQueryClient";
import { HeaderSkeleton } from "@/components/Skeleton/HeaderSkeleton";
import { PageLoader } from "@/components/Suspense/PageLoader";

// Only load Home immediately for FCP optimization
import Home from "@/pages/home";

// All other pages lazy loaded for performance
const Catalogue = lazy(() => import("@/pages/catalogue"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Contact = lazy(() => import("@/pages/contact"));
const AuthPage = lazy(() => import("@/pages/auth"));
const Profile = lazy(() => import("@/pages/profile"));
const OrderDetails = lazy(() => import("@/pages/order-details"));
const OrderPage = lazy(() => import("@/pages/order"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const PaymentCancel = lazy(() => import("@/pages/payment-cancel"));
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
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Home route - critical path, loaded immediately */}
          <Route path="/" component={Home} />
          
          {/* All other routes lazy loaded */}
          <Route path="/catalogue" component={Catalogue} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/contact" component={Contact} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/admin" component={AdminLogin} />
          <Route path="/admin-panel" component={Admin} />
          <Route path="/delivery" component={Delivery} />
          <Route path="/returns" component={Returns} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          
          {/* Payment routes */}
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/payment-cancel" component={PaymentCancel} />
          
          {/* Order routes */}
          <Route path="/order/:orderCode" component={OrderPage} />
          
          {/* Protected routes */}
          {user && (
            <>
              <Route path="/profile" component={Profile} />
              <Route path="/order/:orderId" component={OrderDetails} />
            </>
          )}
          
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={optimizedQueryClient}>
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
