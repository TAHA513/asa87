
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  ThemeSettings, 
  defaultTheme, 
  loadTheme, 
  saveSettings, 
  applyTheme 
} from './theme-service';

// إنشاء سياق السمات
interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => Promise<void>;
  setTheme: (newTheme: ThemeSettings) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: async () => {},
  setTheme: async () => {},
  isLoading: true
});

// مزود السمات
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل السمات عند بدء التشغيل
  useEffect(() => {
    const initTheme = async () => {
      try {
        setIsLoading(true);
        const loadedTheme = await loadTheme();
        setThemeState(loadedTheme);
        applyTheme(loadedTheme);
      } catch (error) {
        console.error('فشل في تحميل السمات:', error);
        // في حالة الفشل، استخدم الإعدادات الافتراضية
        applyTheme(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    initTheme();
  }, []);

  // تحديث جزء من السمات
  const updateTheme = async (newThemeProps: Partial<ThemeSettings>) => {
    try {
      const updatedTheme = { ...theme, ...newThemeProps };
      await saveSettings(updatedTheme);
      setThemeState(updatedTheme);
    } catch (error) {
      console.error('فشل في تحديث السمات:', error);
    }
  };

  // تعيين السمات بالكامل
  const setTheme = async (newTheme: ThemeSettings) => {
    try {
      await saveSettings(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('فشل في تعيين السمات:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

// خطاف (Hook) لاستخدام السمات
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
