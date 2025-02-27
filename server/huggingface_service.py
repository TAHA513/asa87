import os
import sys
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

class HuggingFaceService:
    def __init__(self):
        self.api_key = os.environ.get('HUGGINGFACE_API_KEY')
        if not self.api_key:
            raise ValueError("Hugging Face API key not found")

        # تهيئة النموذج والمحول
        self.model_name = "CAMeL-Lab/bert-base-arabic-camelbert-mix"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, use_auth_token=self.api_key)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name, use_auth_token=self.api_key)

    def generate_response(self, prompt: str, max_length: int = 100) -> str:
        try:
            # تحويل النص إلى توكنز
            inputs = self.tokenizer(prompt, return_tensors="pt", padding=True, truncation=True, max_length=max_length)

            # الحصول على التنبؤات
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=1)

            # تحويل التنبؤات إلى نص
            response = f"تم تحليل النص بنجاح. مستوى الثقة: {predictions.max().item():.2%}"
            return response

        except Exception as e:
            print(f"Error generating response: {str(e)}", file=sys.stderr)
            return "عذراً، حدث خطأ أثناء معالجة طلبك."

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python huggingface_service.py <prompt>", file=sys.stderr)
        sys.exit(1)

    prompt = sys.argv[1]
    service = HuggingFaceService()
    response = service.generate_response(prompt)
    print(response)