import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingCart, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function PaymentCancel() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const orderId = urlParams.get('orderId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="h-12 w-12 text-red-600" />
        </motion.div>

        {/* Cancel Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="font-playfair text-3xl text-navy mb-4">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled and no charges were made. Your items are still in your cart if you'd like to try again.
          </p>
          
          {orderId && (
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600 mb-1">Cancelled Order</p>
              <p className="font-playfair font-semibold text-red-700">#{orderId.slice(-8).toUpperCase()}</p>
            </div>
          )}
        </motion.div>

        {/* Help Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-center text-blue-600 mb-2">
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span className="font-playfair font-semibold">Need Help?</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your cart items are still saved</li>
            <li>• Try a different payment method</li>
            <li>• Contact support if you're experiencing issues</li>
            <li>• All prices are in Georgian Lari (₾)</li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-gold to-deep-gold text-navy font-playfair font-semibold hover:shadow-lg transition-all duration-300">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Return to Cart
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white">
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>

        {/* Customer Support */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-gray-500 mt-6"
        >
          Having trouble? Contact us at{" "}
          <a href="mailto:support@velFrance.com" className="text-gold hover:underline">
            support@velFrance.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}