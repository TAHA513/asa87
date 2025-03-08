
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// تنفيذ الطلب المباشر لـ ChatGPT
export async function generateCodeWithOpenAI(command: string): Promise<string> {
  try {
    // تحقق من أن الأمر ليس فارغًا
    if (!command || command.trim() === '') {
      throw new Error('الأمر فارغ');
    }

    // منطق تحليل الأوامر البسيط كخطة بديلة
    return generateFallbackCode(command);
  } catch (error) {
    console.error('Error in generateCodeWithOpenAI:', error);
    return `// حدث خطأ أثناء إنشاء الكود\n// ${(error as Error).message}\n\n// استخدام منطق بديل...\n${generateFallbackCode(command)}`;
  }
}

// منطق بديل لإنشاء أكواد بسيطة بناءً على كلمات مفتاحية
function generateFallbackCode(command: string): string {
  // أساسيات إنشاء الأكواد بناءً على نوع التطبيق المطلوب
  if (command.includes('إنشاء نموذج') || command.includes('create form')) {
    return `
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// تعريف مخطط التحقق من الصحة باستخدام zod
const formSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يكون الاسم حرفين على الأقل" }),
  email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
});

export function ContactForm() {
  // إعداد نموذج react-hook-form مع مدقق zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // معالج التقديم
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // هنا يمكنك إضافة المنطق لإرسال البيانات إلى الخادم
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسمك" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input placeholder="أدخل بريدك الإلكتروني" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">إرسال</Button>
      </form>
    </Form>
  );
}
    `;
  }

  if (command.includes('إضافة جدول') || command.includes('انشاء جدول') || command.includes('عرض بيانات')) {
    return `
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const demoData = [
  { id: 1, name: "محمد أحمد", email: "mohamed@example.com", status: "نشط" },
  { id: 2, name: "فاطمة محمد", email: "fatima@example.com", status: "غير نشط" },
  { id: 3, name: "أحمد علي", email: "ahmed@example.com", status: "نشط" },
  { id: 4, name: "نورا حسن", email: "noura@example.com", status: "معلق" },
  { id: 5, name: "خالد عمر", email: "khaled@example.com", status: "نشط" },
];

export function DataTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>قائمة المستخدمين</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">الرقم</TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {demoData.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
    `;
  }

  if (command.includes('إضافة إحصائيات') || command.includes('إضافة لوحة قيادة') || command.includes('dashboard')) {
    return `
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleIcon, TrendingUpIcon, UserIcon, DollarSignIcon } from "lucide-react";

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">+4.6% من الشهر الماضي</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">العملاء الجدد</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+127</div>
          <p className="text-xs text-muted-foreground">+14.2% من الشهر الماضي</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الطلبات الجديدة</CardTitle>
          <CircleIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+573</div>
          <p className="text-xs text-muted-foreground">+12.3% من الشهر الماضي</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">نسبة النمو</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+24.5%</div>
          <p className="text-xs text-muted-foreground">+7.4% من الشهر الماضي</p>
        </CardContent>
      </Card>
    </div>
  );
}
    `;
  }

  // إذا لم يتم التعرف على أي أمر محدد
  return `
// كود تجريبي تم إنشاؤه بناءً على الأمر: "${command}"
// يمكنك تعديل هذا الكود حسب احتياجاتك

/**
 * إنشاء مكون React بسيط
 */
import React, { useState } from 'react';

export function GeneratedComponent() {
  const [counter, setCounter] = useState(0);
  
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">مكون تجريبي</h2>
      <p className="mb-4">العداد الحالي: {counter}</p>
      
      <div className="flex gap-2">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => setCounter(counter + 1)}
        >
          زيادة
        </button>
        
        <button 
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          onClick={() => setCounter(0)}
        >
          إعادة تعيين
        </button>
      </div>
    </div>
  );
}
  `;
}
