import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from 'react-router-dom'; 
import Inventory from './pages/inventory';
import Reports from './pages/reports';
import Settings from './pages/settings';
import PosPage from './pages/pos';
import SalesHistory from './pages/sales-history';
import SalesAnalytics from './pages/sales-analytics';
import ProductRecommendation from './pages/product-recommendation';
import AIAnalytics from './pages/ai-analytics';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from './context/theme-provider';


const queryClient = new QueryClient();

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light">
            <App />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  </React.StrictMode>
);