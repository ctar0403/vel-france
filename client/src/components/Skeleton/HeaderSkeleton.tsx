import { memo } from 'react';

const HeaderSkeleton = memo(() => (
  <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
    <div className="container mx-auto px-4 h-20 flex items-center justify-between">
      {/* Logo skeleton */}
      <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
      
      {/* Navigation skeleton */}
      <nav className="hidden md:flex items-center space-x-8">
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-18 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-14 h-4 bg-gray-200 rounded animate-pulse" />
      </nav>
      
      {/* Actions skeleton */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </header>
));

HeaderSkeleton.displayName = 'HeaderSkeleton';

export { HeaderSkeleton };