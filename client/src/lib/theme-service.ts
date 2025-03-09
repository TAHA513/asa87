
import axios from "axios";

export type ThemeSettings = {
  primary: string;
  variant: 
    | "professional"
    | "vibrant"
    | "tint"
    | "modern"
    | "classic"
    | "futuristic"
    | "elegant"
    | "natural";
  appearance: "light" | "dark" | "system";
  fontStyle: "noto-kufi" | "cairo" | "tajawal";
  fontSize: "small" | "medium" | "large" | "xlarge";
  radius: number;
};

export const DEFAULT_THEME: ThemeSettings = {
  primary: "hsl(215.3 98.9% 27.8%)",
  variant: "professional",
  appearance: "light",
  fontStyle: "noto-kufi",
  fontSize: "medium",
  radius: 0.5
};

// تعريف كل السمات المتاحة
export const THEME_VARIANTS = [
  { id: "professional", label: "مهني", color: "hsl(215.3 98.9% 27.8%)" },
  { id: "vibrant", label: "نابض بالحياة", color: "hsl(349 90.9% 45.1%)" },
  { id: "tint", label: "رمادي", color: "hsl(190 50% 65%)" },
  { id: "modern", label: "عصري", color: "hsl(271.5 91.7% 65.1%)" },
  { id: "classic", label: "كلاسيكي", color: "hsl(142.1 76.2% 36.3%)" },
  { id: "futuristic", label: "مستقبلي", color: "hsl(261 73.7% 50.7%)" },
  { id: "elegant", label: "أنيق", color: "hsl(0 0% 10%)" },
  { id: "natural", label: "طبيعي", color: "hsl(22 90% 50.5%)" },
];

// محاولة قراءة الإعدادات من localStorage
export function getStoredTheme(): ThemeSettings | null {
  try {
    const storedTheme = localStorage.getItem('theme-settings');
    if (storedTheme) {
      return JSON.parse(storedTheme) as ThemeSettings;
    }
  } catch (error) {
    console.error("خطأ في قراءة الإعدادات من التخزين المحلي:", error);
  }
  return null;
}

// حفظ الإعدادات في localStorage
export function storeTheme(settings: ThemeSettings): void {
  try {
    localStorage.setItem('theme-settings', JSON.stringify(settings));
  } catch (error) {
    console.error("خطأ في حفظ الإعدادات في التخزين المحلي:", error);
  }
}

// تطبيق الإعدادات على CSS variables
export function applyTheme(settings: ThemeSettings): void {
  const root = document.documentElement;
  
  // تطبيق اللون الرئيسي
  root.style.setProperty('--primary-color', settings.primary);
  
  // تطبيق الظهور (داكن/فاتح)
  document.body.classList.remove('dark', 'light');
  if (settings.appearance === 'dark') {
    document.body.classList.add('dark');
  } else if (settings.appearance === 'light') {
    document.body.classList.add('light');
  } else {
    // system - اعتمادًا على إعدادات النظام
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.add(prefersDark ? 'dark' : 'light');
  }
  
  // تطبيق نوع الخط
  root.style.setProperty('--font-family', getFontFamily(settings.fontStyle));
  
  // تطبيق حجم الخط
  root.setAttribute('data-font-size', settings.fontSize);
  
  // تطبيق تدوير الزوايا
  root.style.setProperty('--radius', `${settings.radius}rem`);
}

// الحصول على اسم الخط بناءً على النوع
function getFontFamily(fontStyle: string): string {
  switch (fontStyle) {
    case 'noto-kufi':
      return "'Noto Kufi Arabic', sans-serif";
    case 'cairo':
      return "'Cairo', sans-serif";
    case 'tajawal':
      return "'Tajawal', sans-serif";
    default:
      return "'Noto Kufi Arabic', sans-serif";
  }
}

// حفظ الإعدادات في قاعدة البيانات عبر API
export async function saveThemeToServer(settings: ThemeSettings): Promise<boolean> {
  try {
    const response = await axios.post('/api/theme', settings);
    console.log("تم حفظ الإعدادات بنجاح:", response.data);
    return true;
  } catch (error) {
    console.error("خطأ في حفظ الإعدادات على الخادم:", error);
    return false;
  }
}

// جلب الإعدادات من قاعدة البيانات
export async function fetchThemeFromServer(): Promise<ThemeSettings | null> {
  try {
    const response = await axios.get('/api/settings');
    if (response.data && response.data.themeName) {
      console.log("تم جلب الإعدادات من API:", response.data);
      
      // تحويل البيانات من تنسيق قاعدة البيانات إلى تنسيق السمات
      const settings: ThemeSettings = {
        primary: response.data.colors.primary,
        variant: response.data.themeName,
        appearance: response.data.appearance,
        fontStyle: response.data.fontName,
        fontSize: response.data.fontSize,
        radius: 0.5 // افتراضي إذا لم يكن موجودًا
      };
      
      return settings;
    }
  } catch (error) {
    console.error("خطأ في جلب الإعدادات من الخادم:", error);
  }
  
  // في حالة الفشل، نعود إلى الإعدادات الافتراضية
  return DEFAULT_THEME;
}

// وظيفة لتهيئة السمات عند بدء التطبيق
export async function initializeTheme(): Promise<ThemeSettings> {
  try {
    // أولاً، نحاول الحصول على الإعدادات من التخزين المحلي
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      applyTheme(storedTheme);
      return storedTheme;
    }
    
    // إذا لم تكن موجودة، نحاول جلبها من الخادم
    const serverTheme = await fetchThemeFromServer();
    if (serverTheme) {
      applyTheme(serverTheme);
      storeTheme(serverTheme);
      return serverTheme;
    }
  } catch (error) {
    console.error("خطأ في تهيئة السمات:", error);
  }
  
  // في حالة فشل كل شيء، نعود إلى الإعدادات الافتراضية
  applyTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
}
