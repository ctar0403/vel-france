import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import footerLogoImage from "@assets/Your paragraph text (5)_1753895494203.webp";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gold/20 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/">
              <img 
                src={footerLogoImage}
                alt={t('Footer.velfrancelogo', 'Vel France Logo')}
                className="h-16 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            
            <div className="flex space-x-3 mt-4">
              <a 
                href="https://www.facebook.com/velfrance" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label={t('contact.facebook', 'Facebook')}
                data-testid="footer-facebook-link"
              >
                <FaFacebookF className="text-sm" />
              </a>
              <a 
                href="https://www.instagram.com/velfrance.ge/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gradient-to-r from-[#E4405F] via-[#F77737] to-[#FCAF45] hover:from-[#D63384] hover:via-[#FD7E14] hover:to-[#FFC107] text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label={t('contact.instagram', 'Instagram')}
                data-testid="footer-instagram-link"
              >
                <FaInstagram className="text-sm" />
              </a>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-roboto text-lg text-navy mb-4">{t('Footer.navigation', 'Navigation')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-gray-600 hover:text-gold transition-colors cursor-pointer">
                    {t('Footer.home', 'Home')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/catalogue">
                  <span className="text-gray-600 hover:text-gold transition-colors cursor-pointer">
                    {t('Footer.catalogue', 'Catalogue')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-gray-600 hover:text-gold transition-colors cursor-pointer">
                    {t('Footer.contact', 'Contact')}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="font-roboto text-lg text-navy mb-4">{t('Footer.services', 'Services')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/delivery">
                  <span className="text-gray-600 hover:text-gold transition-colors cursor-pointer">
                    {t('Footer.delivery', 'Delivery')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/returns">
                  <span className="text-gray-600 hover:text-gold transition-colors cursor-pointer">
                    {t('Footer.returns', 'Returns')}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-roboto text-lg text-navy mb-4">{t('Footer.information', 'Information')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy">
                  <span className="text-gray-600 hover:text-gold transition-colors cursor-pointer">
                    {t('Footer.privacypolicy', 'Privacy Policy')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span className="text-gray-600 hover:text-gold transition-colors cursor-pointer">
                    {t('Footer.termsconditions', 'Terms & Conditions')}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gold/20 mt-12 pt-8 text-center">
          <p className="text-gray-600">
            © {currentYear} Vel France. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
