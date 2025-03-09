
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { HexColorPicker } from "react-colorful";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  ThemeSettings,
  DEFAULT_THEME,
  THEME_VARIANTS,
  storeTheme,
  applyTheme,
  saveThemeToServer,
  fetchThemeFromServer
} from "@/lib/theme-service";

export default function ThemeSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(false);
  
  // جلب الإعدادات عند تحميل المكون
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        // محاولة قراءة الإعدادات من ملف theme.json
        try {
          const response = await fetch('/theme.json');
          if (response.ok) {
            const data = await response.json();
            setSettings(data);
            console.log("تم قراءة الإعدادات من ملف theme.json:", data);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("خطأ في قراءة ملف theme.json:", error);
        }
        
        // إذا فشلت قراءة ملف theme.json، نحاول الحصول عليها من API
        const serverTheme = await fetchThemeFromServer();
        if (serverTheme) {
          setSettings(serverTheme);
        }
      } catch (error) {
        console.error("خطأ في تحميل الإعدادات:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, []);
  
  // حفظ الإعدادات - يتم استدعاؤها عند التغيير
  const saveSettings = useCallback(async () => {
    console.log("جاري حفظ الإعدادات:", settings);
    setIsLoading(true);
    try {
      // حفظ في التخزين المحلي أولاً
      storeTheme(settings);
      
      // تطبيق التغييرات على واجهة المستخدم
      applyTheme(settings);
      
      // حفظ على الخادم
      const success = await saveThemeToServer(settings);
      
      if (success) {
        toast({
          title: "تم الحفظ",
          description: "تم حفظ إعدادات المظهر بنجاح",
        });
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ الإعدادات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("خطأ في حفظ الإعدادات:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [settings, toast]);
  
  // معالج تغيير الإعدادات
  const handleChange = useCallback((key: keyof ThemeSettings, value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      
      // حفظ التغييرات تلقائيًا بعد التعديل مباشرة
      saveSettings();
      
      return newSettings;
    });
  }, [saveSettings]);

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
                      "relative h-16 rounded-md cursor-pointer flex items-center justify-center border-2",
                      settings.variant === variant.id
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                    style={{ backgroundColor: variant.color }}
                    onClick={() => handleChange("variant", variant.id)}
                  >
                    <span className="font-medium text-white text-shadow-sm">
                      {variant.label}
                    </span>
                    {settings.variant === variant.id && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full border-2 border-white" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>نصف قطر الزوايا</Label>
              <div className="mt-3">
                <Slider
                  value={[settings.radius]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={(value) => handleChange("radius", value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>بدون زوايا</span>
                  <span>زوايا متوسطة</span>
                  <span>زوايا كبيرة</span>
                </div>
              </div>
              <div className="flex items-center justify-center mt-4">
                <div
                  className="w-16 h-16 border-2 border-primary"
                  style={{
                    borderRadius: `${settings.radius * 0.5}rem`,
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div>
            <Label>المظهر</Label>
            <RadioGroup
              value={settings.appearance}
              onValueChange={(value) => 
                handleChange("appearance", value as ThemeSettings["appearance"])
              }
              className="mt-3 grid grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3 h-6 w-6"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                  <span>فاتح</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3 h-6 w-6"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                  <span>داكن</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3 h-6 w-6"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="20"
                      height="14"
                      rx="2"
                      ry="2"
                    />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span>النظام</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <div>
            <Label>نوع الخط</Label>
            <RadioGroup
              value={settings.fontStyle}
              onValueChange={(value) => 
                handleChange("fontStyle", value as ThemeSettings["fontStyle"])
              }
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="noto-kufi" id="noto-kufi" />
                <Label htmlFor="noto-kufi" className="font-noto-kufi text-lg">
                  نوتو كوفي - Noto Kufi Arabic
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="cairo" id="cairo" />
                <Label htmlFor="cairo" className="font-cairo text-lg">
                  القاهرة - Cairo
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="tajawal" id="tajawal" />
                <Label htmlFor="tajawal" className="font-tajawal text-lg">
                  طجوال - Tajawal
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>حجم الخط</Label>
            <RadioGroup
              value={settings.fontSize}
              onValueChange={(value) => 
                handleChange("fontSize", value as ThemeSettings["fontSize"])
              }
              className="mt-3 space-y-3"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="text-sm">
                  صغير
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-base">
                  متوسط
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="text-lg">
                  كبير
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="xlarge" id="xlarge" />
                <Label htmlFor="xlarge" className="text-xl">
                  كبير جدًا
                </Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
