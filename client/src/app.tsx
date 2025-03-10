
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="max-w-md p-6 rounded-lg shadow-lg bg-card text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">حدث خطأ</h2>
        <div className="bg-muted p-3 rounded mb-4 text-right">
          <p className="text-sm font-mono">{error.message}</p>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // اختبار اتصال بسيط للتأكد من أن الخادم متصل
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          console.log('تم الاتصال بالخادم بنجاح');
        } else {
          setConnectionError(`فشل الاتصال: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('خطأ في الاتصال:', error);
        setConnectionError(error instanceof Error ? error.message : 'فشل الاتصال بالخادم');
      } finally {
        // حتى مع وجود خطأ، نقوم بتحميل التطبيق بعد 2 ثانية
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <h1 className="text-xl font-semibold">جاري تحميل النظام...</h1>
        {connectionError && (
          <div className="mt-4 p-3 rounded bg-destructive/10 text-destructive max-w-md">
            <p>{connectionError}</p>
            <p className="text-sm mt-2">حاول تحديث الصفحة أو الاتصال بالدعم الفني</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
