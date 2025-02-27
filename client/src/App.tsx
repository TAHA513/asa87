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
import Invoices from "@/pages/invoices";
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
import AssistantPage from "@/pages/assistant"; // Added import for AssistantPage


function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/sales" component={Sales} />
      <ProtectedRoute path="/invoices" component={Invoices} />
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
      <ProtectedRoute path="/assistant" component={AssistantPage} /> {/* Added route for assistant page */}
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