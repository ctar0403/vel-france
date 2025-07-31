import { memo, useMemo } from 'react';
import { CriticalHeader } from '@/components/CriticalHeader';
import { Link } from 'wouter';
import { OptimizedImage } from '@/components/OptimizedImage';
import { CriticalProductCard } from '@/components/CriticalProductCard';
import { LazySection } from '@/components/LazySection';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star, Shield, Truck, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ProductGridSkeleton } from '@/components/Skeleton/ProductGridSkeleton';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  imageUrl: string;
  category: 'men' | 'women' | 'unisex';
  description?: string;
  discountPrice?: string;
}

// Memoized feature card for performance
const FeatureCard = memo(({ icon: Icon, title, description }: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
    <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-gold" />
    </div>
    <h3 className="font-semibold text-navy mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

// Hero banner optimized for critical path
const HeroBanner = memo(() => (
  <section className="relative h-[70vh] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-pastel-pink" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-navy font-playfair">
          Luxury Perfumes
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover authentic designer fragrances with fast delivery across Georgia
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/catalogue">
            <Button size="lg" className="bg-gold hover:bg-gold/90 text-white">
              Shop Now
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
));

HeroBanner.displayName = 'HeroBanner';

// Optimized product section
const ProductSection = memo(({ title, description, products, isLoading }: {
  title: string;
  description: string;
  products: Product[];
  isLoading: boolean;
}) => (
  <section className="py-16 px-4">
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-navy font-playfair mb-2">
            {title}
          </h2>
          <p className="text-gray-600">{description}</p>
        </div>
        <Link href="/catalogue">
          <Button variant="outline" className="group">
            View All
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product, index) => (
            <CriticalProductCard
              key={product.id}
              product={product}
              priority={index < 2} // First 2 products are priority
            />
          ))}
        </div>
      )}
    </div>
  </section>
));

ProductSection.displayName = 'ProductSection';

export default function Home() {
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Memoized product selections for performance
  const { mostSoldProducts, newArrivals } = useMemo(() => {
    if (!products) return { mostSoldProducts: [], newArrivals: [] };
    
    return {
      mostSoldProducts: products.slice(0, 8),
      newArrivals: products.slice(-8),
    };
  }, [products]);

  // Features data - static, can be memoized
  const features = useMemo(() => [
    {
      icon: Shield,
      title: "100% Authentic",
      description: "Only genuine designer fragrances from authorized distributors"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Free delivery across Georgia within 24 hours"
    },
    {
      icon: Heart,
      title: "Luxury Experience",
      description: "Premium packaging and personalized service"
    },
    {
      icon: Star,
      title: "Expert Curation",
      description: "Handpicked selection of the world's finest perfumes"
    }
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink">
      <CriticalHeader cartItemCount={0} />
      
      {/* Above-the-fold hero - critical for FCP */}
      <HeroBanner />

      {/* Most Sold Products - critical content */}
      <ProductSection
        title="Most Sold"
        description="Discover our bestselling fragrances"
        products={mostSoldProducts}
        isLoading={productsLoading}
      />

      {/* Lazy-loaded sections for performance */}
      <LazySection fallback={<div className="h-32 bg-white/50" />}>
        <section className="py-12 bg-white/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-navy font-playfair text-center mb-8">
              Luxury Brands We Carry
            </h2>
            <div className="flex justify-center items-center gap-8 overflow-x-auto">
              {['Chanel', 'Dior', 'Tom Ford', 'Creed', 'Armani'].map((brand) => (
                <div key={brand} className="text-xl font-semibold text-gray-700 whitespace-nowrap">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection fallback={<div className="h-96" />}>
        <ProductSection
          title="New Arrivals"
          description="Latest additions to our collection"
          products={newArrivals}
          isLoading={productsLoading}
        />
      </LazySection>

      <LazySection fallback={<div className="h-64 bg-white" />}>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-navy font-playfair text-center mb-12">
              Why Choose Vel France
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      {/* Footer lazy loaded */}
      <LazySection fallback={<div className="h-40 bg-gray-900" />}>
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <h3 className="text-xl font-bold">Vel France</h3>
            </div>
            <p className="text-gray-400 mb-4">Luxury Perfumes & Fragrances</p>
            <p className="text-sm text-gray-500">
              © 2024 Vel France. All rights reserved.
            </p>
          </div>
        </footer>
      </LazySection>
    </div>
  );
}