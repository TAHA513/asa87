import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/hooks/useAppTheme";

// Import existing components
import Dashboard from "@/pages/dashboard";
import { Layout } from "@/components/layout/layout";
import Login from "@/pages/auth-page";
import Products from "@/pages/products";
import Sales from "@/pages/sales";
import Inventory from "@/pages/inventory";
import Customers from "@/pages/customers";
import Appointments from "@/pages/appointments";
import Expenses from "@/pages/expenses";
import Suppliers from "@/pages/suppliers";
import Invoices from "@/pages/invoices";
import Reports from "@/pages/reports";
import Marketing from "@/pages/marketing";
import Settings from "@/pages/settings";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="sales" element={<Sales />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customers" element={<Customers />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="reports" element={<Reports />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;