import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Product } from "@shared/schema";
import { XCircle, Shield, Phone } from "lucide-react";

export default function Returns() {
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
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Returns Policy</h1>
          
          {/* Main Policy Statement */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-semibold text-navy mb-4">No Returns Accepted</h2>
              <p className="text-lg text-gray-700 mb-6">
                Due to the nature of luxury perfume products and hygiene considerations, we do not accept returns on any items.
              </p>
            </div>
          </div>

          {/* Why No Returns */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">Why We Don't Accept Returns</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-gold/10 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">
                  <Shield className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-2">Hygiene and Safety</h3>
                  <p className="text-gray-600">
                    Perfumes are personal care products that come into direct contact with the skin. For health and safety reasons, we cannot accept returned fragrances.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gold/10 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">
                  <Shield className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-2">Product Integrity</h3>
                  <p className="text-gray-600">
                    We ensure that all our customers receive authentic, unopened products. Accepting returns would compromise this guarantee.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gold/10 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">
                  <Shield className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-2">Quality Assurance</h3>
                  <p className="text-gray-600">
                    Each perfume is carefully inspected before dispatch to ensure you receive a perfect product every time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What We Offer Instead */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">What We Offer Instead</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Detailed Product Information</h3>
                <p className="text-gray-600">
                  We provide comprehensive descriptions, fragrance notes, and customer reviews to help you make the right choice.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Personal Consultation</h3>
                <p className="text-gray-600">
                  Our fragrance experts are available to help you choose the perfect perfume based on your preferences.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Quality Guarantee</h3>
                <p className="text-gray-600">
                  All our products are 100% authentic and sourced directly from authorized distributors. If you receive a damaged item, please contact us immediately.
                </p>
              </div>

              <div className="bg-gold/10 rounded-lg p-4 mt-6">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gold mr-2" />
                  <span className="font-medium text-navy">Need Help?</span>
                </div>
                <p className="text-gray-600 mt-2">
                  If you have any concerns about your order or need assistance choosing a fragrance, please contact our customer service team before placing your order.
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