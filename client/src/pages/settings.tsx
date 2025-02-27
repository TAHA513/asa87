import Sidebar from "@/components/layout/sidebar";
import ChangePasswordForm from "@/components/settings/change-password";
import ThemeSettings from "@/components/settings/theme-settings";
import ApiKeysForm from "@/components/settings/api-keys-form";
import { Settings as SettingsIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Button,
  Input,
  Form,
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/toast"; // Placeholder import


export default function Settings() {
  // Placeholder for updateApiKeys function - needs actual implementation
  const updateApiKeys = async (keys) => {
    console.log("Updating API keys:", keys);
    // Replace with your actual API key update logic
  };

  // Placeholder for Toaster component
  const Toaster = () => <div>Toaster Component</div>;


  // تعريف نموذج Hugging Face
  const huggingFaceFormSchema = z.object({
    apiKey: z.string().min(1, "مفتاح API مطلوب"),
    modelId: z.string().optional(),
    huggingFaceApiKey: z.string().optional(), // Added Hugging Face API Key field
  });

  // استخدام النموذج في الصفحة
  const huggingFaceForm = useForm({
    resolver: zodResolver(huggingFaceFormSchema),
    defaultValues: {
      apiKey: "",
      modelId: "",
      huggingFaceApiKey: "", // Added default value
    },
  });

  // وظيفة إرسال نموذج Hugging Face
  const onSubmitHuggingFace = async (values) => {
    try {
      await updateApiKeys({
        huggingface: {
          apiKey: values.apiKey,
          modelId: values.modelId || "",
          huggingFaceApiKey: values.huggingFaceApiKey, // Added Hugging Face API Key to payload
        },
      });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات Hugging Face بنجاح",
      });
    } catch (error) {
      console.error("Error updating Hugging Face settings:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-3xl font-bold">الإعدادات</h1>
          </div>

          <Tabs defaultValue="account">
            <TabsList className="grid w-full max-w-md grid-cols-4 mb-6">
              <TabsTrigger value="account">الحساب</TabsTrigger>
              <TabsTrigger value="appearance">المظهر</TabsTrigger>
              <TabsTrigger value="marketing">التسويق</TabsTrigger>
              <TabsTrigger value="huggingface">المساعد الذكي</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="p-4 space-y-4">
              {/* Account Settings Content */}
            </TabsContent>
            <TabsContent value="appearance" className="p-4 space-y-4">
              <ThemeSettings />
            </TabsContent>
            <TabsContent value="marketing" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>مفاتيح API للمنصات الاجتماعية</CardTitle>
                  <CardDescription>
                    قم بإضافة مفاتيح API الخاصة بكل منصة تواصل اجتماعي لتتمكن من الربط والتحكم في الحملات الإعلانية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApiKeysForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="huggingface" className="p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات Hugging Face</CardTitle>
                  <CardDescription>
                    قم بإعداد مفتاح Hugging Face API للمساعد الذكي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...huggingFaceForm}>
                    <form onSubmit={huggingFaceForm.handleSubmit(onSubmitHuggingFace)} className="space-y-4">
                      <FormField
                        control={huggingFaceForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مفتاح الـ API (API Key)</FormLabel>
                            <FormControl>
                              <Input placeholder="hf_..." {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              يمكنك الحصول على مفتاح API من حساب Hugging Face الخاص بك
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={huggingFaceForm.control}
                        name="modelId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>معرّف النموذج (اختياري)</FormLabel>
                            <FormControl>
                              <Input placeholder="مثال: gpt2" {...field} />
                            </FormControl>
                            <FormDescription>
                              معرّف النموذج الذي ترغب في استخدامه للمساعد الذكي
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={huggingFaceForm.control}
                        name="huggingFaceApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hugging Face API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Hugging Face API Key" {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              Required to run the assistant. Obtain a key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary underline">huggingface.co</a>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={huggingFaceForm.formState.isSubmitting}>
                        {huggingFaceForm.formState.isSubmitting && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-2" />
                        )}
                        حفظ الإعدادات
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <Card>
              <CardHeader>
                <CardTitle>تغيير كلمة المرور</CardTitle>
                <CardDescription>
                  قم بتغيير كلمة المرور الخاصة بك. يجب إدخال كلمة المرور الحالية للتحقق.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
    </div>
  );
}