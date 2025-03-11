
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  storeName: z.string().min(1, "اسم المتجر مطلوب"),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().optional(),
  taxNumber: z.string().optional(),
  receiptNotes: z.string().optional(),
  enableLogo: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function StoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: storeSettings, isLoading } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      console.log("جلب إعدادات المتجر...");
      try {
        const response = await apiRequest("GET", "/api/store-settings");
        console.log("تم جلب إعدادات المتجر:", response);
        return response;
      } catch (error) {
        console.error("خطأ في جلب إعدادات المتجر:", error);
        return {
          storeName: "نظام SAS للإدارة",
          storeAddress: "",
          storePhone: "",
          storeEmail: "",
          taxNumber: "",
          logoUrl: "",
          receiptNotes: "شكراً لتعاملكم معنا",
          enableLogo: true
        };
      }
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeAddress: "",
      storePhone: "",
      storeEmail: "",
      taxNumber: "",
      receiptNotes: "",
      enableLogo: true,
    },
  });

  useEffect(() => {
    if (storeSettings) {
      console.log("تحديث النموذج بإعدادات المتجر:", storeSettings);
      // تعبئة النموذج بالبيانات الموجودة
      form.reset({
        storeName: storeSettings.storeName || "",
        storeAddress: storeSettings.storeAddress || "",
        storePhone: storeSettings.storePhone || "",
        storeEmail: storeSettings.storeEmail || "",
        taxNumber: storeSettings.taxNumber || "",
        receiptNotes: storeSettings.receiptNotes || "",
        enableLogo: storeSettings.enableLogo !== false,
      });
      
      // تحديث معاينة الشعار إذا كان موجوداً
      if (storeSettings.logoUrl) {
        setLogoPreview(storeSettings.logoUrl);
      }
    }
  }, [storeSettings, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log("جاري حفظ إعدادات المتجر...", data);
      
      // إنشاء كائن FormData لإرسال الملفات
      const formData = new FormData();
      
      // إضافة بيانات النموذج
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value !== undefined ? String(value) : "");
      });
      
      // إضافة الشعار إذا تم تحديثه
      if (logoFile) {
        formData.append("logo", logoFile);
      } else if (logoPreview) {
        formData.append("logoUrl", logoPreview);
      }
      
      // إرسال البيانات للخادم
      const response = await fetch("/api/store-settings", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`فشل الحفظ: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("تم حفظ إعدادات المتجر:", result);
      
      // تحديث البيانات في ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المتجر بنجاح",
      });
    } catch (error) {
      console.error("خطأ أثناء حفظ إعدادات المتجر:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ إعدادات المتجر",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات المتجر</CardTitle>
        <CardDescription>
          قم بتعديل معلومات المتجر التي تظهر في الفواتير والمواعيد
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المتجر</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل اسم المتجر" {...field} />
                      </FormControl>
                      <FormDescription>
                        سيظهر اسم المتجر في جميع الفواتير والتقارير
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="storeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان المتجر</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل عنوان المتجر" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="storePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="أدخل رقم الهاتف"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storeEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="أدخل البريد الإلكتروني"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرقم الضريبي</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل الرقم الضريبي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات الفاتورة</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="أدخل ملاحظات تظهر أسفل الفواتير"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        تظهر هذه الملاحظات في أسفل جميع الفواتير المطبوعة
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableLogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">شعار المتجر</FormLabel>
                        <FormDescription>
                          إظهار شعار المتجر في الفواتير والتقارير
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>تحميل الشعار</FormLabel>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      اختر صورة
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <FormDescription>
                      يفضل استخدام صورة شفافة بصيغة PNG أو SVG
                    </FormDescription>
                  </div>
                  {logoPreview && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm">معاينة الشعار:</p>
                      <div className="h-20 w-48 overflow-hidden rounded border bg-gray-50 dark:bg-gray-800">
                        <img
                          src={logoPreview}
                          alt="شعار المتجر"
                          className="h-full w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CardFooter className="flex justify-end px-0 pt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
