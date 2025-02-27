import React, { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/auth";
import AuthPage from "./pages/auth";
import Dashboard from "./pages/dashboard";
import Inventory from "./pages/inventory";
import Sales from "./pages/sales";
import Invoices from "./pages/invoices";
import Barcodes from "./pages/barcodes";
import DiscountCodes from "./pages/discount-codes";
import Customers from "./pages/customers";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./components/protected-route";

function Router() {
  return (
    <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/inventory" component={Inventory} />
        <ProtectedRoute path="/sales" component={Sales} />
        <ProtectedRoute path="/invoices" component={Invoices} />
        <ProtectedRoute path="/barcodes" component={Barcodes} />
        <ProtectedRoute path="/discount-codes" component={DiscountCodes} />
        <ProtectedRoute path="/customers" component={Customers} />
        <ProtectedRoute path="/chat" component={React.lazy(() => import("./pages/chat"))} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;