
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { HexColorPicker } from "react-colorful";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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

const DEFAULT_SETTINGS: ThemeSettings = {
  primary: "hsl(215.3 98.9% 27.8%)",
  variant: "professional",
  appearance: "light",
  fontStyle: "noto-kufi",
  fontSize: "medium",
  radius: 0.5
};

// تعريف تغييرات السمات المتاحة
const THEME_VARIANTS = [
  { id: "professional", label: "مهني", color: "hsl(215.3 98.9% 27.8%)" },
  { id: "vibrant", label: "نابض بالحياة", color: "hsl(349 90.9% 45.1%)" },
  { id: "tint", label: "رمادي", color: "hsl(190 50% 65%)" },
  { id: "modern", label: "عصري", color: "hsl(271.5 91.7% 65.1%)" },
  { id: "classic", label: "كلاسيكي", color: "hsl(142.1 76.2% 36.3%)" },
  { id: "futuristic", label: "مستقبلي", color: "hsl(261 73.7% 50.7%)" },
  { id: "elegant", label: "أنيق", color: "hsl(0 0% 10%)" },
  { id: "natural", label: "طبيعي", color: "hsl(22 90% 50.5%)" },
];

export default function ThemeSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // جلب الإعدادات الحالية
  useEffect(() => {
    async function fetchSettings() {
      try {
        // أولا نحاول قراءة الإعدادات من ملف theme.json
        try {
          const res = await fetch('/theme.json');
          if (res.ok) {
            const data = await res.json();
            setSettings(data);
            return;
          }
        } catch (error) {
          console.error("خطأ في قراءة ملف theme.json:", error);
        }

        // إذا فشلت القراءة من الملف، نحاول جلب الإعدادات من API
        const res = await axios.get("/api/settings");
        if (res.data) {
          console.log("تم جلب الإعدادات من API:", res.data);
          const apiSettings: any = res.data;

          // تحويل إعدادات API إلى هيكل ThemeSettings
          setSettings({
            primary: apiSettings.colors?.primary || DEFAULT_SETTINGS.primary,
            variant: apiSettings.themeName || DEFAULT_SETTINGS.variant,
            appearance: apiSettings.appearance || DEFAULT_SETTINGS.appearance,
            fontStyle: apiSettings.fontName || DEFAULT_SETTINGS.fontStyle,
            fontSize: apiSettings.fontSize || DEFAULT_SETTINGS.fontSize,
            radius: DEFAULT_SETTINGS.radius
          });
        }
      } catch (error) {
        console.error("خطأ في جلب الإعدادات:", error);
      }
    }

    fetchSettings();
  }, []);

  // حفظ الإعدادات
  async function saveSettings() {
    try {
      setIsLoading(true);
      console.log("جاري حفظ الإعدادات:", settings);

      const response = await axios.post("/api/theme", settings);

      if (response.data.success) {
        toast({
          title: "تم حفظ الإعدادات",
          description: "تم تطبيق المظهر الجديد بنجاح",
        });

        // تحديث السمات CSS المتغيرة
        if (settings.appearance === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

      } else {
        toast({
          title: "خطأ في الحفظ",
          description: "حدث خطأ أثناء محاولة حفظ الإعدادات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("خطأ في حفظ الإعدادات:", error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء محاولة حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // وضع علامة على متغير CSS للمظهر
  useEffect(() => {
    if (settings.appearance === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.appearance]);

  // حفظ الإعدادات فوريًا عند التغيير مع تأخير صغير
  const handleChange = (key: keyof ThemeSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // إلغاء المؤقت السابق إذا وجد
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      // إنشاء مؤقت جديد للحفظ بعد 500 مللي ثانية
      const timeout = setTimeout(() => {
        saveSettings();
      }, 500);
      
      setSaveTimeout(timeout);
      
      return newSettings;
    });
  };

  // تنظيف المؤقت عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-2xl font-medium">تخصيص المظهر</h3>
        <p className="text-sm text-muted-foreground">
          قم بتخصيص مظهر التطبيق ليناسب ذوقك واحتياجاتك
        </p>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="colors">الألوان</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="typography">الخطوط</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>اللون الرئيسي</Label>
              <div className="mt-3 flex items-center gap-4">
                <div 
                  className="w-20 h-20 border rounded-md cursor-pointer"
                  style={{ backgroundColor: settings.primary }}
                />
                <HexColorPicker
                  color={settings.primary}
                  onChange={(color) => handleChange("primary", color)}
                />
              </div>
            </div>

            <div>
              <Label>نمط الألوان</Label>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {THEME_VARIANTS.map((variant) => (
                  <div
                    key={variant.id}
                    className={cn(
                      "relative h-16 rounded-md cursor-pointer flex items-center justify-center p-2 text-center text-sm transition-all",
                      "border hover:border-primary",
                      settings.variant === variant.id && "border-primary"
                    )}
                    onClick={() => handleChange("variant", variant.id)}
                  >
                    {variant.label}
                    {settings.variant === variant.id && (
                      <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <Label>المظهر العام</Label>
              <RadioGroup
                value={settings.appearance}
                onValueChange={(value) => 
                  handleChange("appearance", value as "light" | "dark" | "system")
                }
                className="mt-3 flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">فاتح</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">داكن</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">نظام التشغيل</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label>نوع الخط</Label>
                  <RadioGroup
                    value={settings.fontStyle}
                    onValueChange={(value) => 
                      handleChange("fontStyle", value as "noto-kufi" | "cairo" | "tajawal")
                    }
                    className="mt-3 flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="noto-kufi" id="noto-kufi" />
                      <Label htmlFor="noto-kufi" className="font-noto-kufi">نوتو كوفي</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="cairo" id="cairo" />
                      <Label htmlFor="cairo" className="font-cairo">القاهرة</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="tajawal" id="tajawal" />
                      <Label htmlFor="tajawal" className="font-tajawal">طجوال</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>حجم الخط</Label>
                  <RadioGroup
                    value={settings.fontSize}
                    onValueChange={(value) => 
                      handleChange("fontSize", value as "small" | "medium" | "large" | "xlarge")
                    }
                    className="mt-3 flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="small" id="small" />
                      <Label htmlFor="small" className="text-sm">صغير</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="text-base">متوسط</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="large" id="large" />
                      <Label htmlFor="large" className="text-lg">كبير</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="xlarge" id="xlarge" />
                      <Label htmlFor="xlarge" className="text-xl">كبير جدًا</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
