import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readdirSync, statSync } from "fs";
import { cartographer } from "@replit/vite-plugin-cartographer";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";
import BundleAnalyzerPlugin from "vite-bundle-analyzer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Automatically generate aliases for attached assets
const assetsDir = resolve(__dirname, "attached_assets");
const assetAliases: Record<string, string> = {};

try {
  const files = readdirSync(assetsDir);
  files.forEach((file) => {
    const filePath = resolve(assetsDir, file);
    if (statSync(filePath).isFile()) {
      // Create alias without extension for cleaner imports
      const aliasName = file.replace(/\.[^/.]+$/, "");
      assetAliases[`@assets/${aliasName}`] = filePath;
      // Also create alias with extension
      assetAliases[`@assets/${file}`] = filePath;
    }
  });
} catch (error) {
  console.warn("Warning: Could not read attached_assets directory:", error);
}

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" ? [cartographer()] : []),
    runtimeErrorModal(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
      },
      manifest: {
        name: "Vel France - Luxury Perfumes",
        short_name: "Vel France",
        description: "Premium luxury perfume e-commerce platform",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    process.env.ANALYZE &&
      BundleAnalyzerPlugin({
        analyzerMode: "server",
        openAnalyzer: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@lib": resolve(__dirname, "./src/lib"),
      "@components": resolve(__dirname, "./src/components"),
      "@shared": resolve(__dirname, "./shared"),
      ...assetAliases,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          utils: ["clsx", "tailwind-merge"],
        },
      },
    },
    target: "esnext",
  },
  server: {
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query"],
  },
  define: {
    // Performance monitoring in development
    __DEV_PERFORMANCE__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
