import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { useQuery } from "@tanstack/react-query";
import type { CartItem, Product } from "@shared/schema";
import { Shield, Eye, Lock, Database } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Privacy() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { t } = useTranslation();
  
  // Set page title
  usePageTitle('privacy');

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
          <h1 className="text-4xl font-bold text-navy mb-8 text-center">{t('privacy.title', 'Privacy Policy')}</h1>
          
          {/* Introduction */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <div className="bg-gold/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-gold" />
              </div>
              <h2 className="text-2xl font-semibold text-navy mb-4">{t('privacy.yourPrivacyMatters', 'Your Privacy Matters')}</h2>
              <p className="text-gray-700">
                {t('privacy.privacyDesc', 'At Vel France, we are committed to protecting your personal information and respecting your privacy rights. This policy explains how we collect, use, and protect your data.')}
              </p>
            </div>
            <p className="text-sm text-gray-600 text-center">
              <strong>{t('privacy.lastUpdated', 'Last updated:')}:</strong> January 2025
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Database className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">{t('privacy.informationWeCollect', 'Information We Collect')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.personalInformation', 'Personal Information')}</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>{t('privacy.personalInfoList1', 'Name, email address, and phone number')}</li>
                  <li>{t('privacy.personalInfoList2', 'Delivery and billing addresses')}</li>
                  <li>{t('privacy.personalInfoList3', 'Order history and preferences')}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.automaticallyCollected', 'Automatically Collected Information')}</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>{t('privacy.autoInfoList1', 'IP address and device information')}</li>
                  <li>{t('privacy.autoInfoList2', 'Browser type and version')}</li>
                  <li>{t('privacy.autoInfoList3', 'Pages visited and time spent on our website')}</li>
                  <li>{t('privacy.autoInfoList4', 'Referral source')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Eye className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">{t('privacy.howWeUseInfo', 'How We Use Your Information')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.orderProcessing', 'Order Processing')}</h3>
                <p className="text-gray-600">
                  {t('privacy.orderProcessingDesc', 'We use your personal information to process orders, arrange delivery, and provide customer support.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.communication', 'Communication')}</h3>
                <p className="text-gray-600">
                  {t('privacy.communicationDesc', 'We may contact you about your orders, account updates, and promotional offers (with your consent).')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.websiteImprovement', 'Website Improvement')}</h3>
                <p className="text-gray-600">
                  {t('privacy.websiteImprovementDesc', 'We analyze website usage to improve our services and user experience.')}
                </p>
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center mb-6">
              <Lock className="h-6 w-6 text-gold mr-3" />
              <h2 className="text-2xl font-semibold text-navy">{t('privacy.dataProtection', 'Data Protection')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.securityMeasures', 'Security Measures')}</h3>
                <p className="text-gray-600">
                  {t('privacy.securityMeasuresDesc', 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.dataRetention', 'Data Retention')}</h3>
                <p className="text-gray-600">
                  {t('privacy.dataRetentionDesc', 'We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy or as required by law.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.thirdPartyServices', 'Third-Party Services')}</h3>
                <p className="text-gray-600">
                  {t('privacy.thirdPartyDesc', 'We may use trusted third-party services for payment processing and delivery. These partners are required to maintain the confidentiality of your information.')}
                </p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-navy mb-6">{t('privacy.yourRights', 'Your Rights')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.accessAndCorrection', 'Access and Correction')}</h3>
                <p className="text-gray-600">
                  {t('privacy.accessDesc', 'You have the right to access and update your personal information at any time through your account settings.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.marketingCommunications', 'Marketing Communications')}</h3>
                <p className="text-gray-600">
                  {t('privacy.marketingDesc', 'You can opt out of promotional emails at any time by clicking the unsubscribe link in our emails or contacting us directly.')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-navy mb-2">{t('privacy.dataDeletion', 'Data Deletion')}</h3>
                <p className="text-gray-600">
                  {t('privacy.dataDeletionDesc', 'You may request deletion of your personal information, subject to legal and operational requirements.')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-navy mb-4">{t('privacy.contactUs', 'Contact Us')}</h2>
            <p className="text-gray-600 mb-4">
              {t('privacy.contactDesc', 'If you have any questions about this Privacy Policy or how we handle your personal information, please contact us')}
            </p>
            
            
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}