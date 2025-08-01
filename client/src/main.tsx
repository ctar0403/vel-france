import { createRoot } from "react-dom/client";
import { preloadCriticalData } from "@/lib/batchRequests";
import App from "./App";
import "./index.css";

// Preload critical data immediately to reduce network waterfall
preloadCriticalData();

createRoot(document.getElementById("root")!).render(<App />);
