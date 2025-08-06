import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Product } from "@shared/schema";
import { FileText, Building, Info, Scale } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageTitle";

export default function Terms() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { t } = useTranslation();
  
  // Set page title and meta tags
  usePageMeta('terms', 'terms');

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
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">{t('terms.title', 'Terms & Conditions')}</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <div className="bg-gold/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gold" />
              </div>
              <h2 className="text-2xl font-semibold text-navy mb-4">{t('terms.termsOfService', 'Terms of Service')}</h2>
              <p className="text-gray-700">
                {t('terms.termsDesc', 'Welcome to Vel France. By using our website and services, you agree to comply with these terms and conditions.')}
              </p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              <strong>{t('privacy.lastUpdated', 'Last updated:')}:</strong> January 2025
            </p>
          </div>

          {/* About Us */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Building className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">{t('terms.aboutVelFrance', 'About Vel France')}</h2>
            </div>
            
            <div className="bg-gold/10 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-navy mb-4">{t('terms.companyInformation', 'Company Information')}</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>{t('terms.companyName', 'Company Name:')}:</strong> I/E PERFUMETRADE NETWORK</p>
                <p><strong>{t('terms.identificationNumber', 'Identification Number:')}:</strong> 39001004952</p>
                <p><strong>{t('terms.address', 'Address:')}:</strong> Tbilisi, Vaja Pshavela 70g</p>
                <p><strong>{t('terms.country', 'Country:')}:</strong> Georgia</p>
              </div>
            </div>

            <p className="text-gray-600">
              {t('terms.companyDesc', 'Vel France operates under I/E PERFUMETRADE NETWORK, a registered company specializing in luxury perfume retail. We are committed to providing high-quality fragrances from the world\'s most prestigious brands.')}
            </p>
          </div>

          {/* Use of Website */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Scale className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">{t('terms.useOfWebsite', 'Use of Website')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.acceptableUse', 'Acceptable Use')}</h3>
                <p className="text-gray-600">
                  {t('terms.acceptableUseDesc', 'You may use our website for lawful purposes only. You agree not to use the site in any way that violates applicable laws or regulations.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.accountResponsibility', 'Account Responsibility')}</h3>
                <p className="text-gray-600">
                  {t('terms.accountResponsibilityDesc', 'You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.prohibitedActivities', 'Prohibited Activities')}</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>{t('terms.prohibitedList1', 'Attempting to gain unauthorized access to our systems')}</li>
                  <li>{t('terms.prohibitedList2', 'Using the website for fraudulent purposes')}</li>
                  <li>{t('terms.prohibitedList3', 'Interfering with the website\'s operation')}</li>
                  <li>{t('terms.prohibitedList4', 'Violating intellectual property rights')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Orders and Payments */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">{t('terms.ordersAndPayments', 'Orders and Payments')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.orderAcceptance', 'Order Acceptance')}</h3>
                <p className="text-gray-600">
                  {t('terms.orderAcceptanceDesc', 'All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at our discretion.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.pricing', 'Pricing')}</h3>
                <p className="text-gray-600">
                  {t('terms.pricingDesc', 'All prices are listed in Georgian Lari (₾) and include applicable taxes. Prices may change without notice, but confirmed orders will honor the price at the time of purchase.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.payment', 'Payment')}</h3>
                <p className="text-gray-600">
                  {t('terms.paymentDesc', 'Payment is required at the time of order. We accept various payment methods as displayed during checkout. All transactions are processed securely.')}
                </p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">{t('terms.productInformation', 'Product Information')}</h2>
            
            <div className="space-y-4">
              

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.productDescriptions', 'Product Descriptions')}</h3>
                <p className="text-gray-600">
                  {t('terms.productDescriptionsDesc', 'While we strive for accuracy in product descriptions and images, slight variations may occur. Fragrance perception can vary between individuals.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.returnsPolicy', 'Returns Policy')}</h3>
                <p className="text-gray-600">
                  {t('terms.returnsPolicyDesc', 'Due to hygiene and safety considerations, we do not accept returns on perfume products. Please review our Returns Policy for complete details.')}
                </p>
              </div>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">{t('terms.limitationOfLiability', 'Limitation of Liability')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.serviceAvailability', 'Service Availability')}</h3>
                <p className="text-gray-600">
                  {t('terms.serviceAvailabilityDesc', 'While we strive to maintain uninterrupted service, we cannot guarantee that our website will be available at all times or free from technical issues.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('terms.damages', 'Damages')}</h3>
                <p className="text-gray-600">
                  {t('terms.damagesDesc', 'Our liability for any damages arising from your use of our website or products is limited to the amount you paid for the specific product or service.')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Info className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">{t('terms.contactInformation', 'Contact Information')}</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              {t('terms.contactDesc', 'If you have any questions about these Terms & Conditions, please contact us:')}
            </p>
            
            <div className="bg-gold/10 rounded-lg p-4">
              <p className="text-navy font-medium">I/E PERFUMETRADE NETWORK</p>
              <p className="text-gray-600">{t('terms.operatingAs', 'Operating as:')}: Vel France</p>
              <p className="text-gray-600">ID: 39001004952</p>
              <p className="text-gray-600">{t('terms.address', 'Address:')}: Tbilisi, Vaja Pshavela 70g</p>
              <p className="text-gray-600">{t('terms.email', 'Email:')}: info@velfrance.ge</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}