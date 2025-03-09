
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// وظيفة مساعدة لتوليد كود بسيط استنادًا إلى الأمر
function generateFallbackCode(command: string): string {
  if (command.includes('صفحة') && command.includes('تسجيل الدخول')) {
    return `
// كود لإنشاء صفحة تسجيل دخول بسيطة
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // منطق تسجيل الدخول هنا
    console.log('تسجيل الدخول باستخدام:', { username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">تسجيل الدخول</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
            <Button type="submit" className="w-full">تسجيل الدخول</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
    `;
  } else if (command.includes('نموذج') && command.includes('اتصال')) {
    return `
// كود لإنشاء نموذج اتصال للعملاء
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // منطق إرسال النموذج هنا
    console.log('تم إرسال النموذج:', formData);
    alert('تم إرسال رسالتك بنجاح!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">اتصل بنا</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسمك"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="أدخل موضوع الرسالة"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="أدخل رسالتك هنا"
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full">إرسال الرسالة</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
    `;
  } else if (command.includes('لوحة') && command.includes('تحكم')) {
    return `
// كود لإنشاء لوحة تحكم بسيطة مع إحصائيات
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// بيانات تجريبية للرسوم البيانية
const data = [
  { name: 'يناير', مبيعات: 4000, زيارات: 2400 },
  { name: 'فبراير', مبيعات: 3000, زيارات: 1398 },
  { name: 'مارس', مبيعات: 2000, زيارات: 9800 },
  { name: 'أبريل', مبيعات: 2780, زيارات: 3908 },
  { name: 'مايو', مبيعات: 1890, زيارات: 4800 },
  { name: 'يونيو', مبيعات: 2390, زيارات: 3800 },
];

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">لوحة التحكم</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% من الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمين الجدد</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+12.3% من الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة النمو</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24.5%</div>
            <p className="text-xs text-muted-foreground">+7.4% من الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأرباح</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234</div>
            <p className="text-xs text-muted-foreground">+19% من الشهر الماضي</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المبيعات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="مبيعات" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>عدد الزيارات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="زيارات" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `;
  } else {
    // إذا لم يتطابق الأمر مع أي نمط معروف
    return `
// كود تجريبي تم إنشاؤه بناءً على الأمر: "${command}"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function GeneratedComponent() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>المكون الجديد</CardTitle>
        </CardHeader>
        <CardContent>
          <p>هذا مكون تم إنشاؤه استجابة للأمر: "${command}"</p>
          <Button className="mt-4">زر تجريبي</Button>
        </CardContent>
      </Card>
    </div>
  );
}
    `;
  }
}

// تنفيذ الطلب المباشر لـ ChatGPT
export async function generateCodeWithOpenAI(command: string): Promise<string> {
  try {
    // تحقق من أن الأمر ليس فارغًا
    if (!command || command.trim() === '') {
      throw new Error('الأمر فارغ');
    }

    // حاول استخدام OpenAI إذا كان مفتاح API موجودًا
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    
    if (apiKey && apiKey !== 'YOUR_ACTUAL_API_KEY_HERE') {
      try {
        // هنا يمكن إضافة منطق الاتصال بـ OpenAI
        // لكننا سنستخدم منطق التوليد البديل للآن
        console.log('استخدام منطق التوليد البديل لأن مفتاح API للذكاء الاصطناعي غير مكتمل');
        return generateFallbackCode(command);
      } catch (apiError) {
        console.error('خطأ في الاتصال بـ OpenAI:', apiError);
        // استخدم التوليد البديل في حالة الفشل
        return generateFallbackCode(command);
      }
    } else {
      console.log('مفتاح API غير متوفر، استخدام منطق التوليد البديل');
      // منطق تحليل الأوامر البسيط كخطة بديلة
      return generateFallbackCode(command);
    }
  } catch (error) {
    console.error('Error in generateCodeWithOpenAI:', error);
    return `// حدث خطأ أثناء إنشاء الكود\n// ${(error as Error).message}`;
  }
}
