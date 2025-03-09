
import { createContext, useContext, useEffect, useState } from "react";
import { initializeTheme, ThemeSettings, DEFAULT_THEME, applyTheme, storeTheme, saveThemeToServer } from "./theme-service";

// إنشاء سياق السمات
interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (theme: ThemeSettings) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  isLoading: true,
});

// مكون مزود السمات
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSettings>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  // تهيئة السمات عند بدء التطبيق
  useEffect(() => {
    async function setup() {
      try {
        const initialTheme = await initializeTheme();
        setThemeState(initialTheme);
      } catch (error) {
        console.error("خطأ في تهيئة السمات:", error);
      } finally {
        setIsLoading(false);
      }
    }

    setup();
  }, []);

  // تحديث السمات
  const setTheme = async (newTheme: ThemeSettings) => {
    setThemeState(newTheme);
    
    // تطبيق السمات على واجهة المستخدم
    applyTheme(newTheme);
    
    // حفظ في التخزين المحلي
    storeTheme(newTheme);
    
    // حفظ على الخادم
    try {
      await saveThemeToServer(newTheme);
    } catch (error) {
      console.error("خطأ في حفظ السمات على الخادم:", error);
    }
  };

  // القيمة المزودة للسياق
  const contextValue = {
    theme,
    setTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// خطاف (hook) لاستخدام السمات
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("يجب استخدام useTheme داخل ThemeProvider");
  }
  return context;
}
