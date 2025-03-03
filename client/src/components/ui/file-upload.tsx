import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Image } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  name?: string; // Added name prop
}

export function FileUpload({
  onFileSelect,
  label = "اختر صورة",
  accept = "image/*",
  maxSize = 5, // 5MB default
  name = "image", // Default name for the file input
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
      <div className="flex flex-col items-center justify-center w-full">
        <Label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
        >
          {preview ? (
            <img
              src={preview}
              alt="معاينة"
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Image className="w-12 h-12 mb-4 text-muted-foreground" />
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