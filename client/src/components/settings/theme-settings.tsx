import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import { useTheme } from "@/lib/theme-provider";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ThemeSettings } from "@/lib/theme-service";
import { Moon, Sun, Palette, Monitor, Type, Circle } from "lucide-react";

// مكون دوائر الألوان المختارة مسبقًا
const ColorCircle = ({ color, onClick, isSelected }: 
  { color: string; onClick: () => void; isSelected: boolean }
) => (
  <button
    className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${
      isSelected ? "ring-2 ring-primary ring-offset-2" : ""
    }`}
    style={{ backgroundColor: color }}
    onClick={onClick}
  />
);

export default function ThemeSettings() {
  const { theme, updateTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  // الألوان المختارة مسبقًا
  const presetColors = [
    "hsl(215.3 98.9% 27.8%)", // أزرق
    "hsl(349 90.9% 45.1%)",   // أحمر
    "hsl(142.1 76.2% 36.3%)", // أخضر
    "hsl(261 73.7% 50.7%)",   // بنفسجي
    "hsl(24.6 95% 53.1%)",    // برتقالي
    "hsl(47.9 95.8% 53.1%)",  // أصفر
    "hsl(198 93.2% 59.6%)",   // أزرق فاتح
    "hsl(0 0% 9%)"            // أسود
  ];

  // التصاميم المتوفرة
  const variants = [
    { id: "professional", name: "مهني" },
    { id: "vibrant", name: "نابض بالحياة" },
    { id: "tint", name: "الرمادي" },
    { id: "modern", name: "عصري" },
    { id: "classic", name: "كلاسيكي" },
    { id: "futuristic", name: "مستقبلي" },
    { id: "elegant", name: "أنيق" },
    { id: "natural", name: "طبيعي" }
  ];

  // حفظ الإعدادات
  const saveSettings = async () => {
    try {
      // سيتم التعامل مع الحفظ داخليًا من خلال useTheme hook
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("خطأ في حفظ الإعدادات:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  // تغيير اللون الأساسي
  const changePrimaryColor = (color: string) => {
    updateTheme({ primary: color });
    setColorPickerOpen(false);
  };

  // تغيير الظهور (فاتح/داكن)
  const changeAppearance = (value: "light" | "dark" | "system") => {
    updateTheme({ appearance: value });
  };

  // تغيير أسلوب التصميم
  const changeVariant = (value: string) => {
    updateTheme({ variant: value as ThemeSettings["variant"] });
  };

  // تغيير نوع الخط
  const changeFontStyle = (value: string) => {
    updateTheme({ fontStyle: value as ThemeSettings["fontStyle"] });
  };

  // تغيير حجم الخط
  const changeFontSize = (value: string) => {
    updateTheme({ fontSize: value as ThemeSettings["fontSize"] });
  };

  // تغيير دائرية الزوايا
  const changeRadius = (value: number[]) => {
    updateTheme({ radius: value[0] });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>تخصيص الواجهة</CardTitle>
        <CardDescription>
          قم بتخصيص مظهر التطبيق ليناسب تفضيلاتك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>الألوان والمظهر</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>الخطوط</span>
            </TabsTrigger>
            <TabsTrigger value="interface" className="flex items-center gap-2">
              <Circle className="h-4 w-4" />
              <span>الواجهة</span>
            </TabsTrigger>
          </TabsList>

          {/* قسم الألوان والمظهر */}
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-3">
              <Label>اللون الأساسي</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-16 h-10 border-2"
                  style={{ backgroundColor: theme.primary }}
                  onClick={() => setColorPickerOpen(!colorPickerOpen)}
                />
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((color) => (
                    <ColorCircle
                      key={color}
                      color={color}
                      isSelected={theme.primary === color}
                      onClick={() => changePrimaryColor(color)}
                    />
                  ))}
                </div>
              </div>

              {colorPickerOpen && (
                <div className="py-2">
                  <HexColorPicker 
                    color={theme.primary} 
                    onChange={changePrimaryColor}
                    className="w-full mx-auto"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>أسلوب الألوان</Label>
              <RadioGroup 
                className="grid grid-cols-2 sm:grid-cols-4 gap-2" 
                value={theme.variant}
                onValueChange={changeVariant}
              >
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`relative rounded-md border p-2 flex items-center gap-2 cursor-pointer hover:bg-muted transition-colors ${
                      theme.variant === variant.id ? "border-primary" : "border-border"
                    }`}
                    onClick={() => changeVariant(variant.id)}
                  >
                    <RadioGroupItem value={variant.id} id={variant.id} className="sr-only" />
                    <div
                      className={`w-5 h-5 rounded-full theme-${variant.id}`}
                      style={{ 
                        backgroundColor: variant.id === "tint" 
                          ? "hsl(0 0% 40%)" 
                          : `var(--${variant.id === theme.variant ? "primary" : variant.id})` 
                      }}
                    />
                    <label htmlFor={variant.id} className="text-sm cursor-pointer flex-1">
                      {variant.name}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>مظهر التطبيق</Label>
              <RadioGroup 
                className="grid grid-cols-3 gap-2" 
                value={theme.appearance}
                onValueChange={(value) => changeAppearance(value as "light" | "dark" | "system")}
              >
                <div
                  className={`relative rounded-md border p-2 flex items-center gap-2 cursor-pointer hover:bg-muted transition-colors ${
                    theme.appearance === "light" ? "border-primary" : "border-border"
                  }`}
                  onClick={() => changeAppearance("light")}
                >
                  <RadioGroupItem value="light" id="light" className="sr-only" />
                  <Sun className="h-4 w-4" />
                  <label htmlFor="light" className="text-sm cursor-pointer">
                    فاتح
                  </label>
                </div>
                <div
                  className={`relative rounded-md border p-2 flex items-center gap-2 cursor-pointer hover:bg-muted transition-colors ${
                    theme.appearance === "dark" ? "border-primary" : "border-border"
                  }`}
                  onClick={() => changeAppearance("dark")}
                >
                  <RadioGroupItem value="dark" id="dark" className="sr-only" />
                  <Moon className="h-4 w-4" />
                  <label htmlFor="dark" className="text-sm cursor-pointer">
                    داكن
                  </label>
                </div>
                <div
                  className={`relative rounded-md border p-2 flex items-center gap-2 cursor-pointer hover:bg-muted transition-colors ${
                    theme.appearance === "system" ? "border-primary" : "border-border"
                  }`}
                  onClick={() => changeAppearance("system")}
                >
                  <RadioGroupItem value="system" id="system" className="sr-only" />
                  <Monitor className="h-4 w-4" />
                  <label htmlFor="system" className="text-sm cursor-pointer">
                    تلقائي
                  </label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          {/* قسم الخطوط */}
          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-3">
              <Label>نوع الخط</Label>
              <Select value={theme.fontStyle} onValueChange={changeFontStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الخط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noto-kufi">نوتو كوفي</SelectItem>
                  <SelectItem value="cairo">القاهرة</SelectItem>
                  <SelectItem value="tajawal">طجوال</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>حجم الخط</Label>
              <Select value={theme.fontSize} onValueChange={changeFontSize}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر حجم الخط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">صغير</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="large">كبير</SelectItem>
                  <SelectItem value="xlarge">كبير جدًا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* قسم الواجهة */}
          <TabsContent value="interface" className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>دائرية الزوايا</Label>
                <span className="text-sm text-muted-foreground">
                  {theme.radius} ريم
                </span>
              </div>
              <Slider 
                value={[theme.radius]} 
                min={0} 
                max={2} 
                step={0.1} 
                onValueChange={changeRadius} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}