
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
};

export type ThemeSettings = {
  themeName: string;
  fontName: string;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  appearance: 'light' | 'dark' | 'system';
  colors: ThemeColors;
};

interface ThemeState {
  theme: ThemeSettings;
  initialized: boolean;
  setTheme: (theme: Partial<ThemeSettings>) => void;
  setColors: (colors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
  saveThemeToServer: () => Promise<void>;
}

// الألوان الافتراضية
const DEFAULT_COLORS: ThemeColors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#FF5722',
  background: '#FFFFFF',
  text: '#333333',
  border: '#DDDDDD'
};

// إعدادات الثيم الافتراضية
const DEFAULT_THEME: ThemeSettings = {
  themeName: 'default',
  fontName: 'Cairo',
  fontSize: 'medium',
  appearance: 'light',
  colors: DEFAULT_COLORS
};

// إنشاء متجر الحالة باستخدام zustand مع دعم الحفظ التلقائي
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      initialized: false,
      setTheme: (updates) => set((state) => ({
        theme: { ...state.theme, ...updates }
      })),
      setColors: (colorUpdates) => set((state) => ({
        theme: {
          ...state.theme,
          colors: { ...state.theme.colors, ...colorUpdates }
        }
      })),
      resetTheme: () => set({ theme: DEFAULT_THEME }),
      saveThemeToServer: async () => {
        try {
          const { theme } = get();
          const userId = localStorage.getItem('userId') || '1'; // استخدم معرف المستخدم من التخزين المحلي
          
          const response = await fetch('/api/settings/theme', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: parseInt(userId),
              themeName: theme.themeName,
              fontName: theme.fontName,
              fontSize: theme.fontSize,
              appearance: theme.appearance,
              colors: theme.colors
            }),
          });
          
          if (!response.ok) {
            throw new Error('فشل في حفظ الثيم على الخادم');
          }
          
          return await response.json();
        } catch (error) {
          console.error('خطأ في حفظ الثيم:', error);
          throw error;
        }
      }
    }),
    {
      name: 'app-theme-storage', // اسم مفتاح التخزين المحلي
      partialize: (state) => ({ theme: state.theme }), // حفظ جزء الثيم فقط
    }
  )
);

// دالة لتطبيق CSS variables على المستند
export const applyThemeToDocument = (theme: ThemeSettings) => {
  const root = document.documentElement;
  
  // ضبط متغيرات الألوان CSS
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // ضبط متغيرات الخط
  root.style.setProperty('--font-family', theme.fontName);
  
  // ضبط حجم الخط
  const fontSizeMap = {
    small: '0.875rem',
    medium: '1rem',
    large: '1.125rem',
    xlarge: '1.25rem'
  };
  root.style.setProperty('--font-size-base', fontSizeMap[theme.fontSize]);
  
  // تغيير وضع الظلام/الفاتح
  if (theme.appearance === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
};

// Hook لاستخدام نظام الثيمات
export const useTheme = () => {
  const { theme, setTheme, setColors, resetTheme, saveThemeToServer } = useThemeStore();
  
  // تطبيق الثيم على المستند عند استخدام هذا الـ hook
  React.useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);
  
  return {
    theme,
    setTheme,
    setColors,
    resetTheme,
    saveThemeToServer
  };
};

// دالة لجلب إعدادات الثيم من السيرفر
export const fetchThemeFromServer = async (userId: number) => {
  try {
    const response = await fetch(`/api/settings/theme?userId=${userId}`);
    if (!response.ok) {
      throw new Error('فشل في جلب إعدادات الثيم');
    }
    const data = await response.json();
    
    if (data && data.themeName) {
      useThemeStore.getState().setTheme(data);
      applyThemeToDocument(data);
    }
    
    return data;
  } catch (error) {
    console.error('خطأ في جلب إعدادات الثيم:', error);
    return null;
  }
};
