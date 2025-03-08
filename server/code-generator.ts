
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// إنشاء مثيل من OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * توليد كود باستخدام OpenAI API بناءً على الأمر
 * @param command الأمر البرمجي باللغة العربية
 * @returns الكود المولد
 */
export async function generateCodeWithOpenAI(command: string): Promise<string> {
  try {
    // تحقق من وجود مفتاح API
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY غير معرف في ملف .env');
    }

    console.log('🔄 إرسال طلب إلى OpenAI API...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `أنت مساعد برمجي ماهر. ستتلقى أوامر باللغة العربية، ومهمتك هي تحويلها إلى أكواد TypeScript أو JavaScript حسب السياق. 
          المشروع عبارة عن تطبيق ويب يستخدم Express كـ backend وReact كـ frontend. استخدم لغة TypeScript عندما يكون ذلك مناسبًا.
          قدم الكود فقط دون أي تفسيرات أو تعليقات إضافية.`
        },
        {
          role: "user",
          content: command
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const generatedCode = response.choices[0]?.message?.content?.trim() || 'لم يتم توليد أي كود.';
    console.log('✅ تم استلام الكود من OpenAI API.');
    return generatedCode;
  } catch (error) {
    console.error('❌ خطأ في توليد الكود باستخدام OpenAI:', error);
    throw new Error(`فشل في توليد الكود: ${error}`);
  }
}

// دالة بسيطة كبديل إذا لم يكن OpenAI API متاحًا
export function generateSimpleCode(command: string): string {
  console.log('⚠️ استخدام توليد الكود البسيط البديل');
  
  if (command.includes('إضافة زر')) {
    return `
import React from 'react';

export const Button = () => {
  return <button onClick={() => console.log('Button clicked!')}>زر جديد</button>;
};
    `;
  }
  
  if (command.includes('إنشاء صفحة')) {
    return `
import React from 'react';

export const NewPage = () => {
  return (
    <div>
      <h1>صفحة جديدة</h1>
      <p>محتوى الصفحة الجديدة هنا</p>
    </div>
  );
};
    `;
  }
  
  return `console.log("🚀 تنفيذ الأمر: ${command}");`;
}
