import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import FloatingParticles from "@/components/FloatingParticles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

export default function Landing() {
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "Conseil personnalisé",
    message: ""
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Newsletter subscription
  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", "/api/newsletter", { email });
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Vous êtes maintenant inscrit à notre newsletter !",
      });
      setNewsletterEmail("");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    },
  });

  // Contact form submission
  const contactMutation = useMutation({
    mutationFn: async (data: typeof contactForm) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        subject: "Conseil personnalisé",
        message: ""
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      newsletterMutation.mutate(newsletterEmail);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(contactForm);
  };

  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-cream">
      <FloatingParticles />
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 parallax-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        />
        <div className="absolute inset-0 bg-navy/40" />
        <div className="absolute inset-0 lace-border" />
        
        <motion.div 
          className="relative z-10 text-center text-white px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-vibes text-6xl md:text-8xl mb-4 gold-shimmer">Bienvenue chez</h2>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-6">Vel France</h1>
          <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto">
            L'art de la parfumerie française dans toute sa splendeur
          </p>
          <Button
            className="bg-gold hover:bg-deep-gold text-navy px-8 py-4 rounded-full font-playfair font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Découvrir nos Parfums
          </Button>
          <div className="mt-8">
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-full font-playfair transition-all duration-300"
              onClick={() => window.location.href = '/api/login'}
            >
              Se connecter
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-5xl text-navy mb-4">Nos Créations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-playfair text-lg">
              Une sélection exclusive de parfums artisanaux créés avec les plus précieux ingrédients
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {productsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-cream rounded-2xl shadow-xl overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gray-300" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2" />
                    <div className="h-3 bg-gray-300 rounded mb-4 w-2/3" />
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-300 rounded w-16" />
                      <div className="h-8 bg-gray-300 rounded w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <ProductCard product={product} showAddToCart={false} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Full Product Catalog */}
      <section id="products" className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-5xl text-navy mb-4">Collection Complète</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-playfair text-lg">
              Explorez notre gamme complète de parfums d'exception
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {productsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gray-300" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2" />
                    <div className="h-3 bg-gray-300 rounded mb-4 w-2/3" />
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-300 rounded w-16" />
                      <div className="h-8 bg-gray-300 rounded w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-600 font-playfair text-lg">
                  Aucun produit disponible pour le moment
                </p>
              </div>
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (index % 8) * 0.1 }}
                >
                  <ProductCard product={product} showAddToCart={false} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-vibes text-5xl text-navy mb-6">Notre Histoire</h2>
              <h3 className="font-playfair text-2xl text-navy mb-6">L'Art de la Parfumerie Française</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Depuis 1932, Vel France perpétue la tradition de la parfumerie française d'exception. 
                Nos maîtres parfumeurs créent des compositions uniques en utilisant les ingrédients 
                les plus raffinés, récoltés aux quatre coins du monde.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Chaque parfum raconte une histoire, évoque une émotion, capture un moment d'éternité. 
                Notre savoir-faire artisanal se transmet de génération en génération, préservant 
                l'authenticité et l'excellence de la parfumerie française.
              </p>
              <div className="flex items-center space-x-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-gold">90+</div>
                  <div className="text-sm text-gray-600">Années d'Excellence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-gold">50+</div>
                  <div className="text-sm text-gray-600">Créations Uniques</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-playfair font-bold text-gold">100%</div>
                  <div className="text-sm text-gray-600">Artisanal</div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Master perfumer crafting fragrance in French atelier" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-gold text-navy p-6 rounded-2xl shadow-xl">
                <div className="font-vibes text-2xl">Fait à la main</div>
                <div className="font-playfair text-sm">Paris, France</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-5xl text-navy mb-4">Contactez-Nous</h2>
            <p className="text-gray-600 max-w-2xl mx-auto font-playfair text-lg">
              Nous serions ravis de vous accompagner dans votre quête du parfum parfait
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-navy font-playfair mb-2">Prénom</label>
                    <Input 
                      value={contactForm.firstName}
                      onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                      className="bg-white border-gold/30 focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-navy font-playfair mb-2">Nom</label>
                    <Input 
                      value={contactForm.lastName}
                      onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                      className="bg-white border-gold/30 focus:border-gold"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-navy font-playfair mb-2">Email</label>
                  <Input 
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="bg-white border-gold/30 focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-navy font-playfair mb-2">Sujet</label>
                  <Select 
                    value={contactForm.subject} 
                    onValueChange={(value) => setContactForm({...contactForm, subject: value})}
                  >
                    <SelectTrigger className="bg-white border-gold/30 focus:border-gold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conseil personnalisé">Conseil personnalisé</SelectItem>
                      <SelectItem value="Information produit">Information produit</SelectItem>
                      <SelectItem value="Service client">Service client</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-navy font-playfair mb-2">Message</label>
                  <Textarea 
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="bg-white border-gold/30 focus:border-gold resize-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-navy hover:bg-navy/90 text-white py-3 font-playfair font-semibold"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? "Envoi..." : "Envoyer le Message"}
                </Button>
              </form>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white shadow-xl p-8 mb-8">
                <h3 className="font-playfair text-2xl text-navy mb-6">Nos Coordonnées</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <i className="fas fa-map-marker-alt text-gold w-5"></i>
                    <div>
                      <div className="font-playfair text-navy">Adresse</div>
                      <div className="text-gray-600">25 Place Vendôme, 75001 Paris</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <i className="fas fa-phone text-gold w-5"></i>
                    <div>
                      <div className="font-playfair text-navy">Téléphone</div>
                      <div className="text-gray-600">+33 1 42 60 30 70</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <i className="fas fa-envelope text-gold w-5"></i>
                    <div>
                      <div className="font-playfair text-navy">Email</div>
                      <div className="text-gray-600">contact@velfrance.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <i className="fas fa-clock text-gold w-5"></i>
                    <div>
                      <div className="font-playfair text-navy">Horaires</div>
                      <div className="text-gray-600">Lun-Sam: 10h-19h</div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white shadow-xl overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.2145!2d2.3292!3d48.8674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sPlace%20Vend%C3%B4me%2C%2075001%20Paris%2C%20France!5e0!3m2!1sen!2sus!4v1234567890" 
                  width="100%" 
                  height="300" 
                  style={{border:0}} 
                  allowFullScreen 
                  loading="lazy"
                  title="Vel France Location"
                />
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-navy text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-vibes text-4xl mb-4">Rejoignez Notre Newsletter</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Découvrez en exclusivité nos nouvelles créations et bénéficiez d'offres privilégiées
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row max-w-md mx-auto gap-4">
              <Input 
                type="email" 
                placeholder="Votre adresse email" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 text-navy bg-white border-none"
                required
              />
              <Button 
                type="submit" 
                className="bg-gold hover:bg-deep-gold text-navy px-8 py-3 font-playfair font-semibold"
                disabled={newsletterMutation.isPending}
              >
                {newsletterMutation.isPending ? "..." : "S'inscrire"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
