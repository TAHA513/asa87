import os
import sys
from transformers import AutoModelForCausalLM, AutoTokenizer

class HuggingFaceService:
    def __init__(self):
        self.api_key = os.environ.get('HUGGINGFACE_API_KEY')
        if not self.api_key:
            raise ValueError("Hugging Face API key not found")

        # تهيئة النموذج والمحول
        self.model_name = "gpt2-arabic"  # يمكن تغييره حسب الحاجة
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, use_auth_token=self.api_key)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name, use_auth_token=self.api_key)

    def generate_response(self, prompt: str, max_length: int = 100) -> str:
        try:
            # تحويل النص إلى توكنز
            inputs = self.tokenizer.encode(prompt, return_tensors="pt")

            # توليد الإجابة
            outputs = self.model.generate(
                inputs,
                max_length=max_length,
                num_return_sequences=1,
                no_repeat_ngram_size=2,
                do_sample=True
            )

            # تحويل التوكنز إلى نص
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
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