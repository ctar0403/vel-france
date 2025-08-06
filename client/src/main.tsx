import { createRoot } from "react-dom/client";
import { preloadCriticalData } from "@/lib/batchRequests";
import { initCSSOptimizations } from "@/utils/cssOptimization";
import "./lib/i18n"; // Initialize i18n
import App from "./App";
import "./index.css";

// Initialize CSS optimizations immediately
initCSSOptimizations();

// Preload critical data immediately to reduce network waterfall
preloadCriticalData();

createRoot(document.getElementById("root")!).render(<App />);
