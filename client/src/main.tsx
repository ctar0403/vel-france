import { createRoot } from "react-dom/client";
import { preloadCriticalData } from "@/lib/batchRequests";
import { setupPerformanceMonitoring } from "./performance";
import "./lib/i18n"; // Initialize i18n
import App from "./App";
import "./index.css";

// Setup performance monitoring for optimization
setupPerformanceMonitoring();

// Preload critical data immediately to reduce network waterfall
preloadCriticalData();

createRoot(document.getElementById("root")!).render(<App />);
