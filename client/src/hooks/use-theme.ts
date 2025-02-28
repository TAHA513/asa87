import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'focus';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // استرجاع التفضيل المحفوظ
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;

    // التحقق من تفضيلات النظام
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    // حفظ التفضيل
    localStorage.setItem('theme', theme);

    // تطبيق السمة
    document.documentElement.classList.remove('light', 'dark', 'focus');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return { theme, setTheme };
}
