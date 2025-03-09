
import { Groq } from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

// إنشاء مثيل من Groq مع مفتاح API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * توليد كود باستخدام Groq AI
 * @param prompt الوصف المطلوب توليد كود له
 * @returns الكود المولد
 */
export async function generateCodeWithOpenAI(prompt: string): Promise<string> {
  try {
    console.log(`🔄 توليد كود بناء على: "${prompt}"`);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "أنت مساعد برمجة ذكي. قم بتوليد الكود المطلوب بناءً على وصف المستخدم. قدم الكود فقط دون أي تفسيرات إضافية."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.5,
      max_tokens: 4000,
    });

    // استخراج الكود المولد
    const generatedCode = completion.choices[0]?.message?.content?.trim() || '';
    
    // إزالة علامات الكود إذا كانت موجودة (```javascript و ```)
    const cleanedCode = generatedCode.replace(/^```[\w]*\n|```$/g, '');

    console.log('✅ تم توليد الكود بنجاح');
    return cleanedCode;
  } catch (error) {
    console.error('❌ خطأ في توليد الكود:', error);
    throw new Error(`فشل في توليد الكود: ${error}`);
  }
}
