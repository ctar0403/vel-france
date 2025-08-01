import { Suspense, ComponentType } from 'react';

interface LazyWrapperProps {
  children: React.ReactNode;
}

// Optimized loading component for lazy routes
export function RouteLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pink-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
        <div className="text-navy font-roboto text-sm">Loading...</div>
      </div>
    </div>
  );
}

// Higher-order component for wrapping lazy components
export function withLazyLoading<T extends ComponentType<any>>(Component: T): ComponentType<React.ComponentProps<T>> {
  return function LazyComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<RouteLoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
}