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
                Due to the nature of perfume products and hygiene considerations, we do not accept returns on any items.
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
                    We ensure that all our customers receive unopened products. Accepting returns would compromise this guarantee.
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

          
        </div>
      </div>
      
      <Footer />
    </div>
  );
}