
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface UploadButtonProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number; // بالميجابايت
}

export function UploadButton({
  onUploadComplete,
  accept = "image/*",
  maxSize = 5, // 5 ميجابايت كحد افتراضي
}: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // التحقق من حجم الملف
      if (file.size > maxSize * 1024 * 1024) {
        setError(`حجم الملف يتجاوز الحد المسموح (${maxSize} ميجابايت)`);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        // إنشاء FormData لرفع الملف
        const formData = new FormData();
        formData.append('file', file);

        // هنا يمكنك استخدام واجهة برمجة التطبيقات الخاصة بك لرفع الملف
        // أو استخدام خدمة مثل Cloudinary أو Firebase Storage
        
        // بدلاً من ذلك، سنقوم بتحويل الملف إلى URL Data ليتم عرضه
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          
          try {
            // يمكن تخزين URL البيانات أو إرسالها إلى الخادم
            // هنا سنفترض أننا نقوم بتخزينه محلياً فقط
            const response = await apiClient.post('/api/files', {
              name: file.name,
              type: file.type,
              content: base64data,
              size: file.size,
            });
            
            if (response.data && response.data.content) {
              onUploadComplete(response.data.content);
            } else {
              throw new Error('فشل في استلام عنوان URL للملف المرفوع');
            }
          } catch (error) {
            console.error('خطأ في رفع الملف:', error);
            setError('فشل في رفع الملف. يرجى المحاولة مرة أخرى.');
            // استخدام URL البيانات كبديل في حالة الفشل
            onUploadComplete(base64data);
          } finally {
            setIsUploading(false);
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('خطأ في رفع الملف:', error);
        setError('فشل في رفع الملف. يرجى المحاولة مرة أخرى.');
        setIsUploading(false);
      }
    },
    [maxSize, onUploadComplete]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => document.getElementById('file-upload')?.click()}
          className="relative overflow-hidden"
        >
          {isUploading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <UploadCloud className="ml-2 h-4 w-4" />
              رفع ملف
            </>
          )}
        </Button>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
