import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Image } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  name?: string; // Added name prop
}

export function FileUpload({
  onFileSelect,
  label = 'اختر صورة',
  accept = 'image/*',
  maxSize = 5, // 5MB default
  name = 'image', // Default name for the file input
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // التحقق من حجم الملف
    if (file.size > maxSize * 1024 * 1024) {
      setError(`حجم الملف يجب أن يكون أقل من ${maxSize}MB`);
      return;
    }

    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-col items-center justify-center">
        <Label
          htmlFor="file-upload"
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 transition-colors duration-200 hover:bg-muted/50"
        >
          {preview ? (
            <img src={preview} alt="معاينة" className="h-full w-full rounded-lg object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <Image className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">اضغط للتحميل</span> أو اسحب وأفلت
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG أو WEBP (حد أقصى: {maxSize}MB)
              </p>
            </div>
          )}
          <Input
            id="file-upload"
            name={name} // Added name attribute
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </Label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
