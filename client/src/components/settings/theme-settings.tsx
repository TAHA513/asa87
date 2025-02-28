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
import { apiRequest } from "@/lib/queryClient";

const themeColors = [
  // الألوان الأساسية
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

  // إضافة ألوان جديدة للثيمات
  { name: "أزرق داكن", value: "hsl(215.3 98.9% 27.8%)" },
  { name: "زهري فاتح", value: "hsl(350.4 89.2% 60.2%)" },
  { name: "أخضر زيتوني", value: "hsl(120.1 40.1% 39.2%)" },
  { name: "بني محمر", value: "hsl(15.3 75.3% 42.8%)" },
  { name: "رمادي دافئ", value: "hsl(200.4 15.3% 46.9%)" },
  { name: "أرجواني فاتح", value: "hsl(280.1 65.3% 70.8%)" }
];

const appearances = [
  { name: "فاتح", value: "light" },
  { name: "داكن", value: "dark" },
  { name: "تلقائي", value: "system" },
];

const variants = [
  { name: "حيوي", value: "vibrant" },
  { name: "هادئ", value: "professional" },
  { name: "ناعم", value: "tint" },
  // إضافة أنماط جديدة
  { name: "عصري", value: "modern" },
  { name: "كلاسيكي", value: "classic" },
  { name: "مستقبلي", value: "futuristic" },
  { name: "طبيعي", value: "natural" },
  { name: "مينيمال", value: "minimal" },
  { name: "عربي تقليدي", value: "traditional-arabic" }
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

const ThemeSettings = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState({
    primary: "hsl(142.1 76.2% 36.3%)",
    appearance: "system",
    variant: "vibrant",
    fontStyle: "traditional",
    radius: 0.75,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
  }, []);

  const saveTheme = async (updates: Partial<typeof theme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/theme", newTheme);

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

  const selectedFont = fontStyles.find(font => font.value === theme.fontStyle);

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
            value={theme.primary}
            onValueChange={(value) => saveTheme({ primary: value })}
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
            value={theme.variant}
            onValueChange={(value) => saveTheme({ variant: value })}
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
            value={theme.fontStyle}
            onValueChange={(value) => saveTheme({ fontStyle: value })}
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
            value={theme.appearance}
            onValueChange={(value) => saveTheme({ appearance: value })}
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
};

export default ThemeSettings;