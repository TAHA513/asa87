
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HexColorPicker } from "react-colorful";
import { hslToHex, hexToHsl } from "@/lib/color-utils";
import { Lightbulb, Moon, Sun, Laptop, Type, Circle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// أنواع السمات المتاحة
const THEME_VARIANTS = [
  { value: "classic", label: "كلاسيكي" },
  { value: "modern", label: "عصري" },
  { value: "elegant", label: "أنيق" },
  { value: "vibrant", label: "نابض بالحياة" },
];

// أنواع الخطوط المتاحة
const FONT_STYLES = [
  { value: "noto-kufi", label: "نوتو كوفي" },
  { value: "cairo", label: "القاهرة" },
  { value: "tajawal", label: "طجوال" },
];

// أحجام الخطوط المتاحة
const FONT_SIZES = [
  { value: "small", label: "صغير" },
  { value: "medium", label: "متوسط" },
  { value: "large", label: "كبير" },
  { value: "xlarge", label: "كبير جداً" },
];

// أنماط الظهور المتاحة
const APPEARANCE_MODES = [
  { value: "light", label: "فاتح", icon: Sun },
  { value: "dark", label: "داكن", icon: Moon },
  { value: "system", label: "تلقائي", icon: Laptop },
];

export function ThemeSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [hslColor, setHslColor] = useState("hsl(215.3 98.9% 27.8%)");
  const [variant, setVariant] = useState("classic");
  const [appearance, setAppearance] = useState("system");
  const [fontStyle, setFontStyle] = useState("noto-kufi");
  const [fontSize, setFontSize] = useState("medium");
  const [radius, setRadius] = useState(0.5);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  // جلب إعدادات السمات الحالية
  const { data: themeData, isLoading: isThemeLoading } = useQuery({
    queryKey: ["/api/theme"],
    queryFn: async () => {
      const response = await fetch("/api/theme");
      if (!response.ok) throw new Error("فشل في جلب إعدادات السمات");
      return response.json();
    },
    onError: () => {
      // إذا فشل استرجاع السمات من الخادم، استخدم القيم الافتراضية
      console.log("سيتم استخدام القيم الافتراضية للسمات");
    }
  });

  // تحديث إعدادات السمات
  const { mutate: saveTheme, isLoading: isSaving } = useMutation({
    mutationFn: async (themeData: any) => {
      const response = await apiRequest("POST", "/api/theme", themeData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المظهر بنجاح",
      });
      setIsChanged(false);
      queryClient.invalidateQueries({ queryKey: ["/api/theme"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      console.error("Error saving theme:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات المظهر",
        variant: "destructive",
      });
    },
  });

  // تحميل الإعدادات الحالية عند تحميل المكون
  useEffect(() => {
    if (themeData) {
      setPrimaryColor(hslToHex(themeData.primary));
      setHslColor(themeData.primary);
      setVariant(themeData.variant || "classic");
      setAppearance(themeData.appearance || "system");
      setFontStyle(themeData.fontStyle || "noto-kufi");
      setFontSize(themeData.fontSize || "medium");
      setRadius(themeData.radius || 0.5);
      setIsChanged(false);
    }
  }, [themeData]);

  // مراقبة التغييرات في الإعدادات
  useEffect(() => {
    if (themeData) {
      const hasChanged = 
        hslColor !== themeData.primary ||
        variant !== themeData.variant ||
        appearance !== themeData.appearance ||
        fontStyle !== themeData.fontStyle ||
        fontSize !== themeData.fontSize ||
        radius !== themeData.radius;
      
      setIsChanged(hasChanged);
    }
  }, [hslColor, variant, appearance, fontStyle, fontSize, radius, themeData]);

  // تحديث اللون الأساسي
  const handleColorChange = (hex: string) => {
    setPrimaryColor(hex);
    const hsl = hexToHsl(hex);
    setHslColor(hsl);
    setIsChanged(true);
  };

  // حفظ الإعدادات
  const handleSave = () => {
    const newTheme = {
      primary: hslColor,
      variant,
      appearance,
      fontStyle,
      fontSize,
      radius,
    };
    saveTheme(newTheme);
  };

  // إعادة الإعدادات للافتراضية
  const handleReset = () => {
    if (themeData) {
      setPrimaryColor(hslToHex(themeData.primary));
      setHslColor(themeData.primary);
      setVariant(themeData.variant);
      setAppearance(themeData.appearance);
      setFontStyle(themeData.fontStyle);
      setFontSize(themeData.fontSize);
      setRadius(themeData.radius);
      setIsChanged(false);
    }
  };

  if (isThemeLoading) {
    return <div>جاري تحميل الإعدادات...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إعدادات المظهر</h2>
        <div className="space-x-2 rtl:space-x-reverse">
          {isChanged && (
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>
              إلغاء التغييرات
            </Button>
          )}
          <Button onClick={handleSave} disabled={!isChanged || isSaving}>
            {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>

      <Alert className={isChanged ? "bg-primary/10" : "hidden"}>
        <AlertDescription>
          لديك تغييرات غير محفوظة. انقر على "حفظ الإعدادات" لتطبيق التغييرات.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="appearance">
        <TabsList className="mb-4">
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="typography">الخطوط</TabsTrigger>
          <TabsTrigger value="colors">الألوان</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نمط المظهر</CardTitle>
              <CardDescription>اختر نمط المظهر المفضل لديك</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={variant} 
                onValueChange={(value) => {
                  setVariant(value);
                  setIsChanged(true);
                }}
                className="grid grid-cols-2 gap-4"
              >
                {THEME_VARIANTS.map((item) => (
                  <div key={item.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value={item.value} id={`variant-${item.value}`} />
                    <Label htmlFor={`variant-${item.value}`}>{item.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>وضع الإضاءة</CardTitle>
              <CardDescription>اختر وضع الإضاءة المفضل لديك</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={appearance} 
                onValueChange={(value) => {
                  setAppearance(value);
                  setIsChanged(true);
                }}
                className="grid grid-cols-3 gap-4"
              >
                {APPEARANCE_MODES.map((item) => (
                  <div key={item.value} className="flex flex-col items-center gap-2 p-2 border rounded-md">
                    <item.icon className="h-6 w-6" />
                    <RadioGroupItem value={item.value} id={`appearance-${item.value}`} className="sr-only" />
                    <Label htmlFor={`appearance-${item.value}`}>{item.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تدوير الزوايا</CardTitle>
              <CardDescription>اضبط درجة تدوير زوايا العناصر</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={[radius]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={(values) => {
                    setRadius(values[0]);
                    setIsChanged(true);
                  }}
                />
                <div className="flex justify-between">
                  <span>مربع</span>
                  <span>{radius}</span>
                  <span>دائري</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="border aspect-square rounded-none bg-muted"></div>
                  <div 
                    className="border aspect-square bg-muted"
                    style={{ borderRadius: `${radius * 0.5}rem` }}
                  ></div>
                  <div className="border aspect-square rounded-full bg-muted"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أسلوب الخط</CardTitle>
              <CardDescription>اختر أسلوب الخط المفضل لديك</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={fontStyle} 
                onValueChange={(value) => {
                  setFontStyle(value);
                  setIsChanged(true);
                }}
                className="grid gap-4"
              >
                {FONT_STYLES.map((item) => (
                  <div key={item.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value={item.value} id={`font-${item.value}`} />
                    <Label 
                      htmlFor={`font-${item.value}`} 
                      className={`text-xl font-${item.value}`}
                    >
                      {item.label} - نموذج للخط
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>حجم الخط</CardTitle>
              <CardDescription>اختر حجم الخط المفضل لديك</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={fontSize} 
                onValueChange={(value) => {
                  setFontSize(value);
                  setIsChanged(true);
                }}
                className="grid grid-cols-2 gap-4"
              >
                {FONT_SIZES.map((item) => (
                  <div key={item.value} className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value={item.value} id={`size-${item.value}`} />
                    <Label 
                      htmlFor={`size-${item.value}`}
                      className={`text-${item.value === "small" ? "sm" : item.value === "medium" ? "base" : item.value === "large" ? "lg" : "xl"}`}
                    >
                      {item.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اللون الأساسي</CardTitle>
              <CardDescription>اختر اللون الأساسي للواجهة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-12 h-12 rounded-md border"
                    style={{ backgroundColor: primaryColor }}
                    aria-label="اختر اللون الأساسي"
                  />
                  <div>
                    <div className="text-sm font-medium">اللون الأساسي</div>
                    <div className="text-xs text-muted-foreground">{hslColor}</div>
                  </div>
                </div>
                
                {showColorPicker && (
                  <div className="relative mt-2">
                    <HexColorPicker color={primaryColor} onChange={handleColorChange} />
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2 mt-4">
                  {[
                    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981",
                    "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#ec4899"
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className="w-8 h-8 rounded-md border"
                      style={{ backgroundColor: color }}
                      aria-label={`اختر اللون ${color}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معاينة الألوان</CardTitle>
              <CardDescription>معاينة للألوان المختارة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className="h-20 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="text-white font-bold">أساسي</span>
                  </div>
                  <div 
                    className="h-20 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: appearance === 'dark' 
                      ? `color-mix(in srgb, ${primaryColor} 80%, white)` 
                      : `color-mix(in srgb, ${primaryColor} 80%, black)` 
                    }}
                  >
                    <span className="text-white font-bold">ثانوي</span>
                  </div>
                  <div 
                    className="h-20 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: appearance === 'dark'
                      ? `color-mix(in srgb, ${primaryColor} 60%, black)`
                      : `color-mix(in srgb, ${primaryColor} 60%, white)`
                    }}
                  >
                    <span className="text-white font-bold">تأكيد</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ThemeSettings;
