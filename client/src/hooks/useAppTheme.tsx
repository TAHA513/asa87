
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useThemeStore, fetchThemeFromServer, applyThemeToDocument, ThemeSettings } from '@/lib/theme-manager';

interface ThemeContextType {
  isLoading: boolean;
  error: string | null;
  initialize: (userId: number) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isLoading: false,
  error: null,
  initialize: async () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useThemeStore();
  
  // تهيئة نظام الثيمات
  const initialize = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const serverTheme = await fetchThemeFromServer(userId);
      
      if (serverTheme) {
        // استخدام إعدادات الثيم من السيرفر
        setTheme(serverTheme);
      }
      
      // تطبيق الثيم على المستند
      applyThemeToDocument(useThemeStore.getState().theme);
    } catch (err) {
      console.error('فشل في تهيئة نظام الثيمات:', err);
      setError('حدث خطأ أثناء تحميل إعدادات المظهر');
    } finally {
      setIsLoading(false);
    }
  };
  
  // تطبيق الثيم عند أي تغيير
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ isLoading, error, initialize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
