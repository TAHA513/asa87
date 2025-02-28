import { useEffect, useState } from "react";
import { Check } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/hooks/use-theme";
import { Slider } from "@/components/ui/slider";

const themeColors = [
  { name: "أخضر زمردي", value: "hsl(142.1 76.2% 36.3%)" },
  { name: "أزرق سماوي", value: "hsl(224.5 82.6% 56.9%)" },
  { name: "أرجواني ملكي", value: "hsl(262.1 83.3% 57.8%)" },
  { name: "برتقالي ذهبي", value: "hsl(38 92% 50%)" },
  { name: "أحمر ياقوتي", value: "hsl(0 84.2% 60.2%)" },
  { name: "توركواز", value: "hsl(171.2 76.5% 36.6%)" },
  { name: "بنفسجي غامق", value: "hsl(280.1 81.3% 40.8%)" },
  { name: "رمادي أزرق", value: "hsl(215.4 30.3% 46.9%)" },
  { name: "أخضر نعناعي", value: "hsl(160.1 84.1% 39.2%)" },
  { name: "كهرماني", value: "hsl(25.3 95.3% 52.8%)" },
];

const appearances = [
  { name: "فاتح", value: "light" },
  { name: "داكن", value: "dark" },
  { name: "تركيز", value: "focus" },
];

const variants = [
  { name: "حيوي", value: "vibrant" },
  { name: "هادئ", value: "professional" },
  { name: "ناعم", value: "tint" },
];

const fontStyles = [
  { name: "تقليدي", value: "traditional", fontFamily: "Noto Kufi Arabic" },
  { name: "عصري", value: "modern", fontFamily: "Cairo" },
  { name: "مُبسط", value: "minimal", fontFamily: "IBM Plex Sans Arabic" },
];

export default function ThemeSettings() {
  const { toast } = useToast();
  const { theme: currentTheme, setTheme } = useTheme();
  const [themeSettings, setThemeSettings] = useState({
    primary: "hsl(142.1 76.2% 36.3%)",
    variant: "vibrant",
    fontStyle: "traditional",
    radius: 0.75,
    brightness: 85, // إضافة تحكم في السطوع
    contrast: 100, // إضافة تحكم في التباين
    blueLight: 75, // إضافة تحكم في الضوء الأزرق
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("themeSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setThemeSettings(settings);
        applyThemeSettings(settings);
      }
    } catch (e) {
      console.error('Error loading theme settings:', e);
    }
  }, []);

  const applyThemeSettings = (settings: typeof themeSettings) => {
    const root = document.documentElement;

    // تطبيق اللون الرئيسي
    root.style.setProperty('--primary', settings.primary);
    root.style.setProperty('--theme-radius', `${settings.radius}rem`);
    root.style.setProperty('--font-family', 
      fontStyles.find(f => f.value === settings.fontStyle)?.fontFamily || 'Noto Kufi Arabic'
    );

    // تطبيق النمط
    root.setAttribute('data-theme-variant', settings.variant);

    // تطبيق إعدادات تخفيف إجهاد العين
    if (currentTheme === 'focus') {
      root.style.setProperty('--theme-brightness', `${settings.brightness}%`);
      root.style.setProperty('--theme-contrast', `${settings.contrast}%`);
      root.style.setProperty('--theme-blue-light', `${settings.blueLight}%`);

      // إضافة فلتر CSS لتخفيف إجهاد العين
      root.style.filter = `
        brightness(${settings.brightness}%) 
        contrast(${settings.contrast}%)
        sepia(20%)
        hue-rotate(180deg)
        grayscale(10%)
      `;
    } else {
      root.style.filter = 'none';
    }

    // تحديث متغيرات CSS حسب النمط
    switch (settings.variant) {
      case 'professional':
        root.style.setProperty('--primary-saturation', '30%');
        root.style.setProperty('--primary-lightness', '50%');
        break;
      case 'tint':
        root.style.setProperty('--primary-saturation', '70%');
        root.style.setProperty('--primary-lightness', '80%');
        break;
      case 'vibrant':
      default:
        root.style.setProperty('--primary-saturation', '100%');
        root.style.setProperty('--primary-lightness', '60%');
        break;
    }
  };

  const saveSettings = async (updates: Partial<typeof themeSettings>) => {
    const newSettings = { ...themeSettings, ...updates };
    setThemeSettings(newSettings);
    setIsLoading(true);

    try {
      localStorage.setItem("themeSettings", JSON.stringify(newSettings));
      applyThemeSettings(newSettings);

      toast({
        title: "تم الحفظ",
        description: "تم تحديث المظهر بنجاح",
      });

      if (updates.fontStyle) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedFont = fontStyles.find(font => font.value === themeSettings.fontStyle);

  return (
    <Card>
      <CardHeader>
        <CardTitle>المظهر</CardTitle>
        <CardDescription>
          خصص مظهر التطبيق حسب تفضيلاتك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>اللون الرئيسي</Label>
          <RadioGroup
            value={themeSettings.primary}
            onValueChange={(value) => saveSettings({ primary: value })}
            className="grid grid-cols-2 gap-4"
            disabled={isLoading}
          >
            {themeColors.map((color) => (
              <Label
                key={color.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <RadioGroupItem value={color.value} id={color.value} />
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
                {color.name}
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>نمط المظهر</Label>
          <Select
            value={themeSettings.variant}
            onValueChange={(value) => saveSettings({ variant: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem key={variant.value} value={variant.value}>
                  {variant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>نمط الخط</Label>
          <Select
            value={themeSettings.fontStyle}
            onValueChange={(value) => saveSettings({ fontStyle: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontStyles.map((style) => (
                <SelectItem 
                  key={style.value} 
                  value={style.value}
                  style={{ fontFamily: style.fontFamily }}
                >
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFont && (
            <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: selectedFont.fontFamily }}>
              معاينة الخط: أبجد هوز حطي كلمن
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>وضع السطوع</Label>
          <Select
            value={currentTheme}
            onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'focus')}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {appearances.map((appearance) => (
                <SelectItem key={appearance.value} value={appearance.value}>
                  {appearance.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentTheme === 'focus' && (
          <>
            <div className="space-y-2">
              <Label>مستوى السطوع</Label>
              <Slider
                value={[themeSettings.brightness]}
                onValueChange={([value]) => saveSettings({ brightness: value })}
                min={50}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>مستوى التباين</Label>
              <Slider
                value={[themeSettings.contrast]}
                onValueChange={([value]) => saveSettings({ contrast: value })}
                min={75}
                max={125}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>تقليل الضوء الأزرق</Label>
              <Slider
                value={[themeSettings.blueLight]}
                onValueChange={([value]) => saveSettings({ blueLight: value })}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}