
/**
 * وظائف مساعدة لتحويل الألوان بين تنسيقات مختلفة
 */

// تحويل قيمة HSL إلى HEX
export function hslToHex(hslString: string): string {
  try {
    // استخراج قيم H, S, L من سلسلة HSL مثل "hsl(215.3 98.9% 27.8%)"
    const regex = /hsl\(([0-9.]+)\s+([0-9.]+)%\s+([0-9.]+)%\)/;
    const match = hslString.match(regex);
    
    if (!match) {
      console.error("تنسيق HSL غير صالح:", hslString);
      return "#2563eb"; // اللون الافتراضي
    }
    
    const h = parseFloat(match[1]) / 360;
    const s = parseFloat(match[2]) / 100;
    const l = parseFloat(match[3]) / 100;
    
    // تحويل HSL إلى RGB
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // اللون رمادي
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    // تحويل قيم RGB إلى هيكساديسيمال
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (error) {
    console.error("خطأ في تحويل HSL إلى Hex:", error);
    return "#2563eb"; // اللون الافتراضي
  }
}

// تحويل قيمة HEX إلى HSL
export function hexToHsl(hex: string): string {
  try {
    // إزالة # من بداية اللون إن وجد
    hex = hex.replace('#', '');
    
    // تحويل الرمز الهيكساديسيمال إلى قيم RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // حساب القيم اللازمة لتحويل RGB إلى HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    // تحويل قيم HSL إلى تنسيق سلسلة
    h = Math.round(h * 360 * 10) / 10;
    s = Math.round(s * 100 * 10) / 10;
    l = Math.round(l * 100 * 10) / 10;
    
    return `hsl(${h} ${s}% ${l}%)`;
  } catch (error) {
    console.error("خطأ في تحويل Hex إلى HSL:", error);
    return "hsl(215.3 98.9% 27.8%)"; // اللون الافتراضي
  }
}
