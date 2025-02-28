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

const themeColors = [
  // الألوان الحالية
  { name: "أخضر زمردي", value: "hsl(142.1 76.2% 36.3%)" },
  { name: "أزرق سماوي", value: "hsl(221.2 83.2% 53.3%)" },
  { name: "أرجواني ملكي", value: "hsl(262.1 83.3% 57.8%)" },
  { name: "برتقالي ذهبي", value: "hsl(20.5 90.2% 48.2%)" },
  { name: "أحمر ياقوتي", value: "hsl(346.8 77.2% 49.8%)" },
  // إضافة ألوان جديدة عصرية
  { name: "توركواز", value: "hsl(171.2 76.5% 36.6%)" },
  { name: "بنفسجي غامق", value: "hsl(280.1 81.3% 40.8%)" },
  { name: "أزرق نيلي", value: "hsl(213.8 93.9% 67.8%)" },
  { name: "وردي عصري", value: "hsl(330.4 81.2% 60.2%)" },
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
  // إضافة أنماط جديدة
  { name: "عصري", value: "modern" },
  { name: "كلاسيكي", value: "classic" },
  { name: "مستقبلي", value: "futuristic" },
];

const fontStyles = [
  { name: "تقليدي", value: "traditional", fontFamily: "Noto Kufi Arabic" },
  { name: "عصري", value: "modern", fontFamily: "Cairo" },
  { name: "مُبسط", value: "minimal", fontFamily: "IBM Plex Sans Arabic" },
  // إضافة خطوط جديدة
  { name: "رقمي", value: "digital", fontFamily: "Dubai" },
  { name: "أنيق", value: "elegant", fontFamily: "Amiri" },
  { name: "كوفي", value: "kufi", fontFamily: "Reem Kufi" },
  { name: "نسخ", value: "naskh", fontFamily: "Scheherazade New" },
  { name: "رقعة", value: "ruqaa", fontFamily: "Aref Ruqaa" },
  { name: "ثلث", value: "thuluth", fontFamily: "Harmattan" },
  { name: "معاصر", value: "contemporary", fontFamily: "Tajawal" }
];

export default function ThemeSettings() {
  const { toast } = useToast();
  const { theme: currentTheme, setTheme } = useTheme();
  const [themeSettings, setThemeSettings] = useState({
    primary: "hsl(142.1 76.2% 36.3%)",
    variant: "vibrant",
    fontStyle: "traditional",
    radius: 0.75,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("themeSettings");
      if (savedSettings) {
        setThemeSettings(JSON.parse(savedSettings));
      }
    } catch (e) {
      console.error('Error loading theme settings:', e);
    }
  }, []);

  const saveSettings = async (updates: Partial<typeof themeSettings>) => {
    const newSettings = { ...themeSettings, ...updates };
    setThemeSettings(newSettings);
    setIsLoading(true);

    try {
      localStorage.setItem("themeSettings", JSON.stringify(newSettings));

      toast({
        title: "تم الحفظ",
        description: "تم تحديث المظهر بنجاح",
      });

      // يجب إعادة تحميل الصفحة لتطبيق الخط الجديد
      if (updates.fontStyle) {
        window.location.reload();
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
      </CardContent>
    </Card>
  );
}