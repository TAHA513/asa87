import { useEffect, useState } from "react";
import { Check, Palette, Type, Moon, Sun, Monitor, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

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
  const [appearance, setAppearance] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(false);

  const applyAppearance = (mode: "light" | "dark") => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    root.style.setProperty("--current-appearance", mode);
  };

  useEffect(() => {
    // تطبيق المظهر المحدد عند تحميل المكون
    applyAppearance(appearance);
  }, [appearance]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiRequest("GET", "/api/settings");
        if (response) {
          const theme = themes.find(t => t.id === response.variant) || themes[0];
          const font = fonts.find(f => f.id === response.fontStyle) || fonts[0];
          setSelectedTheme(theme);
          setSelectedFont(font);
          setFontSize(response.fontSize || "medium");
          setAppearance(response.appearance || "system");
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
        variant: selectedTheme.id,
        fontStyle: selectedFont.id,
        fontSize,
        appearance,
        radius: 0.5,
      };

      const response = await apiRequest("POST", "/api/settings", settings);

      if (response) {
        document.documentElement.style.setProperty("--primary-color", selectedTheme.colors.primary);
        document.documentElement.style.setProperty("--secondary-color", selectedTheme.colors.secondary);
        document.documentElement.style.setProperty("--accent-color", selectedTheme.colors.accent);
        document.documentElement.style.setProperty("--font-family", selectedFont.family);
        document.documentElement.style.setProperty("--font-size-base", `${fontSizes[fontSize].base}px`);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardHeader className="space-y-2 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl font-bold">تخصيص المظهر</CardTitle>
          <CardDescription className="text-base">
            قم بتخصيص مظهر التطبيق حسب تفضيلاتك
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            {[
              { value: "theme", icon: <Palette className="w-4 h-4" />, label: "الألوان" },
              { value: "font", icon: <Type className="w-4 h-4" />, label: "الخطوط" },
              { value: "size", icon: <Plus className="w-4 h-4" />, label: "الحجم" },
              { value: "appearance", icon: <Sun className="w-4 h-4" />, label: "السطوع" }
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 py-2 px-4"
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <TabsContent value="theme">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <motion.div
                    key={theme.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedTheme.id === theme.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedTheme(theme);
                        document.documentElement.style.setProperty("--primary-color", theme.colors.primary);
                        document.documentElement.style.setProperty("--secondary-color", theme.colors.secondary);
                        document.documentElement.style.setProperty("--accent-color", theme.colors.accent);
                      }}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">{theme.name}</CardTitle>
                          {selectedTheme.id === theme.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex gap-2">
                          {Object.entries(theme.colors).map(([key, color]) => (
                            <div
                              key={key}
                              className="w-8 h-8 rounded-full shadow-inner"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="font">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fonts.map((font) => (
                  <motion.div
                    key={font.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedFont.id === font.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedFont(font);
                        document.documentElement.style.setProperty("--font-family", font.family);
                      }}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">{font.name}</CardTitle>
                          {selectedFont.id === font.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p
                          className="text-xl leading-relaxed"
                          style={{ fontFamily: font.family }}
                        >
                          {font.preview}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="size">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium">حجم الخط</CardTitle>
                  <CardDescription>اختر حجم الخط المناسب للعرض</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(fontSizes).map(([size, config]) => (
                        <motion.div
                          key={size}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`cursor-pointer p-4 hover:shadow-lg ${
                              fontSize === size ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => {
                              setFontSize(size);
                              document.documentElement.style.setProperty("--font-size-base", `${config.base}px`);
                            }}
                          >
                            <div className="text-center">
                              <div 
                                className="mb-2 font-medium"
                                style={{ fontSize: `${config.base}px` }}
                              >
                                نص تجريبي
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {size === "small" && "صغير"}
                                {size === "medium" && "متوسط"}
                                {size === "large" && "كبير"}
                                {size === "xlarge" && "كبير جداً"}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-medium">معاينة الحجم</Label>
                      <div 
                        className="space-y-4 p-6 bg-card rounded-lg"
                        style={{
                          fontSize: `${fontSizes[fontSize as keyof typeof fontSizes].base}px`,
                          fontFamily: selectedFont.family
                        }}
                      >
                        <h1 className="text-2xl font-bold">عنوان رئيسي</h1>
                        <h2 className="text-xl font-semibold">عنوان فرعي</h2>
                        <p className="leading-relaxed">
                          هذا نص تجريبي لمعاينة حجم الخط المختار. يمكنك رؤية كيف سيظهر النص في مختلف العناصر.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "light", name: "فاتح", icon: Sun },
                  { id: "dark", name: "داكن", icon: Moon }
                ].map((mode) => (
                  <motion.div
                    key={mode.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        appearance === mode.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setAppearance(mode.id as "light" | "dark");
                        applyAppearance(mode.id as "light" | "dark");
                      }}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">{mode.name}</CardTitle>
                          {appearance === mode.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <mode.icon className="w-8 h-8" />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </motion.div>
        </Tabs>

        <motion.div
          className="mt-8 flex justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? "جارِ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;