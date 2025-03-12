// The changes were incomplete, assuming a React app using react-router-dom.  Additional imports and route configuration are added based on best guess.

import { createRoot } from "react-dom/client";
import App from "./App";
// Removed Router imports as they're now in App.tsx
// Import Arabic fonts
import "@fontsource/noto-kufi-arabic/400.css";
import "@fontsource/noto-kufi-arabic/700.css";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/700.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/700.css";

import "./index.css";
import "./components/ai/product-recommendations";

createRoot(document.getElementById("root")!).render(<App />);