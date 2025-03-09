import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Palette, Sun, Type, Maximize, Moon, Laptop } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";

const themes = [
  {
    id: "modern",
    name: "عصري",
    colors: {
      primary: "hsl(142.1 76.2% 36.3%)",
      secondary: "hsl(164.3 76.2% 46.3%)",
      accent: "hsl(120.1 40.1% 36.3%)",
    },
  },
  {
    id: "classic",
    name: "كلاسيكي",
    colors: {
      primary: "hsl(215.3 98.9% 27.8%)",
      secondary: "hsl(215.3 98.9% 37.8%)",
      accent: "hsl(215.3 68.9% 47.8%)",
    },
  },
  {
    id: "elegant",
    name: "أنيق",
    colors: {
      primary: "hsl(273.1 70.1% 40.2%)",
      secondary: "hsl(273.1 70.1% 50.2%)",
      accent: "hsl(303.1 70.1% 50.2%)",
    },
  },
  {
    id: "vibrant",
    name: "نابض بالحياة",
    colors: {
      primary: "hsl(349 90.9% 45.1%)",
      secondary: "hsl(349 90.9% 55.1%)",
      accent: "hsl(19 90.9% 55.1%)",
    },
  },
  {
    id: "natural",
    name: "طبيعي",
    colors: {
      primary: "hsl(120.1 40.1% 39.2%)",
      secondary: "hsl(120.1 40.1% 49.2%)",
      accent: "hsl(150.1 40.1% 49.2%)",
    },
  },
];

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
  },
];

const appearanceModes = [
  {
    id: "light",
    name: "فاتح",
    icon: Sun,
  },
  {
    id: "dark",
    name: "داكن",
    icon: Moon,
  },
  {
    id: "system",
    name: "تلقائي (حسب النظام)",
    icon: Laptop,
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
  const [currentSettings, setCurrentSettings] = useState(null);

  // استرجاع الإعدادات الحالية عند بدء تحميل المكون
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiRequest("GET", "/api/settings");
        const data = await response.json();

        if (data) {
          // تحديث حالة المكون بناءً على الإعدادات المسترجعة
          const themeObj = themes.find(t => t.id === data.themeName) || themes[0];
          const fontObj = fonts.find(f => f.id === data.fontName) || fonts[0];

          setSelectedTheme(themeObj);
          setSelectedFont(fontObj);
          setFontSize(data.fontSize || "medium");
          setAppearance(data.appearance || "system");
          setCurrentSettings(data);

          // تطبيق الإعدادات على واجهة المستخدم
          applySettingsToUI(themeObj, fontObj, data.fontSize, data.appearance);
        }
      } catch (error) {
        console.error("فشل في استرجاع الإعدادات:", error);
      }
    };

    fetchSettings();
  }, []);

  // تطبيق السطوع المختار
  const applyAppearance = (mode: "light" | "dark" | "system") => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }

    // تحديث متغير CSS وحفظ الإعداد في localStorage
    root.style.setProperty("--current-appearance", mode);
    localStorage.setItem("theme-appearance", mode);
  };

  // تطبيق الإعدادات على واجهة المستخدم
  const applySettingsToUI = (theme, font, size, mode) => {
    document.documentElement.style.setProperty("--primary-color", theme.colors.primary);
    document.documentElement.style.setProperty("--secondary-color", theme.colors.secondary);
    document.documentElement.style.setProperty("--accent-color", theme.colors.accent);
    document.documentElement.style.setProperty("--font-family", font.family);
    document.documentElement.style.setProperty("--font-size-base", `${fontSizes[size].base}px`);

    applyAppearance(mode);
  };

  // اختيار وتطبيق السمة
  const selectTheme = (theme) => {
    setSelectedTheme(theme);
    document.documentElement.style.setProperty("--primary-color", theme.colors.primary);
    document.documentElement.style.setProperty("--secondary-color", theme.colors.secondary);
    document.documentElement.style.setProperty("--accent-color", theme.colors.accent);
  };

  // اختيار وتطبيق الخط
  const selectFont = (font) => {
    setSelectedFont(font);
    document.documentElement.style.setProperty("--font-family", font.family);
  };

  // اختيار وتطبيق حجم الخط
  const selectFontSize = (size) => {
    setFontSize(size);
    document.documentElement.style.setProperty(
      "--font-size-base",
      `${fontSizes[size].base}px`
    );
  };

  // اختيار وتطبيق السطوع
  const selectAppearance = (mode) => {
    setAppearance(mode);
    applyAppearance(mode);
  };

  // حفظ الإعدادات
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
      const data = await response.json();

      if (data.success) {
        // تأكد من تطبيق الإعدادات
        applySettingsToUI(selectedTheme, selectedFont, fontSize, appearance);

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
              { value: "size", icon: <Maximize className="w-4 h-4" />, label: "الحجم" },
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
            {/* محتوى تبويب السمات */}
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
                      onClick={() => selectTheme(theme)}
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
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: theme.colors.secondary }}
                          />
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* محتوى تبويب الخطوط */}
            <TabsContent value="font">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      onClick={() => selectFont(font)}
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
                        <p style={{ fontFamily: font.family }}>
                          هذا النص سيظهر بخط {font.name}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* محتوى تبويب الحجم */}
            <TabsContent value="size">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(fontSizes).map(([size, data]) => (
                  <motion.div
                    key={size}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        fontSize === size ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => selectFontSize(size)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-medium">
                            {size === 'small' && 'صغير'}
                            {size === 'medium' && 'متوسط'}
                            {size === 'large' && 'كبير'}
                            {size === 'xlarge' && 'كبير جداً'}
                          </CardTitle>
                          {fontSize === size && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p style={{ fontSize: `${data.base}px` }}>
                          نموذج النص {data.base}px
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* محتوى تبويب السطوع */}
            <TabsContent value="appearance">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {appearanceModes.map((mode) => (
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
                      onClick={() => selectAppearance(mode.id as "light" | "dark" | "system")}
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

          <div className="flex justify-end mt-6">
            <Button
              onClick={saveSettings}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;