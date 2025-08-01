import { createRoot } from "react-dom/client";
import { preloadCriticalData } from "@/lib/batchRequests";
import App from "./App";
import "./index.css";

// Preload critical data immediately to reduce network waterfall
preloadCriticalData();

// Initialize chunk preloading after the app is mounted to avoid hook issues
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize route-based chunk preloading after initial render
setTimeout(() => {
  import("@/lib/chunkOptimization").then(({ initializeChunkPreloading }) => {
    initializeChunkPreloading();
  });
}, 100);
