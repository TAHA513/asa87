import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Building, Upload } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  storeName: z.string().min(1, { message: "اسم المتجر مطلوب" }),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal("")),
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
  const [loading, setLoading] = useState(false); // Added loading state
  const [storeSettings, setStoreSettings] = useState<FormValues | null>(null); // manage local state


  const { data: initialStoreSettings, isLoading: initialLoading } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      console.log("جلب إعدادات المتجر...");
      const response = await apiRequest("GET", "/api/store-settings");
      console.log("تم جلب إعدادات المتجر:", response);
      return response;
    },
  });

  useEffect(() => {
    if (initialStoreSettings) {
      setStoreSettings(initialStoreSettings);
    }
  }, [initialStoreSettings]);


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
      // تعبئة النموذج بالبيانات الموجودة
      form.reset(storeSettings);

      // عرض الشعار إذا كان موجودًا
      if (storeSettings.logoUrl) {
        setLogoPreview(storeSettings.logoUrl);
      }
    }
  }, [storeSettings, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log("جاري إرسال بيانات المتجر:", data);

      const formData = new FormData();
      formData.append("storeName", data.storeName);
      formData.append("storeAddress", data.storeAddress || "");
      formData.append("storePhone", data.storePhone || "");
      formData.append("storeEmail", data.storeEmail || "");
      formData.append("taxNumber", data.taxNumber || "");
      formData.append("receiptNotes", data.receiptNotes || "");
      formData.append("enableLogo", String(data.enableLogo));

      if (logoFile) {
        formData.append("logo", logoFile);
      } else if (logoPreview) {
        formData.append("logoUrl", logoPreview);
      }

      // استخدام apiRequest بدلاً من fetch مباشرة
      const response = await apiRequest("POST", "/api/store-settings", formData, true);

      if (response) {
        console.log("تم حفظ إعدادات المتجر بنجاح:", response);
        // تحديث البيانات المحلية
        setStoreSettings(response);

        toast({
          title: "تم الحفظ بنجاح",
          description: "تم حفظ إعدادات المتجر",
        });

        // تحديث البيانات في الواجهة
        queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
      } else {
        throw new Error("فشل في حفظ إعدادات المتجر");
      }
    } catch (error) {
      console.error("خطأ في حفظ إعدادات المتجر:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات المتجر",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  if (initialLoading) {
    return <div className="flex justify-center p-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">إعدادات المتجر</h2>
            <p className="text-muted-foreground">
              قم بتحديث معلومات المتجر التي ستظهر في الفواتير والمستندات
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-3/4 space-y-4">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المتجر</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المتجر" {...field} />
                      </FormControl>
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
                        <Input placeholder="عنوان المتجر" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="storePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="رقم الهاتف" {...field} />
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
                          <Input placeholder="البريد الإلكتروني" {...field} />
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
                        <Input placeholder="الرقم الضريبي" {...field} />
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
                          placeholder="النص الذي سيظهر في أسفل الفواتير"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        هذا النص سيظهر في أسفل الفواتير
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full md:w-1/4 space-y-4">
                <div>
                  <p className="mb-2 font-medium">شعار المتجر</p>
                  <div
                    onClick={handleLogoClick}
                    className="border-2 border-dashed rounded-lg p-4 h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition"
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="شعار المتجر"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          انقر لاختيار شعار المتجر
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="enableLogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          إظهار الشعار في الفواتير
                        </FormLabel>
                        <FormDescription>
                          عرض شعار المتجر عند طباعة الفواتير
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
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}