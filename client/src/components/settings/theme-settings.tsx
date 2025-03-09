import React, { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { themes } from "@/lib/themes";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [previewTheme, setPreviewTheme] = useState(theme);

  const handleThemeChange = (value: string) => {
    setPreviewTheme(value);
  };

  const handleApplyTheme = () => {
    setTheme(previewTheme);
  };

  const colorThemes = [
    {
      name: "الافتراضي",
      value: "light",
      description: "سمة فاتحة مع ألوان رئيسية زرقاء",
      preview: "default",
    },
    {
      name: "الوضع الداكن",
      value: "dark",
      description: "سمة داكنة مع ألوان رئيسية زرقاء",
      preview: "dark",
    },
    {
      name: "بسيط",
      value: "minimal",
      description: "سمة بسيطة بألوان محايدة",
      preview: "minimal",
    },
    {
      name: "أخضر طبيعي",
      value: "natural",
      description: "سمة مستوحاة من الطبيعة بألوان خضراء",
      preview: "natural",
    },
    {
      name: "وردي زاهي",
      value: "pastel",
      description: "سمة وردية ناعمة",
      preview: "pastel",
    },
    {
      name: "بنفسجي ملكي",
      value: "royal",
      description: "سمة بألوان بنفسجية ملكية",
      preview: "royal",
    },
    {
      name: "برتقالي مشرق",
      value: "orange",
      description: "سمة برتقالية مشرقة ودافئة",
      preview: "orange",
    },
    {
      name: "أزرق داكن",
      value: "navy",
      description: "سمة بألوان أزرق داكن",
      preview: "navy",
    },
    {
      name: "طبيعي",
      value: "natural",
      description: "سمة مستوحاة من الألوان الطبيعية",
      preview: "natural",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات المظهر</CardTitle>
        <CardDescription>
          تخصيص مظهر التطبيق باختيار سمة من السمات المتاحة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme">السمة</Label>
          <Select
            value={previewTheme}
            onValueChange={handleThemeChange}
          >
            <SelectTrigger id="theme" className="w-full">
              <SelectValue placeholder="اختر سمة" />
            </SelectTrigger>
            <SelectContent>
              {colorThemes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>معاينة</Label>
          <div className="mt-2 h-24 rounded-md border p-4 relative">
            <div
              className={`absolute inset-0 rounded-md transition-all ${
                themes[previewTheme as keyof typeof themes]?.previewClass || ""
              }`}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleApplyTheme} className="w-full">
          تطبيق السمة
        </Button>
      </CardFooter>
    </Card>
  );
}