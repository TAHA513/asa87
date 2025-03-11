// The changes were incomplete, assuming a React app using react-router-dom.  Additional imports and route configuration are added based on best guess.

import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Added import for routing
import Inventory from './pages/inventory';
import Reports from './pages/reports';
import Settings from './pages/settings';
import PosPage from './pages/pos';
import SalesHistory from './pages/sales-history';
import SalesAnalytics from './pages/sales-analytics'; // Added import for SalesAnalytics

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

createRoot(document.getElementById("root")!).render(
  <Router> {/* Wrapped App component with Router */}
    <Routes>
      <Route path="/" element={<App />} /> {/* Assuming App is the main route */}
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/pos" element={<PosPage />} />
      <Route path="/sales-history" element={<SalesHistory />} />
      <Route path="/sales-analytics" element={<SalesAnalytics />} /> {/* Added route for SalesAnalytics */}
    </Routes>
  </Router>
);