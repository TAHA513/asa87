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
    console.log('تسجيل الدخول باستخدام:', { username, password });
    // هنا يمكن إضافة منطق تسجيل الدخول الفعلي
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
// كود لإنشاء نموذج اتصال بسيط
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
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
    console.log('إرسال النموذج:', formData);
    // هنا يمكن إضافة منطق إرسال النموذج
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>اتصل بنا</CardTitle>
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
  } else {
    return `
// كود لإنشاء مكون عام
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

    // حاول استخدام Groq أو OpenAI إذا كان مفتاح API موجودًا
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;

    if (apiKey && apiKey !== 'YOUR_ACTUAL_API_KEY_HERE') {
      try {
        console.log('جاري استخدام Groq API لتوليد الكود...');

        // استخدام Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              { 
                role: 'system', 
                content: 'أنت مساعد مطور محترف متخصص في إنشاء كود React/Next.js/TypeScript بناءً على وصف المستخدم. قدم كودًا عالي الجودة مع تعليقات مفيدة باللغة العربية.' 
              },
              { 
                role: 'user', 
                content: `قم بإنشاء كود لمكون React/TypeScript يلبي الوصف التالي: ${command}` 
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          })
        });

        if (!response.ok) {
          throw new Error(`فشل الاتصال بـ Groq API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const generatedCode = data.choices[0].message.content;
        console.log('تم توليد الكود بنجاح باستخدام Groq API');

        return generatedCode;
      } catch (apiError) {
        console.error('خطأ في الاتصال بـ Groq API:', apiError);
        // استخدم التوليد البديل في حالة الفشل
        return generateFallbackCode(command);
      }
    } else {
      console.log('لم يتم العثور على مفتاح API صالح، استخدام وضع التوليد البديل');
      return generateFallbackCode(command);
    }
  } catch (error) {
    console.error('خطأ في توليد الكود:', error);
    throw error;
  }
}