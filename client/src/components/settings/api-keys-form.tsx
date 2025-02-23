import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// تعريف نوع البيانات لكل منصة
type PlatformField = {
  name: string;
  label: string;
  type: "text" | "password";
  placeholder?: string;
};

// تعريف نوع البيانات للمنصة
type Platform = {
  title: string;
  description: string;
  fields: Record<string, PlatformField>;
  instructions: string[];
};

// تكوين المنصات
const platformConfig = {
  facebook: {
    title: "فيسبوك وانستغرام",
    description: "قم بإنشاء تطبيق على Facebook Developers وأدخل المفاتيح هنا",
    fields: {
      appId: {
        name: "appId",
        label: "App ID",
        type: "text",
        placeholder: "أدخل App ID",
      },
      appSecret: {
        name: "appSecret",
        label: "App Secret",
        type: "password",
        placeholder: "أدخل App Secret",
      },
    },
    instructions: [
      "1. قم بزيارة https://developers.facebook.com",
      "2. أنشئ تطبيقًا جديدًا",
      "3. اختر نوع التطبيق 'Business'",
      "4. قم بتفعيل منتجات Facebook Login و Instagram Graph API",
      "5. أضف عنوان OAuth redirect URI: https://your-domain.com/api/auth/facebook/callback",
    ],
  },
  twitter: {
    title: "تويتر",
    description: "قم بإنشاء تطبيق على Twitter Developer Portal وأدخل المفاتيح هنا",
    fields: {
      apiKey: {
        name: "apiKey",
        label: "API Key",
        type: "text",
        placeholder: "أدخل API Key",
      },
      apiSecret: {
        name: "apiSecret",
        label: "API Secret",
        type: "password",
        placeholder: "أدخل API Secret",
      },
    },
    instructions: [
      "1. قم بزيارة https://developer.twitter.com",
      "2. أنشئ مشروعًا جديدًا",
      "3. قم بتفعيل صلاحيات OAuth 2.0",
      "4. أضف عنوان OAuth redirect URI: https://your-domain.com/api/auth/twitter/callback",
    ],
  },
  tiktok: {
    title: "تيك توك",
    description: "قم بإنشاء تطبيق على TikTok for Developers وأدخل المفاتيح هنا",
    fields: {
      clientKey: {
        name: "clientKey",
        label: "Client Key",
        type: "text",
        placeholder: "أدخل Client Key",
      },
      clientSecret: {
        name: "clientSecret",
        label: "Client Secret",
        type: "password",
        placeholder: "أدخل Client Secret",
      },
    },
    instructions: [
      "1. قم بزيارة https://developers.tiktok.com",
      "2. أنشئ تطبيقًا جديدًا",
      "3. قم بتفعيل TikTok Login Kit",
      "4. أضف عنوان OAuth redirect URI: https://your-domain.com/api/auth/tiktok/callback",
    ],
  },
  snapchat: {
    title: "سناب شات",
    description: "قم بإنشاء تطبيق على Snap Kit Developer Portal وأدخل المفاتيح هنا",
    fields: {
      clientId: {
        name: "clientId",
        label: "Client ID",
        type: "text",
        placeholder: "أدخل Client ID",
      },
      clientSecret: {
        name: "clientSecret",
        label: "Client Secret",
        type: "password",
        placeholder: "أدخل Client Secret",
      },
    },
    instructions: [
      "1. قم بزيارة https://kit.snapchat.com",
      "2. أنشئ تطبيقًا جديدًا",
      "3. قم بتفعيل Login Kit",
      "4. أضف عنوان OAuth redirect URI: https://your-domain.com/api/auth/snapchat/callback",
    ],
  },
  linkedin: {
    title: "لينكد إن",
    description: "قم بإنشاء تطبيق على LinkedIn Developers وأدخل المفاتيح هنا",
    fields: {
      clientId: {
        name: "clientId",
        label: "Client ID",
        type: "text",
        placeholder: "أدخل Client ID",
      },
      clientSecret: {
        name: "clientSecret",
        label: "Client Secret",
        type: "password",
        placeholder: "أدخل Client Secret",
      },
    },
    instructions: [
      "1. قم بزيارة https://www.linkedin.com/developers",
      "2. أنشئ تطبيقًا جديدًا",
      "3. قم بتفعيل Sign In with LinkedIn",
      "4. أضف عنوان OAuth redirect URI: https://your-domain.com/api/auth/linkedin/callback",
    ],
  },
};

// إنشاء مخطط Zod للتحقق من صحة البيانات
const formSchema = z.object(
  Object.fromEntries(
    Object.entries(platformConfig).map(([platform, config]) => [
      platform,
      z.object(
        Object.fromEntries(
          Object.entries(config.fields).map(([key, field]) => [
            key,
            z.string().min(1, `${field.label} مطلوب`),
          ])
        )
      ),
    ])
  )
);

type FormData = z.infer<typeof formSchema>;

const LOCAL_STORAGE_KEY = 'social_media_api_keys';

export default function ApiKeysForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.fromEntries(
      Object.entries(platformConfig).map(([platform, config]) => [
        platform,
        Object.fromEntries(
          Object.entries(config.fields).map(([key]) => [key, ""])
        ),
      ])
    ),
  });

  // استرجاع البيانات المحفوظة عند تحميل النموذج
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
      } catch (error) {
        console.error("Error loading saved API keys:", error);
      }
    }
  }, [form]);

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      // حفظ البيانات في LocalStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ مفاتيح API في المتصفح",
      });
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في حفظ مفاتيح API",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(platformConfig).map(([platformKey, platform]) => (
            <AccordionItem key={platformKey} value={platformKey}>
              <AccordionTrigger>{platform.title}</AccordionTrigger>
              <AccordionContent>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {platform.description}
                  </p>

                  <div className="space-y-4">
                    {Object.entries(platform.fields).map(([fieldKey, field]) => (
                      <FormField
                        key={fieldKey}
                        control={form.control}
                        name={`${platformKey}.${fieldKey}`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                              <Input
                                type={field.type}
                                placeholder={field.placeholder}
                                {...formField}
                                className="font-mono"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">تعليمات الإعداد:</h4>
                      <ul className="text-sm space-y-1 list-none">
                        {platform.instructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "جاري الحفظ..." : "حفظ مفاتيح API"}
        </Button>
      </form>
    </Form>
  );
}