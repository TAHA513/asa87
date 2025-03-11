import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import { apiRequest } from "@/lib/api";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

const formSchema = z.object({
  storeName: z.string().min(1, { message: "اسم المتجر مطلوب" }),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().or(z.literal("")),
  taxNumber: z.string().optional(),
  receiptNotes: z.string().optional(),
  enableLogo: z.boolean().default(true),
});

export function StoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: storeSettings, isLoading } = useQuery({
    queryKey: ["/api/store-settings"],
    queryFn: async () => {
      console.log("جلب إعدادات المتجر...");
      const response = await apiRequest("GET", "/api/store-settings");
      console.log("تم جلب إعدادات المتجر:", response);
      return response;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
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

  // تحديث القيم الافتراضية عند استلام البيانات من الخادم
  useEffect(() => {
    if (storeSettings) {
      console.log("تحديث نموذج إعدادات المتجر:", storeSettings);
      form.reset({
        storeName: storeSettings.storeName || "",
        storeAddress: storeSettings.storeAddress || "",
        storePhone: storeSettings.storePhone || "",
        storeEmail: storeSettings.storeEmail || "",
        taxNumber: storeSettings.taxNumber || "",
        receiptNotes: storeSettings.receiptNotes || "",
        enableLogo: storeSettings.enableLogo ?? true,
      });

      // عرض الشعار إذا كان موجوداً
      if (storeSettings.logoUrl) {
        setLogoPreview(storeSettings.logoUrl);
      }
    }
  }, [storeSettings, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      console.log("حفظ إعدادات المتجر:", values);
      const formData = new FormData();

      // Add form fields to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Add logo file if exists
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      return await apiRequest("POST", "/api/store-settings", formData, {
        isFormData: true,
      });
    },
    onSuccess: (data) => {
      console.log("تم حفظ إعدادات المتجر بنجاح:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/store-settings"] });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المتجر بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error saving store settings:", error);
      toast({
        title: "حدث خطأ",
        description: "فشل في حفظ إعدادات المتجر",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("تقديم نموذج إعدادات المتجر:", values);
    updateMutation.mutate(values);
  }

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>إعدادات المتجر</CardTitle>
        <CardDescription>
          إعدادات المتجر الأساسية التي ستظهر في الفواتير والتقارير
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:space-x-reverse">
              {/* Logo Upload */}
              <div className="w-full md:w-1/3">
                <FormLabel className="mb-2 block">شعار المتجر</FormLabel>
                <div 
                  onClick={handleLogoClick}
                  className="h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {logoPreview || storeSettings?.logoUrl ? (
                    <img 
                      src={logoPreview || storeSettings?.logoUrl} 
                      alt="شعار المتجر" 
                      className="max-h-full max-w-full object-contain p-2" 
                    />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">اضغط لاختيار صورة الشعار</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <FormDescription className="mt-2 text-xs">
                  يظهر الشعار على الفواتير والتقارير المطبوعة
                </FormDescription>
              </div>

              {/* Form Fields */}
              <div className="w-full md:w-2/3 space-y-4">
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
                  name="storeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان المتجر</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="عنوان المتجر"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="ملاحظات تظهر أسفل الفاتورة"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableLogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>عرض الشعار</FormLabel>
                        <FormDescription>
                          إظهار شعار المتجر على الفواتير والتقارير
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

            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              حفظ التغييرات
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}