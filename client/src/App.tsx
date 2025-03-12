
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/auth-context';
import Dashboard from './pages/dashboard';
import Products from './pages/products';
import Customers from './pages/customers';
import Sales from './pages/sales';
import Appointments from './pages/appointments';
import Reports from './pages/reports';
import Settings from './pages/settings';
import Marketing from './pages/marketing';
import Installments from './pages/installments';
import Inventory from './pages/inventory';
import Suppliers from './pages/suppliers';
import Expenses from './pages/expenses';
import NotFound from './pages/not-found';
import PrintReport from './pages/reports/print-report';
import StoreSettingsPage from './pages/store-settings';
import InvoiceView from './pages/invoice-view';
import PosPage from './pages/pos';
import SalesHistory from './pages/sales-history';
import SalesAnalytics from './pages/sales-analytics';
import ProductRecommendation from './pages/product-recommendation';
import AIAnalytics from './pages/ai-analytics';

// Added placeholder Login component
const LoginPage = () => <div>Login Page</div>;

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/installments" element={<Installments />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports/print" element={<PrintReport />} />
              <Route path="/store-settings" element={<StoreSettingsPage />} />
              <Route path="/invoice/:id" element={<InvoiceView />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/sales-history" element={<SalesHistory />} />
              <Route path="/sales-analytics" element={<SalesAnalytics />} />
              <Route path="/product-recommendation" element={<ProductRecommendation />} />
              <Route path="/ai-analytics" element={<AIAnalytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
