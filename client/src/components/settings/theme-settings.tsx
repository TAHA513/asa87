import { useEffect, useState } from "react";
import { Check, Palette, Type, Moon, Sun, Monitor, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";

const themes = [
  {
    name: "العصري",
    colors: {
      primary: "hsl(142.1 76.2% 36.3%)",
      secondary: "hsl(217.2 91.2% 59.8%)",
      accent: "hsl(316.8 81.2% 43.8%)",
    },
    preview: "modern",
  },
  {
    name: "الكلاسيكي",
    colors: {
      primary: "hsl(215.3 98.9% 27.8%)",
      secondary: "hsl(221.2 83.2% 53.3%)",
      accent: "hsl(262.1 83.3% 57.8%)",
    },
    preview: "classic",
  },
  {
    name: "الأنيق",
    colors: {
      primary: "hsl(200.4 15.3% 46.9%)",
      secondary: "hsl(171.2 76.5% 36.6%)",
      accent: "hsl(280.1 81.3% 40.8%)",
    },
    preview: "elegant",
  },
  {
    name: "النابض بالحياة",
    colors: {
      primary: "hsl(20.5 90.2% 48.2%)",
      secondary: "hsl(280.1 65.3% 70.8%)",
      accent: "hsl(346.8 77.2% 49.8%)",
    },
    preview: "vibrant",
  },
  {
    name: "الطبيعي",
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
    family: "'Noto Kufi Arabic'",
    weight: "400,700",
    style: "modern",
    preview: "خط عربي حديث وأنيق",
  },
  {
    name: "القاهرة",
    family: "'Cairo'",
    weight: "400,600,700",
    style: "elegant",
    preview: "خط عصري متناسق",
  },
  {
    name: "الأميري",
    family: "'Amiri'",
    weight: "400,700",
    style: "traditional",
    preview: "خط كلاسيكي جميل",
  },
  {
    name: "تجوال",
    family: "'Tajawal'",
    weight: "400,500,700",
    style: "contemporary",
    preview: "خط عربي معاصر",
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
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">("system");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiRequest("GET", "/api/settings");
        if (response) {
          const settings = response;
          const theme = themes.find(t => t.name === settings.themeName) || themes[0];
          const font = fonts.find(f => f.name === settings.fontName) || fonts[0];
          setSelectedTheme(theme);
          setSelectedFont(font);
          setFontSize(settings.fontSize || "medium");
          setAppearance(settings.appearance || "system");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const savedSettings = localStorage.getItem("themeSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const theme = themes.find(t => t.name === settings.themeName) || themes[0];
      const font = fonts.find(f => f.name === settings.fontName) || fonts[0];
      setSelectedTheme(theme);
      setSelectedFont(font);
      setFontSize(settings.fontSize || "medium");
      setAppearance(settings.appearance || "system");
    }
  }, []);

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const settings = {
        themeName: selectedTheme.name,
        fontName: selectedFont.name,
        fontSize,
        appearance,
        colors: selectedTheme.colors,
      };

      // Save to database
      await apiRequest("POST", "/api/settings", settings);

      // Update CSS variables
      document.documentElement.style.setProperty("--primary-color", settings.colors.primary);
      document.documentElement.style.setProperty("--secondary-color", settings.colors.secondary);
      document.documentElement.style.setProperty("--accent-color", settings.colors.accent);
      document.documentElement.style.setProperty("--font-family", selectedFont.family);
      document.documentElement.style.setProperty("--font-size-base", `${fontSizes[fontSize].base}px`);

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المظهر في قاعدة البيانات",
      });

      // Reload to apply changes
      window.location.reload();
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
        <CardDescription>
          قم بتخصيص مظهر التطبيق حسب تفضيلاتك
        </CardDescription>
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
                  key={theme.name}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedTheme.name === theme.name ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTheme(theme)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{theme.name}</CardTitle>
                      {selectedTheme.name === theme.name && (
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
                  key={font.name}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedFont.name === font.name ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFont(font)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{font.name}</CardTitle>
                      {selectedFont.name === font.name && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p
                      className="text-xl"
                      style={{ fontFamily: font.family }}
                    >
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
                          fontSize === size ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setFontSize(size)}
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
                    <div className="space-y-4" style={{
                      fontSize: `${fontSizes[fontSize].base}px`,
                      fontFamily: selectedFont.family
                    }}>
                      <h1 className="font-bold">عنوان رئيسي</h1>
                      <h2 className="font-semibold">عنوان فرعي</h2>
                      <p>هذا نص تجريبي لمعاينة حجم الخط المختار. يمكنك رؤية كيف سيظهر النص في مختلف العناصر.</p>
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
                  appearance === "light" ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAppearance("light")}
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
                  appearance === "dark" ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAppearance("dark")}
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
                  appearance === "system" ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAppearance("system")}
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