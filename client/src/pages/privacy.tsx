import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Product } from "@shared/schema";
import { Shield, Eye, Lock, Database } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">Privacy Policy</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <div className="bg-gold/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-gold" />
              </div>
              <h2 className="text-2xl font-semibold text-navy mb-4">Your Privacy Matters</h2>
              <p className="text-gray-700">
                At Vel France, we are committed to protecting your personal information and respecting your privacy rights. This policy explains how we collect, use, and protect your data.
              </p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              <strong>Last updated:</strong> January 2025
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Database className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">Information We Collect</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Delivery and billing addresses</li>
                  <li>Order history and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Referral source</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Eye className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">How We Use Your Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Order Processing</h3>
                <p className="text-gray-600">
                  We use your personal information to process orders, arrange delivery, and provide customer support.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Communication</h3>
                <p className="text-gray-600">
                  We may contact you about your orders, account updates, and promotional offers (with your consent).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Website Improvement</h3>
                <p className="text-gray-600">
                  We analyze website usage to improve our services and user experience.
                </p>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Lock className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">Data Protection</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Security Measures</h3>
                <p className="text-gray-600">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Data Retention</h3>
                <p className="text-gray-600">
                  We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy or as required by law.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Third-Party Services</h3>
                <p className="text-gray-600">
                  We may use trusted third-party services for payment processing and delivery. These partners are required to maintain the confidentiality of your information.
                </p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">Your Rights</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Access and Correction</h3>
                <p className="text-gray-600">
                  You have the right to access and update your personal information at any time through your account settings.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Marketing Communications</h3>
                <p className="text-gray-600">
                  You can opt out of promotional emails at any time by clicking the unsubscribe link in our emails or contacting us directly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">Data Deletion</h3>
                <p className="text-gray-600">
                  You may request deletion of your personal information, subject to legal and operational requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-navy mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or how we handle your personal information, please contact us
            </p>
            
            
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}