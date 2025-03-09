
import React from 'react';
import { useTheme } from '@/lib/theme-manager';
import ColorPicker from './ColorPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const AppearanceSettings: React.FC = () => {
  const { theme, setTheme, saveThemeToServer } = useTheme();
  
  const handleAppearanceChange = (value: 'light' | 'dark' | 'system') => {
    setTheme({ appearance: value });
  };
  
  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme({ fontName: event.target.value });
  };
  
  const handleFontSizeChange = (value: 'small' | 'medium' | 'large' | 'xlarge') => {
    setTheme({ fontSize: value });
  };
  
  const handleSave = async () => {
    try {
      await saveThemeToServer();
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };
  
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">إعدادات المظهر</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>الوضع والمظهر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>وضع الألوان</Label>
              <RadioGroup 
                value={theme.appearance} 
                onValueChange={(value) => handleAppearanceChange(value as any)}
                className="flex space-x-4 space-x-reverse mt-2"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">فاتح</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">داكن</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">تلقائي (حسب النظام)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="fontName">الخط</Label>
              <Select 
                value={theme.fontName} 
                onValueChange={(value) => setTheme({ fontName: value })}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="اختر الخط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Tajawal">Tajawal</SelectItem>
                  <SelectItem value="Almarai">Almarai</SelectItem>
                  <SelectItem value="Vazirmatn">Vazirmatn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>حجم الخط</Label>
              <RadioGroup 
                value={theme.fontSize} 
                onValueChange={(value) => handleFontSizeChange(value as any)}
                className="flex flex-wrap gap-4 mt-2"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small" className="text-sm">صغير</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-base">متوسط</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large" className="text-lg">كبير</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="xlarge" id="xlarge" />
                  <Label htmlFor="xlarge" className="text-xl">كبير جداً</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ColorPicker />
      
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave}>حفظ جميع الإعدادات</Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
