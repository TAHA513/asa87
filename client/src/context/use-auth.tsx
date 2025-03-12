
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn("⚠️ تحذير: تم استدعاء useAuth خارج AuthProvider! تأكد من تضمين AuthProvider.");
    // إرجاع كائن فارغ بدلاً من رمي خطأ لتجنب تعطل التطبيق بالكامل
    return {
      user: null,
      login: () => Promise.resolve(false),
      logout: () => Promise.resolve(),
      isAuthenticated: false,
      isLoading: false
    };
  }
  return context;
};
