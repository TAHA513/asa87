import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export async function generateCodeWithOpenAI(command: string): Promise<string> {
  try {
    if (!command || command.trim() === '') {
      throw new Error('الأمر فارغ');
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey || groqApiKey === 'YOUR_ACTUAL_API_KEY_HERE') {
      console.log('⚠️ مفتاح GROQ API غير متوفر، استخدام وضع التوليد البديل');
      return generateFallbackCode(command);
    }

    try {
      console.log('🔄 جاري استخدام GROQ API لتوليد الكود...');

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: `أنت مطور محترف متخصص في إنشاء كود React/Next.js/TypeScript عالي الجودة.
              - ركز على كتابة كود نظيف وقابل للصيانة باستخدام أفضل الممارسات.
              - اكتب تعليقات مفيدة باللغة العربية لشرح الأجزاء المهمة.
              - التزم بالمعايير الحديثة لـ TypeScript وReact.
              - قم بتضمين معالجة الأخطاء وتحقق من المدخلات.`
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
        throw new Error(`فشل الاتصال بـ GROQ API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('لم يتم استلام محتوى صالح من GROQ API');
      }

      return data.choices[0].message.content;

    } catch (apiError) {
      console.error('خطأ في الاتصال بـ GROQ API:', apiError);
      return generateFallbackCode(command);
    }
  } catch (error) {
    console.error('خطأ في توليد الكود:', error);
    throw error;
  }
}

// وظيفة مساعدة لتوليد كود بسيط استنادًا إلى الأمر
function generateFallbackCode(command: string): string {
  // نفس الكود السابق للتوليد البديل
  if (command.includes('صفحة') && command.includes('تسجيل الدخول')) {
    return `
    import React, { useState } from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
    import { Input } from '../components/ui/input';
    import { Button } from '../components/ui/button';
    import { Label } from '../components/ui/label';

    export function LoginPage() {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');

      const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('تسجيل الدخول باستخدام:', { username, password });
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
    }`;
  }
  // يمكن إضافة المزيد من الحالات هنا

  return `
  // كود بسيط تم إنشاؤه استجابة للأمر: ${command}
  import React from 'react';
  import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

  export function GeneratedComponent() {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardHeader>
          <CardTitle>المكون الجديد</CardTitle>
        </CardHeader>
        <CardContent>
          <p>تم إنشاء هذا المكون استجابة لطلبك</p>
        </CardContent>
      </Card>
    );
  }`;
}