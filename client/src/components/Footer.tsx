export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gold/20 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-vibes text-3xl text-navy mb-4">Vel France</h3>
            <p className="text-gray-600 mb-6">
              Excellence in French perfumery since 1932
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-navy hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
              <a 
                href="#" 
                className="text-navy hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a 
                href="#" 
                className="text-navy hover:text-gold transition-colors"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a 
                href="#" 
                className="text-navy hover:text-gold transition-colors"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube text-lg"></i>
              </a>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-playfair text-lg text-navy mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-600 hover:text-gold transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-600 hover:text-gold transition-colors text-left"
                >
                  Perfumes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-600 hover:text-gold transition-colors text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-600 hover:text-gold transition-colors text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="font-playfair text-lg text-navy mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gold transition-colors">
                  Personal Consultation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gold transition-colors">
                  Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gold transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gold transition-colors">
                  Stores
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-playfair text-lg text-navy mb-4">Information</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gold transition-colors">
                  Legal Notice
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gold transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gold transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gold transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gold/20 mt-12 pt-8 text-center">
          <p className="text-gray-600">
            © {currentYear} Vel France. All rights reserved. | Created with passion in Paris
          </p>
        </div>
      </div>
    </footer>
  );
}
