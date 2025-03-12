
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const storeFormSchema = z.object({
  storeName: z.string().min(1, "اسم المتجر مطلوب"),
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
  storeEmail: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  storeLogo: z.string().optional(),
  invoiceFooter: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  currency: z.string().default("ر.س"),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

export function StoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب إعدادات المتجر الحالية
  const { data: storeSettings, isLoading: isLoadingSettings, error: settingsError } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/settings/store");
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        return response.json();
      } catch (error) {
        console.error("Error loading store settings:", error);
        throw new Error("فشل في تحميل إعدادات المتجر");
      }
    },
    retry: 1,
  });

  // تعريف النموذج
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      storeName: "",
      storeAddress: "",
      storePhone: "",
      storeEmail: "",
      storeLogo: "",
      invoiceFooter: "",
      taxRate: 0,
      currency: "ر.س",
    },
  });

  // تحديث النموذج عند تحميل البيانات
  React.useEffect(() => {
    if (storeSettings) {
      form.reset({
        storeName: storeSettings.store_name || "",
        storeAddress: storeSettings.store_address || "",
        storePhone: storeSettings.store_phone || "",
        storeEmail: storeSettings.store_email || "",
        storeLogo: storeSettings.store_logo || "",
        invoiceFooter: storeSettings.invoice_footer || "",
        taxRate: storeSettings.tax_rate || 0,
        currency: storeSettings.currency || "ر.س",
      });
    }
  }, [form, storeSettings]);

  // حفظ الإعدادات
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: StoreFormValues) => {
      const response = await fetch("/api/settings/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "فشل في حفظ إعدادات المتجر");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المتجر بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  // تقديم النموذج
  function onSubmit(data: StoreFormValues) {
    saveSettingsMutation.mutate(data);
  }

  // عرض رسالة التحميل
  if (isLoadingSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>إعدادات المتجر</CardTitle>
          <CardDescription>إدارة معلومات المتجر الأساسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">جاري تحميل الإعدادات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // عرض رسالة الخطأ
  if (settingsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>إعدادات المتجر</CardTitle>
          <CardDescription>إدارة معلومات المتجر الأساسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-red-500 bg-red-50 rounded-md">
            <p>حدث خطأ أثناء تحميل إعدادات المتجر</p>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["storeSettings"] })}
            >
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات المتجر</CardTitle>
        <CardDescription>إدارة معلومات المتجر الأساسية</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المتجر</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم المتجر" {...field} />
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
                    <Textarea placeholder="أدخل عنوان المتجر" {...field} />
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
                      <Input placeholder="رقم هاتف المتجر" {...field} />
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
                      <Input placeholder="البريد الإلكتروني للمتجر" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="storeLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط شعار المتجر</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل رابط شعار المتجر" {...field} />
                  </FormControl>
                  <FormDescription>
                    يمكن استخدام رابط صورة من الإنترنت
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="invoiceFooter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تذييل الفاتورة</FormLabel>
                  <FormControl>
                    <Textarea placeholder="نص يظهر في أسفل الفاتورة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نسبة الضريبة (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min="0" max="100" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العملة</FormLabel>
                    <FormControl>
                      <Input placeholder="رمز العملة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="mt-4"
              disabled={saveSettingsMutation.isPending}
            >
              {saveSettingsMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الإعدادات"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
