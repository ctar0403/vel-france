import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Home, Sparkles, Gift, ShoppingBag, ArrowRight, Copy, Check, Heart, Star } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const orderCode = urlParams.get('orderCode');
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // If no order code in URL, try to get the latest completed order for current user
  const { data: orders } = useQuery<Array<{orderCode: string}>>({
    queryKey: ['/api/orders'],
    enabled: !orderCode,
  });
  
  // Get the most recent order code if available
  const latestOrderCode = !orderCode && orders && Array.isArray(orders) && orders.length > 0 ? orders[0].orderCode : orderCode;

  // Trigger confetti animation on mount
  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyOrderCode = () => {
    if (latestOrderCode) {
      navigator.clipboard.writeText(latestOrderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Clear any cart data from localStorage if needed
    localStorage.removeItem('cartItems');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink/20 via-white to-cream/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-gold/20 to-deep-gold/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-pastel-pink/20 to-navy/10 rounded-full blur-3xl"
        />
        
        {/* Floating decorative elements */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 3, delay: 1 }}
          className="absolute top-20 left-20 w-4 h-4 bg-gold rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 3, delay: 1.5 }}
          className="absolute top-40 right-40 w-6 h-6 bg-pastel-pink rounded-full"
        />
      </div>

      {/* Floating Sparkles Animation */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  y: typeof window !== 'undefined' ? window.innerHeight : 800, 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  rotate: 0,
                  scale: 0.5
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  y: -100, 
                  rotate: 360,
                  scale: [0.5, 1, 0.8]
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 4, 
                  delay: i * 0.15,
                  ease: "easeOut" 
                }}
                className="absolute pointer-events-none z-20"
              >
                {i % 3 === 0 ? (
                  <Sparkles className="w-6 h-6 text-gold" />
                ) : i % 3 === 1 ? (
                  <Star className="w-5 h-5 text-deep-gold" />
                ) : (
                  <Heart className="w-4 h-4 text-pastel-pink" />
                )}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl w-full"
        >
          {/* Main Success Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-10 text-center relative overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-navy/5 pointer-events-none" />
            
            {/* Success Icon with Complex Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 10 }}
              className="relative z-10 mb-8"
            >
              <div className="mx-auto w-24 h-24 relative">
                {/* Outer pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-gold/30 to-deep-gold/30 rounded-full"
                />
                
                {/* Middle ring */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute inset-2 bg-gradient-to-r from-gold/50 to-deep-gold/50 rounded-full"
                />
                
                {/* Main icon container */}
                <div className="absolute inset-4 bg-gradient-to-r from-gold to-deep-gold rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-navy" />
                </div>
              </div>
            </motion.div>

            {/* Success Message with Stagger Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="relative z-10 mb-10"
            >
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-4xl font-playfair font-bold bg-gradient-to-r from-navy via-navy to-deep-gold bg-clip-text text-transparent mb-4"
              >
                Merci Beaucoup! 💐
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-gray-600 mb-2 text-xl leading-relaxed"
              >
                Your exquisite fragrance selection has been 
                <span className="font-semibold text-navy"> confirmed</span>
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-gray-500 text-lg"
              >
                Each bottle will be carefully prepared with French elegance
              </motion.p>
            </motion.div>

            {/* Order Code Section */}
            {latestOrderCode && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="bg-gradient-to-r from-cream/70 to-pastel-pink/40 rounded-2xl p-8 mb-10 relative z-10 border border-gold/30"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6, type: "spring" }}
                  className="flex items-center justify-center mb-4"
                >
                  <Gift className="w-6 h-6 text-gold mr-3" />
                  <p className="text-lg font-medium text-gray-700">Your Order Number</p>
                </motion.div>
                
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
                    className="bg-white/80 rounded-xl px-6 py-3 border border-gold/20"
                  >
                    <p className="font-playfair font-bold text-3xl text-navy tracking-wider">
                      {latestOrderCode}
                    </p>
                  </motion.div>
                  
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2, type: "spring" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyOrderCode}
                    className="p-3 rounded-xl bg-white/70 hover:bg-white/90 transition-all duration-300 border border-gold/20"
                  >
                    <motion.div
                      animate={{ rotate: copied ? 360 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </motion.div>
                  </motion.button>
                </div>

                <Link href={`/order/${latestOrderCode}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-gold via-deep-gold to-gold text-navy font-semibold hover:shadow-xl transition-all duration-300 group py-4 text-lg rounded-xl"
                      size="lg"
                    >
                      <ShoppingBag className="mr-3 h-6 w-6" />
                      View Order Details
                      <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            )}

            {/* What Happens Next Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.5 }}
              className="bg-navy/5 rounded-xl p-6 mb-8 relative z-10"
            >
              <div className="flex items-center justify-center text-navy mb-4">
                <Package className="h-6 w-6 mr-3" />
                <span className="font-playfair font-semibold text-lg">What happens next?</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.6 }}
                  className="flex items-center"
                >
                  <div className="w-2 h-2 bg-gold rounded-full mr-3" />
                  Order confirmation email sent
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.8 }}
                  className="flex items-center"
                >
                  <div className="w-2 h-2 bg-gold rounded-full mr-3" />
                  Careful packaging with love
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 3 }}
                  className="flex items-center"
                >
                  <div className="w-2 h-2 bg-gold rounded-full mr-3" />
                  Ships within 1-2 business days
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 3.2 }}
                  className="flex items-center"
                >
                  <div className="w-2 h-2 bg-gold rounded-full mr-3" />
                  Track your precious delivery
                </motion.div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10"
            >
              <Link href="/">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-navy text-navy hover:bg-navy hover:text-white transition-all duration-300 py-3 rounded-xl"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Continue Shopping
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/profile">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-gold text-gold hover:bg-gold hover:text-navy transition-all duration-300 py-3 rounded-xl"
                  >
                    <Package className="mr-2 h-5 w-5" />
                    Order History
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Customer Support */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.6 }}
              className="text-sm text-gray-500 mt-8 relative z-10"
            >
              Questions about your order?{" "}
              <a href="mailto:support@velFrance.com" className="text-gold hover:text-deep-gold transition-colors font-medium">
                Contact our French support team
              </a>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}