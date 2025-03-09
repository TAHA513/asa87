import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useTheme, ThemeColors } from '@/lib/theme-manager';
import { useToast } from '@/hooks/use-toast';

type ColorKey = keyof ThemeColors;

const colorLabels: Record<ColorKey, string> = {
  primary: 'اللون الأساسي',
  secondary: 'اللون الثانوي',
  accent: 'لون التمييز',
  background: 'لون الخلفية',
  text: 'لون النص',
  border: 'لون الحدود'
};

const ColorPicker: React.FC = () => {
  const { theme, setColors, saveThemeToServer, resetTheme } = useTheme();
  const { toast } = useToast();
  const [activeColor, setActiveColor] = useState<ColorKey>('primary');
  const [showPicker, setShowPicker] = useState(false);

  const handleColorClick = (colorKey: ColorKey) => {
    setActiveColor(colorKey);
    setShowPicker(true);
  };

  const handleColorChange = (color: any) => {
    setColors({ [activeColor]: color.hex });
  };

  const handleSave = async () => {
    try {
      await saveThemeToServer();
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
      });
    }
  };

  const handleReset = () => {
    resetTheme();
    toast({
      title: "تم إعادة الضبط",
      description: "تم إعادة ضبط الإعدادات للقيم الافتراضية",
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>تخصيص الألوان</CardTitle>
        <CardDescription>اختر الألوان المناسبة لتخصيص واجهة التطبيق</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(colorLabels).map(([key, label]) => (
            <div 
              key={key}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleColorClick(key as ColorKey)}
            >
              <div 
                className="w-16 h-16 rounded-full mb-2 border-2 transition-all hover:scale-110"
                style={{ 
                  backgroundColor: theme.colors[key as ColorKey],
                  borderColor: activeColor === key ? '#000' : 'transparent'
                }}
              />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>

        {showPicker && (
          <div className="flex flex-col items-center mt-4">
            <h3 className="mb-2 text-lg font-medium">{colorLabels[activeColor]}</h3>
            <SketchPicker 
              color={theme.colors[activeColor]}
              onChange={handleColorChange}
              disableAlpha={true}
              presetColors={[
                '#4CAF50', '#2196F3', '#FF5722', '#9C27B0',
                '#FFEB3B', '#FF9800', '#795548', '#607D8B',
                '#000000', '#FFFFFF', '#E91E63', '#CDDC39'
              ]}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          إعادة للافتراضي
        </Button>
        <Button variant="default" onClick={handleSave}>
          حفظ الإعدادات
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ColorPicker;