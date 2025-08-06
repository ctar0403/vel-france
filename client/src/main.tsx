import { createRoot } from "react-dom/client";
import { preloadCriticalData } from "@/lib/batchRequests";
import { initCSSOptimizations } from "@/utils/cssOptimization";
import "./lib/i18n"; // Initialize i18n
import App from "./App";

// Defer CSS loading to prevent render blocking
const loadCSS = () => {
  import("./index.css");
};

// Initialize CSS optimizations immediately
initCSSOptimizations();

// Load CSS asynchronously after critical path
requestIdleCallback(loadCSS, { timeout: 50 });

// Preload critical data immediately to reduce network waterfall
preloadCriticalData();

createRoot(document.getElementById("root")!).render(<App />);
