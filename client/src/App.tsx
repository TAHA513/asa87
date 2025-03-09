import React from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-provider";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import Dashboard from "@/components/dashboard";
import "./styles/theme-variables.css";

// إعداد مكتبة استعلامات API إذا لم تكن موجودة
const defaultQueryClient = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient || defaultQueryClient}>
      <ThemeProvider>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}