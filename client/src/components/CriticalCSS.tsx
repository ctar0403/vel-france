// Critical CSS component to prevent layout shift
export const CriticalCSS = () => (
  <style>
    {`
      /* Critical above-the-fold styles */
      .hero-banner {
        width: 100%;
        height: 400px;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      }
      
      .product-card {
        width: 100%;
        height: 350px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      .product-image {
        width: 100%;
        height: 250px;
        background: #f7fafc;
        border-radius: 12px 12px 0 0;
      }
      
      .loading-placeholder {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Prevent layout shift */
      .swiper-container {
        height: auto;
        min-height: 400px;
      }
      
      .brand-logos {
        height: 80px;
        overflow: hidden;
      }
    `}
  </style>
);