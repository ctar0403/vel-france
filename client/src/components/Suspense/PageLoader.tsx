import { memo } from 'react';

const PageLoader = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-cream via-white to-pastel-pink flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gold/20 to-navy/10 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
      <p className="font-roboto text-lg text-navy/70 tracking-wide">Loading...</p>
    </div>
  </div>
));

PageLoader.displayName = 'PageLoader';

export { PageLoader };