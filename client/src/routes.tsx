
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// مكون التحميل
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// تحميل المكونات بشكل كسول (lazy)
const Dashboard = lazy(() => import('./pages/dashboard'));
const Inventory = lazy(() => import('./pages/inventory'));
const Barcodes = lazy(() => import('./pages/barcodes'));
const NotFound = lazy(() => import('./pages/not-found'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/barcodes" element={<Barcodes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
