import { Link } from "wouter";
import { useTranslation } from "react-i18next";
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
            
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-navy hover:text-gold transition-colors"
                aria-label={t('Footer.facebook', 'Facebook')}
              >
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
              <a 
                href="#" 
                className="text-navy hover:text-gold transition-colors"
                aria-label={t('Footer.instagram', 'Instagram')}
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a 
                href="#" 
                className="text-navy hover:text-gold transition-colors"
                aria-label={t('Footer.twitter', 'Twitter')}
              >
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a 
                href="#" 
                className="text-navy hover:text-gold transition-colors"
                aria-label={t('Footer.youtube', 'YouTube')}
              >
                <i className="fab fa-youtube text-lg"></i>
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
