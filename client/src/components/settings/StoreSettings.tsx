import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";
import { UploadButton } from "@/components/upload-button";

const storeSettingsSchema = z.object({
  storeName: z.string().min(2, "اسم المتجر يجب أن يكون أكثر من حرفين"),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email("البريد الإلكتروني غير صالح").optional().nullable(),
  taxNumber: z.string().optional(),
  receiptNotes: z.string().optional(),
  enableLogo: z.boolean().default(true),
  logoUrl: z.string().optional().nullable(),
});

type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

export function StoreSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: "",
      storeAddress: "",
      storePhone: "",
      storeEmail: "",
      taxNumber: "",
      receiptNotes: "",
      enableLogo: true,
      logoUrl: "",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/store-settings");

        if (response.data) {
          const settings = response.data;
          // تحديث النموذج بالبيانات
          Object.keys(settings).forEach((key) => {
            if (key in storeSettingsSchema.shape) {
              setValue(key as keyof StoreSettingsFormValues, settings[key]);
            }
          });

          // تحديث معاينة الشعار إذا وجد
          if (settings.logoUrl) {
            setLogoPreview(settings.logoUrl);
          }
        }
      } catch (error) {
        console.error("فشل في جلب إعدادات المتجر:", error);
        toast({
          title: "خطأ",
          description: "فشل في جلب إعدادات المتجر",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [setValue, toast]);

  const onSubmit = async (data: StoreSettingsFormValues) => {
    try {
      setLoading(true);
      const response = await apiClient.post("/api/store-settings", data);

      if (response.data) {
        toast({
          title: "تم بنجاح",
          description: "تم حفظ إعدادات المتجر بنجاح",
        });
      }
    } catch (error) {
      console.error("فشل في حفظ إعدادات المتجر:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات المتجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (url: string) => {
    setValue("logoUrl", url);
    setLogoPreview(url);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>إعدادات المتجر</CardTitle>
          <CardDescription>
            قم بتخصيص معلومات المتجر التي ستظهر في الفواتير والتقارير
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">اسم المتجر</Label>
            <Input
              id="storeName"
              placeholder="أدخل اسم المتجر"
              disabled={loading}
              {...register("storeName")}
            />
            {errors.storeName && (
              <p className="text-sm text-red-500">{errors.storeName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeAddress">عنوان المتجر</Label>
            <Input
              id="storeAddress"
              placeholder="أدخل عنوان المتجر"
              disabled={loading}
              {...register("storeAddress")}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storePhone">رقم الهاتف</Label>
              <Input
                id="storePhone"
                placeholder="07xxxxxxxx"
                disabled={loading}
                {...register("storePhone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeEmail">البريد الإلكتروني</Label>
              <Input
                id="storeEmail"
                type="email"
                placeholder="example@domain.com"
                disabled={loading}
                {...register("storeEmail")}
              />
              {errors.storeEmail && (
                <p className="text-sm text-red-500">{errors.storeEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxNumber">الرقم الضريبي</Label>
            <Input
              id="taxNumber"
              placeholder="أدخل الرقم الضريبي"
              disabled={loading}
              {...register("taxNumber")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptNotes">ملاحظات الفاتورة</Label>
            <Textarea
              id="receiptNotes"
              placeholder="ملاحظات تظهر أسفل الفاتورة"
              className="min-h-20"
              disabled={loading}
              {...register("receiptNotes")}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableLogo">إظهار الشعار في الفواتير</Label>
              <Switch
                id="enableLogo"
                checked={!!register("enableLogo").value}
                onCheckedChange={(checked) => setValue("enableLogo", checked)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>شعار المتجر</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <UploadButton onUploadComplete={handleLogoUpload} />
                  <input type="hidden" {...register("logoUrl")} />
                </div>

                {logoPreview && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <img
                      src={logoPreview}
                      alt="شعار المتجر"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => reset()} disabled={loading}>
            إعادة ضبط
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}