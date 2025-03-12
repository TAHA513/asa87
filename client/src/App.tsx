
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/auth-context';
import Dashboard from './pages/dashboard';
import Products from './pages/products';
import Customers from './pages/customers';
import Sales from './pages/sales';
import Appointments from './pages/appointments';
import Reports from './pages/reports';
import Settings from './pages/settings';
import Login from './pages/login';
import Marketing from './pages/marketing';
import Installments from './pages/installments';
import Inventory from './pages/inventory';
import Suppliers from './pages/suppliers';
import Expenses from './pages/expenses';
import NotFound from './pages/not-found';
import PrintReport from './pages/reports/print-report';
import StoreSettings from './pages/store-settings';
import InvoiceView from './pages/invoice-view';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/print/:type" element={<PrintReport />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/installments" element={<Installments />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/store-settings" element={<StoreSettings />} />
              <Route path="/invoices/:id" element={<InvoiceView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
