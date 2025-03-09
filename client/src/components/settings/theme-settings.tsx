import { useState, useEffect } from "react";
import { Check, Sun, Moon, Laptop } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

// تعريف السمات المتاحة
const themes = [
  { id: "professional", name: "العصري", color: "hsl(215.3 98.9% 27.8%)" },
  { id: "vibrant", name: "النابض", color: "hsl(349 90.9% 45.1%)" },
  { id: "tint", name: "الرمادي", color: "hsl(220 14% 42%)" },
  { id: "modern", name: "الأزرق", color: "hsl(204 100% 40%)" },
  { id: "classic", name: "الكلاسيكي", color: "hsl(142.1 76.2% 36.3%)" },
  { id: "futuristic", name: "المستقبلي", color: "hsl(261 73.7% 50.7%)" },
  { id: "elegant", name: "الأنيق", color: "hsl(300 70% 45%)" },
  { id: "natural", name: "الطبيعي", color: "hsl(22 90% 50.5%)" }
];

// تعريف الخطوط المتاحة
const fonts = [
  {
    id: "noto-kufi",
    name: "نوتو كوفي",
    family: "'Noto Kufi Arabic', sans-serif",
  },
  {
    id: "cairo",
    name: "القاهرة",
    family: "'Cairo', sans-serif",
  },
  {
    id: "tajawal",
    name: "طجوال",
    family: "'Tajawal', sans-serif",
  }
];

// تعريف أحجام الخط
const fontSizes = [
  { id: "small", name: "صغير" },
  { id: "medium", name: "متوسط" },
  { id: "large", name: "كبير" },
  { id: "xlarge", name: "كبير جداً" }
];

// تعريف أوضاع السطوع
const appearances = [
  { id: "light", name: "فاتح", icon: Sun },
  { id: "dark", name: "داكن", icon: Moon },
  { id: "system", name: "تلقائي", icon: Laptop }
];

const ThemeSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("theme");

  // حالة الإعدادات
  const [themeColor, setThemeColor] = useState(themes[0].color);
  const [themeVariant, setThemeVariant] = useState(themes[0].id);
  const [fontStyle, setFontStyle] = useState(fonts[0].id);
  const [fontSize, setFontSize] = useState("medium");
  const [appearance, setAppearance] = useState("system");
  const [isLoading, setIsLoading] = useState(false);

  // جلب الإعدادات الحالية عند تحميل المكوّن
  useEffect(() => {
    const fetchCurrentSettings = async () => {
      try {
        const response = await apiRequest("GET", "/api/settings");
        if (!response.ok) throw new Error("فشل في جلب الإعدادات");

        const data = await response.json();
        if (data) {
          // تحديث الحالة بالإعدادات المسترجعة
          const currentTheme = themes.find(t => t.id === data.themeName) || themes[0];
          const currentFont = fonts.find(f => f.id === data.fontName) || fonts[0];

          setThemeColor(data.colors?.primary || currentTheme.color);
          setThemeVariant(currentTheme.id);
          setFontStyle(currentFont.id);
          setFontSize(data.fontSize || "medium");
          setAppearance(data.appearance || "system");

          // تطبيق الإعدادات على واجهة المستخدم
          applyAppearance(data.appearance || "system");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    fetchCurrentSettings();
  }, []);

  // حفظ الإعدادات على الخادم
  const saveSettings = async () => {
    setIsLoading(true);

    try {
      const settingsData = {
        primary: themeColor,
        variant: themeVariant,
        appearance: appearance,
        fontStyle: fontStyle,
        fontSize: fontSize,
        radius: 0.5
      };

      const response = await apiRequest("POST", "/api/settings", settingsData);
      if (!response.ok) throw new Error("فشل في حفظ الإعدادات");

      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تطبيق الإعدادات الجديدة بنجاح",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: "حدث خطأ أثناء محاولة حفظ الإعدادات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تطبيق السطوع المختار
  const applyAppearance = (mode) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }
  };

  // معالجة تغيير ظهور النظام
  const handleAppearanceChange = (value) => {
    setAppearance(value);
    applyAppearance(value);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="theme">المظهر واللون</TabsTrigger>
          <TabsTrigger value="font">الخط والحجم</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-4 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">اختر لون السمة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <Card 
                  key={theme.id}
                  className={`cursor-pointer hover:border-primary transition-all ${themeVariant === theme.id ? 'border-primary' : ''}`}
                  onClick={() => {
                    setThemeVariant(theme.id);
                    setThemeColor(theme.color);
                  }}
                >
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">{theme.name}</CardTitle>
                      {themeVariant === theme.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="w-full h-6 rounded-md" style={{ backgroundColor: theme.color }}></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-lg font-medium mt-6">وضع السطوع</h3>
            <RadioGroup value={appearance} onValueChange={handleAppearanceChange} className="grid grid-cols-3 gap-4">
              {appearances.map((mode) => (
                <div key={mode.id} className="relative">
                  <RadioGroupItem 
                    value={mode.id} 
                    id={`appearance-${mode.id}`} 
                    className="sr-only peer" 
                  />
                  <Label
                    htmlFor={`appearance-${mode.id}`}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <mode.icon className="mb-2 h-6 w-6" />
                    <span>{mode.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </TabsContent>

        <TabsContent value="font" className="space-y-4 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">اختر نوع الخط</h3>
            <RadioGroup value={fontStyle} onValueChange={setFontStyle} className="grid grid-cols-1 gap-4">
              {fonts.map((font) => (
                <div key={font.id} className="relative">
                  <RadioGroupItem 
                    value={font.id} 
                    id={`font-${font.id}`} 
                    className="sr-only peer" 
                  />
                  <Label
                    htmlFor={`font-${font.id}`}
                    className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    style={{ fontFamily: font.family }}
                  >
                    <span>{font.name}</span>
                    {fontStyle === font.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <h3 className="text-lg font-medium mt-6">حجم الخط</h3>
            <RadioGroup value={fontSize} onValueChange={setFontSize} className="grid grid-cols-2 gap-4">
              {fontSizes.map((size) => (
                <div key={size.id} className="relative">
                  <RadioGroupItem 
                    value={size.id} 
                    id={`size-${size.id}`} 
                    className="sr-only peer" 
                  />
                  <Label
                    htmlFor={`size-${size.id}`}
                    className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    style={{ fontSize: size.id === "small" ? "0.9rem" : size.id === "large" ? "1.1rem" : size.id === "xlarge" ? "1.2rem" : "1rem" }}
                  >
                    <span>{size.name}</span>
                    {fontSize === size.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        className="w-full" 
        onClick={saveSettings} 
        disabled={isLoading}
      >
        {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </Button>
    </div>
  );
};

export default ThemeSettings;