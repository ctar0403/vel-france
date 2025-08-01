import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Product } from "@shared/schema";
import { FileText, Building, Info, Scale } from "lucide-react";
import { useState } from "react";

export default function Terms() {
  const [isCartOpen, setIsCartOpen] = useState(false);

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
        onCartClick={() => setIsCartOpen(true)}
      />
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        isLoading={false}
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Terms & Conditions</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <div className="bg-gold/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gold" />
              </div>
              <h2 className="text-2xl font-semibold text-navy mb-4">Terms of Service</h2>
              <p className="text-gray-700">
                Welcome to Vel France. By using our website and services, you agree to comply with these terms and conditions.
              </p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              <strong>Last updated:</strong> January 2025
            </p>
          </div>

          {/* About Us */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Building className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">About Vel France</h2>
            </div>
            
            <div className="bg-gold/10 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-navy mb-4">Company Information</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Company Name:</strong> I/E PERFUMETRADE NETWORK</p>
                <p><strong>Identification Number:</strong> 39001004952</p>
                <p><strong>Address:</strong> Tbilisi, Vaja Pshavela 70g</p>
                <p><strong>Country:</strong> Georgia</p>
              </div>
            </div>

            <p className="text-gray-600">
              Vel France operates under I/E PERFUMETRADE NETWORK, a registered company specializing in luxury perfume retail. 
              We are committed to providing high-quality fragrances from the world's most prestigious brands.
            </p>
          </div>

          {/* Use of Website */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Scale className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">Use of Website</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Acceptable Use</h3>
                <p className="text-gray-600">
                  You may use our website for lawful purposes only. You agree not to use the site in any way that violates applicable laws or regulations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Account Responsibility</h3>
                <p className="text-gray-600">
                  You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Prohibited Activities</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Using the website for fraudulent purposes</li>
                  <li>Interfering with the website's operation</li>
                  <li>Violating intellectual property rights</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Orders and Payments */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">Orders and Payments</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Order Acceptance</h3>
                <p className="text-gray-600">
                  All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Pricing</h3>
                <p className="text-gray-600">
                  All prices are listed in Georgian Lari (₾) and include applicable taxes. Prices may change without notice, but confirmed orders will honor the price at the time of purchase.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Payment</h3>
                <p className="text-gray-600">
                  Payment is required at the time of order. We accept various payment methods as displayed during checkout. All transactions are processed securely.
                </p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">Product Information</h2>
            
            <div className="space-y-4">
              

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Product Descriptions</h3>
                <p className="text-gray-600">
                  While we strive for accuracy in product descriptions and images, slight variations may occur. Fragrance perception can vary between individuals.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Returns Policy</h3>
                <p className="text-gray-600">
                  Due to hygiene and safety considerations, we do not accept returns on perfume products. Please review our Returns Policy for complete details.
                </p>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">Limitation of Liability</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Service Availability</h3>
                <p className="text-gray-600">
                  While we strive to maintain uninterrupted service, we cannot guarantee that our website will be available at all times or free from technical issues.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Damages</h3>
                <p className="text-gray-600">
                  Our liability for any damages arising from your use of our website or products is limited to the amount you paid for the specific product or service.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Info className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">Contact Information</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            
            <div className="bg-gold/10 rounded-lg p-4">
              <p className="text-navy font-medium">I/E PERFUMETRADE NETWORK</p>
              <p className="text-gray-600">Operating as: Vel France</p>
              <p className="text-gray-600">ID: 39001004952</p>
              <p className="text-gray-600">Address: Tbilisi, Vaja Pshavela 70g</p>
              <p className="text-gray-600">Email: info@velfrance.ge</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}