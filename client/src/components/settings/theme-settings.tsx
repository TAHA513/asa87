import { useState, useEffect, useCallback } from "react";
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
  { id: "professional", name: "المهني", color: "hsl(215.3 98.9% 27.8%)" },
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

// تعريف أحجام الخطوط
const fontSizes = [
  { id: "small", name: "صغير" },
  { id: "medium", name: "متوسط" },
  { id: "large", name: "كبير" },
  { id: "xlarge", name: "كبير جداً" }
];

// تعريف أنماط الظهور
const appearances = [
  { id: "light", name: "فاتح", icon: Sun },
  { id: "dark", name: "داكن", icon: Moon },
  { id: "system", name: "تلقائي", icon: Laptop }
];

const ThemeSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("theme");
  const [isSaving, setIsSaving] = useState(false);

  // حالة الإعدادات
  const [themeColor, setThemeColor] = useState(themes[0].color);
  const [themeVariant, setThemeVariant] = useState(themes[0].id);
  const [fontStyle, setFontStyle] = useState(fonts[0].id);
  const [fontSize, setFontSize] = useState("medium");
  const [appearance, setAppearance] = useState("system");
  const [borderRadius, setBorderRadius] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);

  // تطبيق ظهور النظام
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

  // جلب الإعدادات الحالية عند تحميل المكوّن
  useEffect(() => {
    const fetchCurrentSettings = async () => {
      try {
        // أولاً نحاول قراءة ملف theme.json
        fetch("/theme.json")
          .then(res => res.json())
          .then(data => {
            console.log("تم قراءة ملف theme.json:", data);
            if (data) {
              // تحديث الإعدادات من ملف theme.json
              setThemeColor(data.primary || themes[0].color);
              setThemeVariant(data.variant || themes[0].id);
              setFontStyle(data.fontStyle || fonts[0].id);
              setFontSize(data.fontSize || "medium");
              setAppearance(data.appearance || "system");
              setBorderRadius(data.radius || 0.5);

              // تطبيق الظهور
              applyAppearance(data.appearance || "system");
            }
          })
          .catch(err => {
            console.log("خطأ في قراءة ملف theme.json:", err);

            // في حالة فشل قراءة الملف، نحاول جلب الإعدادات من API
            apiRequest("GET", "/api/settings")
              .then(response => {
                if (!response.ok) throw new Error("فشل في جلب الإعدادات");
                return response.json();
              })
              .then(data => {
                console.log("تم جلب الإعدادات من API:", data);
                if (data) {
                  // تحديث الحالة بالإعدادات المسترجعة من API
                  const currentTheme = themes.find(t => t.id === data.themeName) || themes[0];
                  const currentFont = fonts.find(f => f.id === data.fontName) || fonts[0];

                  setThemeColor(data.colors?.primary || currentTheme.color);
                  setThemeVariant(currentTheme.id);
                  setFontStyle(currentFont.id);
                  setFontSize(data.fontSize || "medium");
                  setAppearance(data.appearance || "system");

                  // تطبيق الظهور
                  applyAppearance(data.appearance || "system");
                }
              })
              .catch(err => {
                console.log("خطأ في تحميل الإعدادات:", err);
              });
          });
      } catch (error) {
        console.log("خطأ في تحميل الإعدادات:", error);
      }
    };

    fetchCurrentSettings();
  }, []);

  // حفظ الإعدادات
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // تجهيز الإعدادات للحفظ
      const themeSettings = {
        primary: themeColor,
        variant: themeVariant,
        appearance,
        fontStyle,
        fontSize,
        radius: borderRadius
      };

      console.log("جاري حفظ الإعدادات:", themeSettings);

      // حفظ الإعدادات عبر API
      const response = await apiRequest("POST", "/api/theme", themeSettings);

      if (!response.ok) {
        throw new Error("فشل في حفظ الإعدادات");
      }

      // في حالة نجاح الحفظ في الملف، نقوم بحفظها أيضًا في قاعدة البيانات
      const userSettings = {
        ...themeSettings
      };

      await apiRequest("POST", "/api/settings", userSettings);

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المظهر بنجاح",
      });

      // إعادة تحميل الصفحة لتطبيق التغييرات
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("خطأ في حفظ الإعدادات:", error);
      toast({
        title: "حدث خطأ",
        description: "فشل في حفظ الإعدادات. حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لحفظ الإعدادات مباشرة بعد التغيير
  const saveSettingsImmediately = useCallback(async (newSettings: any) => {
    setIsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });
      toast({
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        description: "حدث خطأ أثناء حفظ الإعدادات",
      });
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // معالجة تغيير ظهور النظام
  const handleAppearanceChange = (value: string) => {
    const newAppearance = value as "light" | "dark" | "system";
    setAppearance(newAppearance);
    // حفظ الإعدادات مباشرة بعد التغيير
    saveSettingsImmediately({
      appearance: newAppearance,
      fontStyle,
      fontSize,
      themeVariant,
      themeColor,
      borderRadius
    });
  };

  const handleThemeVariantChange = (value: string) => {
    const newVariant = value as "modern" | "classic" | "elegant" | "vibrant" | "natural" | "professional" | "tint" | "futuristic";
    setThemeVariant(newVariant);
    const newTheme = themes.find(theme => theme.id === newVariant);
    setThemeColor(newTheme ? newTheme.color : themes[0].color); // Set color based on selected variant

    saveSettingsImmediately({
      appearance,
      fontStyle,
      fontSize,
      variant: newVariant,
      primary: newTheme ? newTheme.color : themes[0].color,
      radius: borderRadius
    });
  };

  const handleFontStyleChange = (value: string) => {
    const newFontStyle = value as "noto-kufi" | "cairo" | "tajawal";
    setFontStyle(newFontStyle);
    // حفظ الإعدادات مباشرة بعد التغيير
    saveSettingsImmediately({
      appearance,
      fontStyle: newFontStyle,
      fontSize,
      themeVariant,
      themeColor,
      borderRadius
    });
  };

  const handleFontSizeChange = (value: string) => {
    const newFontSize = value as "small" | "medium" | "large" | "xlarge";
    setFontSize(newFontSize);
    // حفظ الإعدادات مباشرة بعد التغيير
    saveSettingsImmediately({
      appearance,
      fontStyle,
      fontSize: newFontSize,
      themeVariant,
      themeColor,
      borderRadius
    });
  };


  const handlePrimaryColorChange = (value: string) => {
    setThemeColor(value);
    // حفظ الإعدادات مباشرة بعد التغيير
    saveSettingsImmediately({
      appearance,
      fontStyle,
      fontSize,
      themeVariant,
      primary: value,
      borderRadius
    });
  };

  const handleRadiusChange = (value: number) => {
    setBorderRadius(value);
    // حفظ الإعدادات مباشرة بعد التغيير
    saveSettingsImmediately({
      appearance,
      fontStyle,
      fontSize,
      themeVariant,
      themeColor,
      radius: value
    });
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {themes.map((theme) => (
                <Card 
                  key={theme.id}
                  className={`cursor-pointer hover:border-primary transition-all ${themeVariant === theme.id ? 'border-primary' : ''}`}
                  onClick={() => handleThemeVariantChange(theme.id)}
                >
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">{theme.name}</CardTitle>
                      {themeVariant === theme.id && <Check className="h-4 w-4" />}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div 
                      className="h-6 w-full rounded-sm" 
                      style={{ backgroundColor: theme.color }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-lg font-medium mt-6">المظهر</h3>
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
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <mode.icon className="mb-2" />
                    <span>{mode.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <h3 className="text-lg font-medium mt-6">مستوى التقويس</h3>
            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-5 gap-4">
                {[0, 0.25, 0.5, 0.75, 1].map((radius) => (
                  <div 
                    key={radius}
                    className={`cursor-pointer rounded-md border-2 p-2 text-center flex items-center justify-center h-12 ${borderRadius === radius ? 'border-primary' : 'border-muted'}`}
                    onClick={() => handleRadiusChange(radius)}
                    style={{ borderRadius: `${8 * radius}px` }}
                  >
                    {radius}
                  </div>
                ))}
              </div>
              <div 
                className="w-full mt-2 border-2 border-dashed border-muted h-16 flex items-center justify-center"
                style={{ 
                  borderRadius: `${borderRadius * 16}px`,
                  backgroundColor: themeColor,
                  color: "#ffffff"
                }}
              >
                معاينة التقويس
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="font" className="space-y-4 py-4">
          <h3 className="text-lg font-medium">نوع الخط</h3>
          <RadioGroup value={fontStyle} onValueChange={handleFontStyleChange} className="grid grid-cols-2 gap-4">
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
          <RadioGroup value={fontSize} onValueChange={handleFontSizeChange} className="grid grid-cols-2 gap-4">
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

          <div className="mt-6 p-4 border rounded-md" style={{ fontFamily: fonts.find(f => f.id === fontStyle)?.family }}>
            <h4 className="font-bold text-lg mb-2">معاينة الخط:</h4>
            <p style={{ fontSize: fontSize === "small" ? "0.9rem" : fontSize === "large" ? "1.1rem" : fontSize === "xlarge" ? "1.2rem" : "1rem" }}>
              هذا مثال لمعاينة الخط {fonts.find(f => f.id === fontStyle)?.name} بحجم {fontSizes.find(s => s.id === fontSize)?.name}.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* تم إزالة زر الحفظ لأن التغييرات تُحفظ تلقائياً */}
      <div className="mt-6 text-sm text-muted-foreground text-center">
        جميع التغييرات تُحفظ تلقائياً
      </div>
    </div>
  );
};

export default ThemeSettings;