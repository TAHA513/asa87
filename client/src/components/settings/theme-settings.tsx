import { useEffect, useState } from "react";
import {
  Check,
  Palette,
  Type,
  Moon,
  Sun,
  Monitor,
  Minus,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";

const themes = [
  {
    name: "العصري",
    id: "modern",
    colors: {
      primary: "hsl(142.1 76.2% 36.3%)",
      secondary: "hsl(217.2 91.2% 59.8%)",
      accent: "hsl(316.8 81.2% 43.8%)",
    },
    preview: "modern",
  },
  {
    name: "الكلاسيكي",
    id: "classic",
    colors: {
      primary: "hsl(215.3 98.9% 27.8%)",
      secondary: "hsl(221.2 83.2% 53.3%)",
      accent: "hsl(262.1 83.3% 57.8%)",
    },
    preview: "classic",
  },
  {
    name: "الأنيق",
    id: "elegant",
    colors: {
      primary: "hsl(200.4 15.3% 46.9%)",
      secondary: "hsl(171.2 76.5% 36.6%)",
      accent: "hsl(280.1 81.3% 40.8%)",
    },
    preview: "elegant",
  },
  {
    name: "النابض بالحياة",
    id: "vibrant",
    colors: {
      primary: "hsl(20.5 90.2% 48.2%)",
      secondary: "hsl(280.1 65.3% 70.8%)",
      accent: "hsl(346.8 77.2% 49.8%)",
    },
    preview: "vibrant",
  },
  {
    name: "الطبيعي",
    id: "natural",
    colors: {
      primary: "hsl(120.1 40.1% 39.2%)",
      secondary: "hsl(25.3 95.3% 52.8%)",
      accent: "hsl(160.1 84.1% 39.2%)",
    },
    preview: "natural",
  },
];

const fonts = [
  {
    name: "نوتو كوفي",
    id: "noto-kufi",
    family: "'Noto Kufi Arabic'",
    weight: "400,700",
    style: "modern",
    preview: "خط عربي حديث وأنيق",
  },
  {
    name: "القاهرة",
    id: "cairo",
    family: "'Cairo'",
    weight: "400,600,700",
    style: "elegant",
    preview: "خط عصري متناسق",
  },
  {
    name: "الأميري",
    id: "amiri",
    family: "'Amiri'",
    weight: "400,700",
    style: "traditional",
    preview: "خط كلاسيكي جميل",
  },
  {
    name: "تجوال",
    id: "tajawal",
    family: "'Tajawal'",
    weight: "400,500,700",
    style: "contemporary",
    preview: "خط عربي معاصر",
  },
  {
    name: "آي بي إم بلكس",
    id: "ibm-plex",
    family: "'IBM Plex Sans Arabic'",
    weight: "400,500,700",
    style: "modern",
    preview: "خط عصري للواجهات",
  },
  {
    name: "عارف رقعة",
    id: "aref-ruqaa",
    family: "'Aref Ruqaa'",
    weight: "400,700",
    style: "calligraphic",
    preview: "خط رقعة أصيل",
  },
  {
    name: "لطيف",
    id: "lateef",
    family: "'Lateef'",
    weight: "400,700",
    style: "readable",
    preview: "خط سهل القراءة",
  },
  {
    name: "ريم الكوفي",
    id: "reem-kufi",
    family: "'Reem Kufi'",
    weight: "400,500,700",
    style: "geometric",
    preview: "خط كوفي هندسي",
  },
];

const fontSizes = {
  small: {
    base: 14,
    scale: 1.2,
  },
  medium: {
    base: 16,
    scale: 1.25,
  },
  large: {
    base: 18,
    scale: 1.333,
  },
  xlarge: {
    base: 20,
    scale: 1.4,
  },
};

const ThemeSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("theme");
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [selectedFont, setSelectedFont] = useState(fonts[0]);
  const [fontSize, setFontSize] = useState("medium");
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">(
    "system",
  );
  const [isLoading, setIsLoading] = useState(false);

  // تطبيق وضع السطوع المحدد
  const applyAppearance = (mode: "light" | "dark" | "system") => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }

    // تحديث متغير CSS مخصص لتتبع الوضع الحالي
    root.style.setProperty("--current-appearance", mode);
  };

  // مراقبة تغييرات وضع النظام
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (appearance === "system") {
        applyAppearance("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [appearance]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiRequest("GET", "/api/settings");
        if (response) {
          // استخدام المعرفات بدلاً من الأسماء العربية
          const theme =
            themes.find((t) => t.id === response.variant) || themes[0];
          const font =
            fonts.find((f) => f.id === response.fontStyle) || fonts[0];
          setSelectedTheme(theme);
          setSelectedFont(font);
          setFontSize(response.fontSize || "medium");
          setAppearance(response.appearance || "system");

          // تطبيق وضع السطوع المحفوظ
          applyAppearance(response.appearance || "system");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const settings = {
        primary: selectedTheme.colors.primary,
        variant: selectedTheme.id, // استخدام المعرف بدلاً من الاسم
        fontStyle: selectedFont.id, // استخدام المعرف بدلاً من الاسم
        fontSize,
        appearance,
        radius: 0.5,
      };

      console.log("Saving settings:", settings); // للتحقق من البيانات المرسلة

      const response = await apiRequest("POST", "/api/settings", settings);

      if (response) {
        // تحديث متغيرات CSS
        document.documentElement.style.setProperty(
          "--primary-color",
          selectedTheme.colors.primary,
        );
        document.documentElement.style.setProperty(
          "--secondary-color",
          selectedTheme.colors.secondary,
        );
        document.documentElement.style.setProperty(
          "--accent-color",
          selectedTheme.colors.accent,
        );
        document.documentElement.style.setProperty(
          "--font-family",
          selectedFont.family,
        );
        document.documentElement.style.setProperty(
          "--font-size-base",
          `${fontSizes[fontSize].base}px`,
        );

        // تطبيق وضع السطوع
        applyAppearance(appearance);

        toast({
          title: "تم الحفظ",
          description: "تم حفظ إعدادات المظهر بنجاح",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">تخصيص المظهر</CardTitle>
        <CardDescription>قم بتخصيص مظهر التطبيق حسب تفضيلاتك</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              الثيمات
            </TabsTrigger>
            <TabsTrigger value="font" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              الخطوط
            </TabsTrigger>
            <TabsTrigger value="size" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              حجم الخط
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Sun className="w-4 h-4" />
              السطوع
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <Card
                  key={theme.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedTheme.id === theme.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedTheme(theme);
                    // تطبيق ألوان الثيم فوراً
                    document.documentElement.style.setProperty(
                      "--primary-color",
                      theme.colors.primary,
                    );
                    document.documentElement.style.setProperty(
                      "--secondary-color",
                      theme.colors.secondary,
                    );
                    document.documentElement.style.setProperty(
                      "--accent-color",
                      theme.colors.accent,
                    );
                  }}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{theme.name}</CardTitle>
                      {selectedTheme.id === theme.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      {Object.entries(theme.colors).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="font">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fonts.map((font) => (
                <Card
                  key={font.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedFont.id === font.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedFont(font);
                    // تطبيق الخط فوراً
                    document.documentElement.style.setProperty(
                      "--font-family",
                      font.family,
                    );
                  }}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{font.name}</CardTitle>
                      {selectedFont.id === font.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-xl" style={{ fontFamily: font.family }}>
                      {font.preview}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="size">
            <Card>
              <CardHeader>
                <CardTitle>حجم الخط</CardTitle>
                <CardDescription>اختر حجم الخط المناسب للعرض</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(fontSizes).map(([size, config]) => (
                      <Card
                        key={size}
                        className={`cursor-pointer p-4 ${
                          fontSize === size ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => {
                          setFontSize(size);
                          // تطبيق حجم الخط فوراً
                          document.documentElement.style.setProperty(
                            "--font-size-base",
                            `${config.base}px`,
                          );
                        }}
                      >
                        <div className="text-center">
                          <div style={{ fontSize: `${config.base}px` }}>
                            نص تجريبي
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {size === "small" && "صغير"}
                            {size === "medium" && "متوسط"}
                            {size === "large" && "كبير"}
                            {size === "xlarge" && "كبير جداً"}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>معاينة الحجم</Label>
                    <div
                      className="space-y-4"
                      style={{
                        fontSize: `${fontSizes[fontSize].base}px`,
                        fontFamily: selectedFont.family,
                      }}
                    >
                      <h1 className="font-bold">عنوان رئيسي</h1>
                      <h2 className="font-semibold">عنوان فرعي</h2>
                      <p>
                        هذا نص تجريبي لمعاينة حجم الخط المختار. يمكنك رؤية كيف
                        سيظهر النص في مختلف العناصر.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-all hover:scale-105 ${
                  appearance === "light" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setAppearance("light");
                  applyAppearance("light");
                }}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">فاتح</CardTitle>
                    {appearance === "light" && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Sun className="w-8 h-8" />
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:scale-105 ${
                  appearance === "dark" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setAppearance("dark");
                  applyAppearance("dark");
                }}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">داكن</CardTitle>
                    {appearance === "dark" && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Moon className="w-8 h-8" />
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:scale-105 ${
                  appearance === "system" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setAppearance("system");
                  applyAppearance("system");
                }}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">تلقائي</CardTitle>
                    {appearance === "system" && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Monitor className="w-8 h-8" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            حفظ التغييرات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;
