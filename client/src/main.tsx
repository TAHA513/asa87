
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";

// Import Arabic fonts
import "@fontsource/noto-kufi-arabic/400.css";
import "@fontsource/noto-kufi-arabic/700.css";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/700.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/700.css";

import "./index.css";
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-800 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ في تحميل التطبيق</h2>
        <div className="bg-red-50 p-3 rounded mb-4">
          <p className="text-sm font-mono text-red-800">{error.message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded"
        >
          إعادة تحميل التطبيق
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
