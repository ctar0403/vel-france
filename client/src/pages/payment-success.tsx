import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const orderCode = urlParams.get('orderCode');
  
  // If no order code in URL, try to get the latest completed order for current user
  const { data: orders } = useQuery<Array<{orderCode: string}>>({
    queryKey: ['/api/orders'],
    enabled: !orderCode,
  });
  
  // Get the most recent order code if available
  const latestOrderCode = !orderCode && orders && Array.isArray(orders) && orders.length > 0 ? orders[0].orderCode : orderCode;

  useEffect(() => {
    // Clear any cart data from localStorage if needed
    localStorage.removeItem('cartItems');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-12 w-12 text-green-600" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="font-playfair text-3xl text-navy mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>
          
          {latestOrderCode && (
            <div className="bg-cream rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="font-playfair font-semibold text-navy">{latestOrderCode}</p>
              <p className="text-xs text-gray-500 mt-2">
                View your order details: <br />
                <a 
                  href={`/order/${latestOrderCode}`}
                  className="text-gold hover:text-gold/80 underline"
                >
                  /order/{latestOrderCode}
                </a>
              </p>
            </div>
          )}
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-pastel-pink/20 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-center text-gold mb-2">
            <Package className="h-5 w-5 mr-2" />
            <span className="font-playfair font-semibold">What happens next?</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You'll receive an order confirmation email shortly</li>
            <li>• Your perfumes will be carefully packaged</li>
            <li>• Shipping typically takes 3-5 business days</li>
            <li>• Track your order in your account dashboard</li>
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
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          
          <Link href="/orders">
            <Button variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white">
              <Package className="mr-2 h-4 w-4" />
              View Order History
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
          Questions? Contact our support team at{" "}
          <a href="mailto:support@velFrance.com" className="text-gold hover:underline">
            support@velFrance.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}