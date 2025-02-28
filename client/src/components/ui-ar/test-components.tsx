import React from 'react'
import { Button } from './button'
import { Input } from './input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Save, Trash2, Search, Plus } from 'lucide-react'

export const TestArabicComponents = () => {
  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>مكونات واجهة المستخدم العربية</CardTitle>
          <CardDescription>عرض توضيحي للمكونات المتجاوبة مع اللغة العربية مع الرموز التوضيحية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">الأزرار</h3>
            <div className="flex gap-2">
              <Button 
                tooltip="زر حفظ البيانات"
                showHelper
              >
                <Save className="w-4 h-4" />
                حفظ
              </Button>

              <Button 
                variant="destructive"
                tooltip="زر حذف العنصر"
                showHelper
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </Button>

              <Button 
                variant="outline"
                tooltip="زر إضافة عنصر جديد"
                showHelper
              >
                <Plus className="w-4 h-4" />
                إضافة
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">حقول الإدخال</h3>
            <div className="space-y-2">
              <Input 
                placeholder="البحث..." 
                tooltip="اكتب كلمات البحث هنا"
                showHelper
              />

              <Input 
                type="email" 
                placeholder="البريد الإلكتروني"
                helperText="سيتم استخدام هذا البريد للتواصل معك"
                tooltip="أدخل بريدك الإلكتروني"
                showHelper
              />

              <Input 
                type="tel" 
                placeholder="رقم الهاتف"
                helperText="أدخل رقم الهاتف مع رمز البلد"
                tooltip="مثال: 9647801234567+"
                showHelper
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline">إلغاء</Button>
          <Button>حفظ التغييرات</Button>
        </CardFooter>
      </Card>
    </div>
  )
}