
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/use-auth';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: string[];
}

export const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // حفظ المسار الحالي للعودة إليه بعد تسجيل الدخول
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // التحقق من صلاحيات المستخدم إذا كانت مطلوبة
  if (roles && roles.length > 0 && user) {
    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
