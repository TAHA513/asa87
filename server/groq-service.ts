import { Groq } from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

// التأكد من وجود مفتاح API
if (!process.env.GROQ_API_KEY) {
  console.warn("تنبيه: لم يتم تعيين GROQ_API_KEY في متغيرات البيئة");
}

// إنشاء عميل Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface GroqCompletionOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function getGroqCompletion(options: GroqCompletionOptions) {
  const {
    prompt,
    model = "llama3-8b-8192",
    maxTokens = 1024,
    temperature = 0.7
  } = options;

  try {
    console.log("Sending request to Groq API:", { model, maxTokens, temperature });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "أنت مساعد ذكي يساعد في إدارة الأعمال باللغة العربية.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model,
      max_tokens: maxTokens,
      temperature,
    });

    console.log("Received response from Groq API");
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("خطأ في استدعاء Groq API:", error);
    throw new Error("فشل في الحصول على استجابة من Groq API");
  }
}

// وظيفة لتحليل النص باستخدام Groq
export async function analyzeText(text: string) {
  return getGroqCompletion({
    prompt: `قم بتحليل النص التالي وتقديم ملخص وأفكار رئيسية:\n\n${text}`,
  });
}

// وظيفة لتوليد محتوى تسويقي
export async function generateMarketingContent(product: string, audience: string, tone: string) {
  return getGroqCompletion({
    prompt: `أنشئ محتوى تسويقي لـ ${product} موجه إلى ${audience} بنبرة ${tone}.`,
  });
}

// وظيفة للترجمة
export async function translateText(text: string, targetLanguage: string) {
  return getGroqCompletion({
    prompt: `ترجم النص التالي إلى اللغة ${targetLanguage}:\n\n${text}`,
  });
}