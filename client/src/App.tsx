import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useTranslationsReady } from "@/lib/translations";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useEffect } from "react";
import { initializeCriticalResources } from "@/utils/criticalResourceLoader";
import { initializeAllOptimizations } from "@/utils/resourceOptimization";
import CriticalCSS from "@/components/CriticalCSS";
import { lazy, Suspense } from "react";
import Home from "@/pages/home"; // Keep home page synchronous for LCP

// Lazy load non-critical pages to reduce initial bundle size
const Catalogue = lazy(() => import("@/pages/catalogue"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const Contact = lazy(() => import("@/pages/contact"));
const AuthPage = lazy(() => import("@/pages/auth"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Profile = lazy(() => import("@/pages/profile"));
const OrderDetails = lazy(() => import("@/pages/order-details"));
const OrderPage = lazy(() => import("@/pages/order"));
const Admin = lazy(() => import("@/pages/admin"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminTranslations = lazy(() => import("@/pages/admin-translations"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const PaymentCancel = lazy(() => import("@/pages/payment-cancel"));
const Delivery = lazy(() => import("@/pages/delivery"));
const Returns = lazy(() => import("@/pages/returns"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for lazy-loaded pages
const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-navy font-roboto">Loading...</div>
    </div>
  }>
    {children}
  </Suspense>
);

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

  // Initialize critical resources and performance optimizations early
  useEffect(() => {
    // Initialize critical resources for core functionality
    initializeCriticalResources().catch(console.error);
    
    // Initialize all performance optimizations for 100/100 PageSpeed score
    initializeAllOptimizations();
  }, []);

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
        <Route path="/payment-success">
          <PageSuspense><PaymentSuccess /></PageSuspense>
        </Route>
        <Route path="/payment-cancel">
          <PageSuspense><PaymentCancel /></PageSuspense>
        </Route>
        
        {/* Public order route for unique URLs */}
        <Route path="/order/:orderCode">
          <PageSuspense><OrderPage /></PageSuspense>
        </Route>
        
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/catalogue">
          <PageSuspense><Catalogue /></PageSuspense>
        </Route>
        <Route path="/product/:id">
          <PageSuspense><ProductDetail /></PageSuspense>
        </Route>
        <Route path="/contact">
          <PageSuspense><Contact /></PageSuspense>
        </Route>
        <Route path="/cart">
          <PageSuspense><Cart /></PageSuspense>
        </Route>
        <Route path="/checkout">
          <PageSuspense><Checkout /></PageSuspense>
        </Route>
        <Route path="/auth">
          <PageSuspense><AuthPage /></PageSuspense>
        </Route>
        <Route path="/admin">
          <PageSuspense><AdminLogin /></PageSuspense>
        </Route>
        <Route path="/admin-panel">
          <PageSuspense><Admin /></PageSuspense>
        </Route>
        <Route path="/admin-translations">
          <PageSuspense><AdminTranslations /></PageSuspense>
        </Route>
        <Route path="/delivery">
          <PageSuspense><Delivery /></PageSuspense>
        </Route>
        <Route path="/returns">
          <PageSuspense><Returns /></PageSuspense>
        </Route>
        <Route path="/privacy">
          <PageSuspense><Privacy /></PageSuspense>
        </Route>
        <Route path="/terms">
          <PageSuspense><Terms /></PageSuspense>
        </Route>
        
        {/* Protected routes - only accessible when logged in */}
        {user && (
          <>
            <Route path="/profile">
              <PageSuspense><Profile /></PageSuspense>
            </Route>
            <Route path="/order/:orderId">
              <PageSuspense><OrderDetails /></PageSuspense>
            </Route>
          </>
        )}
        
        <Route>
          <PageSuspense><NotFound /></PageSuspense>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <CriticalCSS />
          <Toaster />
          <Router />
          <MobileBottomNav />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
