
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import { useAuth } from '../../context/use-auth';

export default function Layout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    // يمكن إعادة توجيه المستخدم إلى صفحة تسجيل الدخول هنا إذا لزم الأمر
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
