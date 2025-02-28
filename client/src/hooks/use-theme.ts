import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'focus';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // استرجاع التفضيل المحفوظ
    let savedTheme: Theme = 'light';
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme && ['light', 'dark', 'focus'].includes(storedTheme)) {
        savedTheme = storedTheme as Theme;
      }
    } catch (e) {
      console.error('Error reading theme from localStorage:', e);
    }

    // إذا لم يكن هناك تفضيل محفوظ، نتحقق من تفضيلات النظام
    if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      savedTheme = 'dark';
    }

    return savedTheme;
  });

  useEffect(() => {
    try {
      // حفظ التفضيل
      localStorage.setItem('theme', theme);

      // تطبيق السمة
      document.documentElement.classList.remove('light', 'dark', 'focus');
      document.documentElement.classList.add(theme);
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
  }, [theme]);

  return { theme, setTheme };
}