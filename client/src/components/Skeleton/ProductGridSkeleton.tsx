import { memo } from 'react';

interface ProductGridSkeletonProps {
  count?: number;
}

const ProductCardSkeleton = memo(() => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
    {/* Image skeleton */}
    <div className="aspect-square bg-gray-200 animate-pulse" />
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
      <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse" />
      <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

const ProductGridSkeleton = memo(({ count = 8 }: ProductGridSkeletonProps) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }, (_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
));

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

export { ProductGridSkeleton, ProductCardSkeleton };