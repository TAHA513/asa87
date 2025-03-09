
/**
 * وظائف مساعدة لإدارة وتطبيق إعدادات الألوان
 */

/**
 * استرجاع الألوان من التخزين المحلي
 */
export function loadThemeFromStorage() {
  const primary = localStorage.getItem("theme-primary");
  const secondary = localStorage.getItem("theme-secondary");
  const accent = localStorage.getItem("theme-accent");
  const variant = localStorage.getItem("theme-variant") || "modern";
  const appearance = localStorage.getItem("theme-appearance") || "light";
  const fontSize = localStorage.getItem("theme-fontSize") || "medium";
  
  return {
    primary,
    secondary,
    accent,
    variant,
    appearance,
    fontSize
  };
}

/**
 * تطبيق الألوان على المتصفح
 */
export function applyThemeColors(colors: {
  primary?: string;
  secondary?: string;
  accent?: string;
  appearance?: "light" | "dark" | "system";
}) {
  const { primary, secondary, accent, appearance } = colors;
  
  if (primary) {
    document.documentElement.style.setProperty("--primary-color", primary);
  }
  
  if (secondary) {
    document.documentElement.style.setProperty("--secondary-color", secondary);
  }
  
  if (accent) {
    document.documentElement.style.setProperty("--accent-color", accent);
  }
  
  if (appearance) {
    applyAppearanceMode(appearance);
  }
}

/**
 * تطبيق وضع السطوع
 */
export function applyAppearanceMode(mode: "light" | "dark" | "system") {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (mode === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(mode);
  }
}

/**
 * حفظ الإعدادات على السيرفر
 */
export async function saveThemeToServer(themeData: any) {
  try {
    const response = await fetch('/api/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(themeData),
    });
    
    if (!response.ok) {
      throw new Error('فشل في حفظ الإعدادات');
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطأ في حفظ الإعدادات:', error);
    throw error;
  }
}
