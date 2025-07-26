import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Catalogue from "@/pages/catalogue";
import AuthPage from "@/pages/auth";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Profile from "@/pages/profile";
import OrderDetails from "@/pages/order-details";
import Admin from "@/pages/admin";
import PaymentSuccess from "@/pages/payment-success";
import PaymentCancel from "@/pages/payment-cancel";
import NotFound from "@/pages/not-found";

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
    <Switch>
      {/* Payment routes available to all users */}
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/payment-cancel" component={PaymentCancel} />
      
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/catalogue" component={Catalogue} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes - only accessible when logged in */}
      {user && (
        <>
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/profile" component={Profile} />
          <Route path="/order/:orderId" component={OrderDetails} />
          {user.isAdmin && <Route path="/admin" component={Admin} />}
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
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
