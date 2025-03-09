
import axios from 'axios';

export interface ThemeSettings {
  primary: string;
  variant: 'professional' | 'vibrant' | 'tint' | 'modern' | 'classic' | 'futuristic' | 'elegant' | 'natural';
  appearance: 'light' | 'dark' | 'system';
  fontStyle: 'noto-kufi' | 'cairo' | 'tajawal';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  radius: number;
}

// القيم الافتراضية للسمات
export const defaultTheme: ThemeSettings = {
  primary: 'hsl(215.3 98.9% 27.8%)',
  variant: 'professional',
  appearance: 'light',
  fontStyle: 'noto-kufi',
  fontSize: 'medium',
  radius: 0.5
};

// حفظ الإعدادات في التخزين المحلي
export const saveThemeToLocalStorage = (theme: ThemeSettings): void => {
  try {
    localStorage.setItem('app-theme', JSON.stringify(theme));
    console.log('تم حفظ الإعدادات في التخزين المحلي:', theme);
  } catch (error) {
    console.error('خطأ في حفظ الإعدادات في التخزين المحلي:', error);
  }
};

// قراءة الإعدادات من التخزين المحلي
export const loadThemeFromLocalStorage = (): ThemeSettings | null => {
  try {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      console.log('تم جلب الإعدادات من التخزين المحلي');
      return JSON.parse(savedTheme);
    }
    return null;
  } catch (error) {
    console.error('خطأ في قراءة الإعدادات من التخزين المحلي:', error);
    return null;
  }
};

// حفظ الإعدادات في قاعدة البيانات
export const saveThemeToServer = async (theme: ThemeSettings): Promise<void> => {
  try {
    console.log('جاري حفظ الإعدادات:', theme);
    const response = await axios.post('/api/theme', theme);
    console.log('تم حفظ الإعدادات في السيرفر:', response.data);
  } catch (error) {
    console.error('خطأ في حفظ الإعدادات:', error);
    // حتى في حالة فشل الاتصال بالسيرفر، نحفظ محليًا
    saveThemeToLocalStorage(theme);
    throw error;
  }
};

// جلب الإعدادات من قاعدة البيانات
export const loadThemeFromServer = async (): Promise<ThemeSettings | null> => {
  try {
    const response = await axios.get('/api/settings');
    if (response.data) {
      // تحويل البيانات من تنسيق قاعدة البيانات إلى تنسيق السمات المستخدم
      console.log('تم جلب الإعدادات من API:', response.data);
      
      // إذا كانت الاستجابة تحتوي على تنسيق مختلف، نقوم بتحويلها
      if (response.data.themeName) {
        return {
          primary: response.data.colors?.primary || defaultTheme.primary,
          variant: response.data.themeName,
          appearance: response.data.appearance || defaultTheme.appearance,
          fontStyle: response.data.fontName || defaultTheme.fontStyle,
          fontSize: response.data.fontSize || defaultTheme.fontSize,
          radius: defaultTheme.radius
        };
      }
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('خطأ في جلب الإعدادات من السيرفر:', error);
    return null;
  }
};

// تطبيق السمة على المستند
export const applyTheme = (theme: ThemeSettings): void => {
  // تطبيق المتغيرات على العنصر الجذر
  const root = document.documentElement;
  
  // تعيين اللون الأساسي
  root.style.setProperty('--primary', theme.primary);
  
  // تعيين حالة السطوع
  if (theme.appearance === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  
  // تعيين نوع الخط
  root.style.setProperty('--font-family', getFontFamily(theme.fontStyle));
  
  // تعيين حجم الخط
  document.body.className = getFontSizeClass(theme.fontSize);
  
  // تعيين دائرية الحواف
  root.style.setProperty('--radius', `${theme.radius}rem`);
  
  // احسب وعيّن الألوان الثانوية
  const secondaryColor = theme.appearance === 'dark' 
    ? `color-mix(in srgb, ${theme.primary} 80%, white)` 
    : `color-mix(in srgb, ${theme.primary} 80%, black)`;
  
  const accentColor = theme.appearance === 'dark'
    ? `color-mix(in srgb, ${theme.primary} 60%, black)`
    : `color-mix(in srgb, ${theme.primary} 60%, white)`;
    
  root.style.setProperty('--secondary', secondaryColor);
  root.style.setProperty('--accent', accentColor);
};

// دالة مساعدة للحصول على اسم الخط
function getFontFamily(fontStyle: string): string {
  switch (fontStyle) {
    case 'noto-kufi':
      return '"Noto Kufi Arabic", sans-serif';
    case 'cairo':
      return '"Cairo", sans-serif';
    case 'tajawal':
      return '"Tajawal", sans-serif';
    default:
      return '"Noto Kufi Arabic", sans-serif';
  }
}

// دالة مساعدة للحصول على حجم الخط
function getFontSizeClass(fontSize: string): string {
  switch (fontSize) {
    case 'small':
      return 'text-sm';
    case 'medium':
      return 'text-base';
    case 'large':
      return 'text-lg';
    case 'xlarge':
      return 'text-xl';
    default:
      return 'text-base';
  }
}

// قراءة ملف theme.json مباشرة
export const loadThemeFromJsonFile = async (): Promise<ThemeSettings | null> => {
  try {
    const response = await axios.get('/theme.json');
    console.log('تم قراءة ملف theme.json:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في قراءة ملف theme.json:', error);
    return null;
  }
};

// دالة موحدة لجلب الإعدادات من جميع المصادر
export const loadTheme = async (): Promise<ThemeSettings> => {
  // محاولة جلب الإعدادات بالترتيب: ملف JSON، السيرفر، تخزين محلي، إعدادات افتراضية
  let theme: ThemeSettings | null = null;
  
  // محاولة جلب الإعدادات من ملف JSON
  theme = await loadThemeFromJsonFile();
  
  // محاولة جلب الإعدادات من السيرفر
  if (!theme) {
    theme = await loadThemeFromServer();
  }
  
  // محاولة جلب الإعدادات من التخزين المحلي
  if (!theme) {
    theme = loadThemeFromLocalStorage();
  }
  
  // استخدام الإعدادات الافتراضية إذا لم تتوفر أي إعدادات أخرى
  if (!theme) {
    theme = { ...defaultTheme };
  }
  
  // حفظ الإعدادات المسترجعة في التخزين المحلي للاستخدام المستقبلي
  saveThemeToLocalStorage(theme);
  
  return theme;
};

// دالة لحفظ الإعدادات في جميع المصادر
export const saveSettings = async (theme: ThemeSettings): Promise<void> => {
  try {
    // حفظ في التخزين المحلي
    saveThemeToLocalStorage(theme);
    
    // حفظ في السيرفر
    await saveThemeToServer(theme);
    
    // تطبيق السمات مباشرة
    applyTheme(theme);
  } catch (error) {
    console.error('خطأ في حفظ الإعدادات:', error);
    // إذا فشل الحفظ في السيرفر، نضمن على الأقل التخزين المحلي والتطبيق المباشر
    applyTheme(theme);
  }
};
