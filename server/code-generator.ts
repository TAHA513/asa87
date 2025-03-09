
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// توليد كود باستخدام Groq API
export async function generateCode(prompt: string, context: any = {}): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد ذكي متخصص في تحليل وتطوير البرمجيات. مهمتك:
1. تحليل طلبات المستخدم وفهمها.
2. إنشاء أكواد برمجية دقيقة حسب الطلب.
3. اقتراح تحسينات وإصلاحات للأكواد الموجودة.
4. عندما تقترح تعديلات، قم بإنشاء كود كامل وواضح.
5. تقدم شرحًا موجزًا مع كل اقتراح.`
          },
          {
            role: 'user',
            content: `${prompt}\n\nسياق النظام: ${JSON.stringify(context, null, 2)}`
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('خطأ في استدعاء Groq API:', error);
    return 'حدث خطأ في توليد الكود. يرجى المحاولة مرة أخرى.';
  }
}

// استخراج كود من نص
export function extractCodeFromText(text: string): string[] {
  const codeRegex = /```(?:javascript|typescript|js|ts)?\s*([\s\S]*?)\s*```/g;
  const result: string[] = [];
  
  let match;
  while ((match = codeRegex.exec(text)) !== null) {
    result.push(match[1]);
  }
  
  return result;
}

// حفظ الكود المنشأ في ملف
export async function saveGeneratedCode(code: string): Promise<string> {
  const dir = './generated-code';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const filename = `Generated-${timestamp}-${randomString}.js`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(filePath, code);
  return filePath;
}

// تحليل الكود الموجود
export async function analyzeExistingCode(filePath: string): Promise<string> {
  try {
    if (!fs.existsSync(filePath)) {
      return `لا يمكن العثور على الملف: ${filePath}`;
    }
    
    const code = fs.readFileSync(filePath, 'utf8');
    return await generateCode(`قم بتحليل هذا الكود وإيجاد أي مشاكل أو تحسينات ممكنة:\n\n${code}`);
  } catch (error) {
    console.error('خطأ في تحليل الكود:', error);
    return 'حدث خطأ في تحليل الكود';
  }
}
