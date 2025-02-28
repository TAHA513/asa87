import React from 'react'
import { Button } from './button'
import { Input } from './input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

export const TestArabicComponents = () => {
  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>مكونات واجهة المستخدم العربية</CardTitle>
          <CardDescription>عرض توضيحي للمكونات المتجاوبة مع اللغة العربية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">الأزرار</h3>
            <div className="flex gap-2">
              <Button>زر أساسي</Button>
              <Button variant="outline">زر ثانوي</Button>
              <Button variant="destructive">زر حذف</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">حقول الإدخال</h3>
            <div className="space-y-2">
              <Input placeholder="أدخل نصاً هنا..." />
              <Input type="email" placeholder="البريد الإلكتروني" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">إلغاء</Button>
          <Button className="mr-2">حفظ التغييرات</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
