
import axios from 'axios';

export async function chatWithHuggingFace(message: string): Promise<string> {
  try {
    const API_KEY = process.env.HUGGING_FACE_API_KEY;
    
    if (!API_KEY) {
      throw new Error('مفتاح API غير موجود. يرجى إضافة HUGGING_FACE_API_KEY في أداة Secrets.');
    }

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs: message },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.generated_text || 'لم يتم الحصول على إجابة';
  } catch (error) {
    console.error('خطأ في التعامل مع Hugging Face API:', error);
    throw new Error('حدث خطأ أثناء التواصل مع Hugging Face. يرجى المحاولة مرة أخرى.');
  }
}
