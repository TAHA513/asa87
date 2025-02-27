
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// الحصول على مفتاح API من المتغيرات البيئية
const API_KEY = process.env.HUGGING_FACE_API_KEY;

// التأكد من وجود مفتاح API
if (!API_KEY) {
  console.warn('لم يتم تعيين مفتاح API لـ Hugging Face. الرجاء إضافته في ملف .env');
}

// إعداد axios مع رأس التفويض
const huggingFaceClient = axios.create({
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// دالة للتحدث مع نموذج Hugging Face
export async function chatWithModel(prompt: string, modelId: string = 'mistralai/Mistral-7B-Instruct-v0.2') {
  try {
    // تحقق من وجود مفتاح API
    if (!API_KEY) {
      throw new Error('مفتاح API غير موجود. الرجاء إضافته في الإعدادات');
    }

    // إرسال الطلب إلى Hugging Face API
    const response = await huggingFaceClient.post(
      `https://api-inference.huggingface.co/models/${modelId}`,
      { inputs: prompt }
    );

    // إرجاع النتيجة
    return {
      success: true,
      data: response.data,
      message: response.data[0]?.generated_text || 'لا توجد إجابة من النموذج'
    };
  } catch (error: any) {
    console.error('خطأ في الاتصال بـ Hugging Face API:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ أثناء الاتصال بالنموذج',
      error
    };
  }
}
