import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Product } from "@shared/schema";
import { Truck, Clock, MapPin } from "lucide-react";

export default function Delivery() {
  // Fetch cart items for header
  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    retry: false,
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-cream">
      <Header 
        cartItemCount={cartItemCount} 
        onCartClick={() => {}}
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Delivery Information</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tbilisi Delivery */}
              <div className="text-center">
                <div className="bg-gold/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-gold" />
                </div>
                <h2 className="text-2xl font-semibold text-navy mb-4">Tbilisi</h2>
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-lg text-gray-700">1-2 Business Days</span>
                </div>
                <p className="text-gray-600">
                  Fast delivery within Tbilisi city limits
                </p>
              </div>

              {/* Regions Delivery */}
              <div className="text-center">
                <div className="bg-gold/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-gold" />
                </div>
                <h2 className="text-2xl font-semibold text-navy mb-4">Regions</h2>
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-lg text-gray-700">2-3 Business Days</span>
                </div>
                <p className="text-gray-600">
                  Reliable delivery to all regions of Georgia
                </p>
              </div>
            </div>
          </div>

          {/* Additional Delivery Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">Delivery Details</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Free Delivery</h3>
                <p className="text-gray-600">
                  We offer free delivery on all orders. No minimum purchase required.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Order Processing</h3>
                <p className="text-gray-600">
                  Orders are processed within 24 hours on business days. You will receive a confirmation email with tracking information once your order has been dispatched.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Delivery Hours</h3>
                <p className="text-gray-600">
                  Deliveries are made Monday to Friday, 9:00 AM - 6:00 PM. Saturday deliveries are available in Tbilisi.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Contact for Delivery</h3>
                <p className="text-gray-600">
                  If you have any questions about your delivery, please contact our customer service team. We'll be happy to help track your order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}