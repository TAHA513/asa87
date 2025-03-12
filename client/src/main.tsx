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
import ProductRecommendation from './pages/product-recommendation'; //Added for product recommendation
import AIAnalytics from './pages/ai-analytics'; // Added import for AIAnalytics
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

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './context/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light"> {/* Added ThemeProvider */}
            <Routes>
              <Route path="/" element={<App />} /> {/* Assuming App is the main route */}
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/sales-history" element={<SalesHistory />} />
              <Route path="/sales-analytics" element={<SalesAnalytics />} /> {/* Added route for SalesAnalytics */}
              <Route path="/product-recommendation" element={<ProductRecommendation />} /> {/* Added route for product recommendation */}
              <Route path="/ai-analytics" element={<AIAnalytics />} /> {/* Added route for AIAnalytics */}
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Placeholder components -  These need to be implemented based on your specific requirements.
function SalesAnalyticsPlaceholder() {
  return (
    <div>
      <h1>Sales Analytics</h1>
      <p>Analytics Dashboard Coming Soon</p>
    </div>
  );
}

function ProductRecommendationPlaceholder() {
  return (
    <div>
      <h1>Product Recommendations</h1>
      <p>Recommendations Coming Soon</p>
    </div>
  );
}

function AIAnalyticsPlaceholder() {
  return (
    <div>
      <h1>AI Analytics</h1>
      <p>Coming soon...</p>
    </div>
  );
}