import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import InvoicesPage from "@/pages/InvoicesPage";
import InvoiceDetailsPage from "@/pages/InvoiceDetailsPage";
import Staff from "@/pages/staff";
import Settings from "@/pages/settings";
import Installments from "@/pages/installments";
import Marketing from "@/pages/marketing";
import Reports from "@/pages/reports";
import Expenses from "@/pages/expenses";
import Suppliers from "@/pages/suppliers";
import Barcodes from "@/pages/barcodes";
import DiscountCodes from "@/pages/discount-codes";
import Customers from "@/pages/customers";
import Appointments from "@/pages/appointments";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/sales" component={Sales} />
      <ProtectedRoute path="/invoices" component={InvoicesPage} />
      <ProtectedRoute path="/invoices/:id" component={InvoiceDetailsPage} />
      <ProtectedRoute path="/staff" component={Staff} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/installments" component={Installments} />
      <ProtectedRoute path="/marketing" component={Marketing} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/expenses" component={Expenses} />
      <ProtectedRoute path="/suppliers" component={Suppliers} />
      <ProtectedRoute path="/barcodes" component={Barcodes} />
      <ProtectedRoute path="/discount-codes" component={DiscountCodes} />
      <ProtectedRoute path="/customers" component={Customers} />
      <ProtectedRoute path="/appointments" component={Appointments} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";

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
import "./styles/theme-variables.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
