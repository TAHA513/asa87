import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider"; // Added import

import DashboardLayout from "@/components/layouts/dashboard-layout";
import Dashboard from "@/components/dashboard";
import Login from "@/components/auth/login";
import ProductManager from "@/components/products/product-manager";
import SalesManager from "@/components/sales/sales-manager";
import Inventory from "@/components/inventory/inventory-manager";
import CustomerManager from "@/components/customers/customer-manager";
import AppointmentManager from "@/components/appointments/appointment-manager";
import ExpenseManager from "@/components/expenses/expense-manager";
import SupplierManager from "@/components/suppliers/supplier-manager";
import InvoiceManager from "@/components/invoices/invoice-manager";
import ReportManager from "@/components/reports/report-manager";
import MarketingManager from "@/components/marketing/marketing-manager";
import CampaignManager from "@/components/marketing/campaign-manager";
import SocialManager from "@/components/marketing/social-manager";
import SocialAnalytics from "@/components/marketing/social-analytics";
import AppSettings from "@/components/settings/app-settings";
import "./styles/theme-variables.css"; // Added import


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider> {/* Added ThemeProvider */}
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="sales" element={<SalesManager />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customers" element={<CustomerManager />} />
              <Route path="appointments" element={<AppointmentManager />} />
              <Route path="expenses" element={<ExpenseManager />} />
              <Route path="suppliers" element={<SupplierManager />} />
              <Route path="invoices" element={<InvoiceManager />} />
              <Route path="reports" element={<ReportManager />} />
              <Route path="marketing" element={<MarketingManager />} />
              <Route path="marketing/campaigns" element={<CampaignManager />} />
              <Route path="marketing/social" element={<SocialManager />} />
              <Route path="marketing/analytics" element={<SocialAnalytics />} />
              <Route path="settings" element={<AppSettings />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider> {/* Added closing ThemeProvider tag */}
    </QueryClientProvider>
  );
}

export default App;