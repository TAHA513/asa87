import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { HslColorPicker } from "react-colorful";
import { Label } from "@/components/ui/label";
import { CheckCircle, Palette, Type, Sun, Moon, Monitor } from "lucide-react";

const fontMapping = {
  "noto-kufi": "نوتو كوفي",
  "cairo": "القاهرة",
  "tajawal": "طجوال",
};

const appearanceMapping = {
  "light": "فاتح",
  "dark": "داكن",
  "system": "تلقائي",
};

const fontSizeMapping = {
  "small": "صغير",
  "medium": "متوسط", 
  "large": "كبير",
  "xlarge": "كبير جداً",
};

// القيم المسموح بها للمظهر
const variantOptions = [
  { id: "professional", name: "رسمي", description: "مظهر احترافي" },
  { id: "vibrant", name: "حيوي", description: "الوان نابضة بالحياة" },
  { id: "tint", name: "رمادي", description: "مظهر رمادي اللون" },
  { id: "modern", name: "عصري", description: "مظهر عصري" },
  { id: "classic", name: "كلاسيكي", description: "مظهر كلاسيكي" }
];

const themeSchema = z.object({
  primary: z.string(),
  variant: z.enum(["professional", "vibrant", "tint", "modern", "classic"]),
  appearance: z.enum(["light", "dark", "system"]),
  fontStyle: z.enum(["noto-kufi", "cairo", "tajawal"]),
  fontSize: z.enum(["small", "medium", "large", "xlarge"]),
  radius: z.number().min(0).max(2),
});

export default function ThemeSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hslColor, setHslColor] = useState("hsl(215.3 98.9% 27.8%)");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // جلب إعدادات السمة الحالية
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60, // 1 دقيقة
  });

  const form = useForm({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      primary: "hsl(215.3 98.9% 27.8%)",
      variant: "professional",
      appearance: "light",
      fontStyle: "noto-kufi",
      fontSize: "medium",
      radius: 0.5,
    },
  });

  // الحصول على قيم النموذج
  const watchedValues = form.watch();

  const saveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof themeSchema>) => {
      // حفظ في قاعدة البيانات
      const response = await apiRequest("POST", "/api/settings", data);

      // حفظ في ملف theme.json
      const themeResponse = await apiRequest("POST", "/api/theme", data);

      return response.json();
    },
    onMutate: () => {
      setSaveStatus("saving");
    },
    onSuccess: () => {
      setSaveStatus("success");
      // إعادة تعيين الحالة بعد ثانيتين
      setTimeout(() => setSaveStatus("idle"), 2000);
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      console.error("خطأ في حفظ الإعدادات:", error);
      setSaveStatus("error");
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات المظهر",
        variant: "destructive",
      });
      // إعادة تعيين الحالة بعد ثانيتين
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
  });

  useEffect(() => {
    if (settings) {
      // تعيين القيم من الإعدادات المستردة
      form.setValue("variant", settings.themeName || "professional");
      form.setValue("appearance", settings.appearance || "light");
      form.setValue("fontStyle", settings.fontName || "noto-kufi");
      form.setValue("fontSize", settings.fontSize || "medium");
      if (settings.colors?.primary) {
        form.setValue("primary", settings.colors.primary);
        setHslColor(settings.colors.primary);
      }
      form.setValue("radius", settings.radius || 0.5); // ليس ضمن الإعدادات المستردة
    }
  }, [settings, form]);

  useEffect(() => {
    // تحديث نموذج النموذج عند تغيير لون HSL
    form.setValue("primary", hslColor);
  }, [hslColor, form]);

  // تلقائياً حفظ التغييرات عند تغيير أي قيمة
  useEffect(() => {
    // منع تشغيل هذا عند التحميل الأولي
    if (isLoading) return;

    // إلغاء المؤقت السابق إذا كان موجوداً
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // تعيين مؤقت جديد للحفظ بعد 500 مللي ثانية من آخر تغيير
    const timeout = setTimeout(() => {
      const data = form.getValues();
      // التحقق من صحة البيانات قبل الحفظ
      if (themeSchema.safeParse(data).success) {
        saveMutation.mutate(data);
      }
    }, 700);

    setSaveTimeout(timeout);

    // التنظيف عند إزالة المكون
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [watchedValues, form, isLoading, saveMutation]);

  if (isLoading) {
    return <div className="p-8 flex justify-center">جاري تحميل الإعدادات...</div>;
  }

  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">إعدادات المظهر</h2>
          {saveStatus === "saving" && (
            <span className="text-sm text-muted-foreground animate-pulse">جاري الحفظ...</span>
          )}
          {saveStatus === "success" && (
            <span className="text-sm text-green-500 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> تم الحفظ
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-500">فشل الحفظ</span>
          )}
        </div>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>المظهر العام</CardTitle>
                <CardDescription>اختر مظهر التطبيق المفضل لديك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="appearance"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel>وضع العرض</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="light" id="light" />
                            <Label htmlFor="light" className="flex items-center">
                              <Sun className="me-2 h-4 w-4" /> فاتح
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="dark" id="dark" />
                            <Label htmlFor="dark" className="flex items-center">
                              <Moon className="me-2 h-4 w-4" /> داكن
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="system" id="system" />
                            <Label htmlFor="system" className="flex items-center">
                              <Monitor className="me-2 h-4 w-4" /> تلقائي (حسب الجهاز)
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variant"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel>نمط الألوان</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 gap-2"
                        >
                          {variantOptions.map((variant) => (
                            <div
                              key={variant.id}
                              className={`flex items-center border rounded-md p-2 cursor-pointer ${
                                field.value === variant.id
                                  ? "border-primary bg-primary/10"
                                  : "border-input"
                              }`}
                              onClick={() => field.onChange(variant.id)}
                            >
                              <div className="me-2">
                                <RadioGroupItem
                                  value={variant.id}
                                  id={variant.id}
                                  className="sr-only"
                                />
                              </div>
                              <div>
                                <Label htmlFor={variant.id} className="font-medium">
                                  {variant.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {variant.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>اللون الرئيسي</CardTitle>
                <CardDescription>اختر اللون الرئيسي للتطبيق</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <HslColorPicker color={hslColor} onChange={(newColor) => {
                      setHslColor(newColor);
                    }} />
                  </div>
                  <FormField
                    control={form.control}
                    name="primary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كود اللون</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input {...field} readOnly />
                            <div 
                              className="h-10 w-10 rounded-md border" 
                              style={{ backgroundColor: field.value }} 
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="radius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حجم الزوايا: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>النصوص</CardTitle>
                <CardDescription>إعدادات الخطوط وحجم النص</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fontStyle"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel>نوع الخط</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {Object.entries(fontMapping).map(([value, label]) => (
                            <div key={value} className="flex items-center space-x-2 space-x-reverse">
                              <RadioGroupItem value={value} id={`font-${value}`} />
                              <Label htmlFor={`font-${value}`} className="flex items-center">
                                <Type className="me-2 h-4 w-4" /> {label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fontSize"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel>حجم الخط</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {Object.entries(fontSizeMapping).map(([value, label]) => (
                            <div key={value} className="flex items-center space-x-2 space-x-reverse">
                              <RadioGroupItem value={value} id={`size-${value}`} />
                              <Label htmlFor={`size-${value}`}>{label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}