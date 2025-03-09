
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, Switch } from "wouter";
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <DashboardLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/login" component={Login} />
              <Route path="/products" component={ProductManager} />
              <Route path="/sales" component={SalesManager} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/customers" component={CustomerManager} />
              <Route path="/appointments" component={AppointmentManager} />
              <Route path="/expenses" component={ExpenseManager} />
              <Route path="/suppliers" component={SupplierManager} />
              <Route path="/invoices" component={InvoiceManager} />
              <Route path="/reports" component={ReportManager} />
              <Route path="/marketing" component={MarketingManager} />
              <Route path="/campaigns" component={CampaignManager} />
              <Route path="/social" component={SocialManager} />
              <Route path="/analytics" component={SocialAnalytics} />
              <Route path="/settings" component={AppSettings} />
            </Switch>
          </DashboardLayout>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
