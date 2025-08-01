import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Render the app immediately without preloading to fix the infinite loop
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize optimizations after the app is fully loaded
setTimeout(() => {
  // Only initialize chunk preloading, skip the problematic batch requests
  import("@/lib/chunkOptimization").then(({ initializeChunkPreloading }) => {
    initializeChunkPreloading();
  });
}, 1000);
