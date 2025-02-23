import { useState } from "react";
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
import { apiRequest } from "@/lib/queryClient";

const platformSchema = z.object({
  facebook: z.object({
    appId: z.string().min(1, "App ID مطلوب"),
    appSecret: z.string().min(1, "App Secret مطلوب"),
  }),
  twitter: z.object({
    apiKey: z.string().min(1, "API Key مطلوب"),
    apiSecret: z.string().min(1, "API Secret مطلوب"),
  }),
  tiktok: z.object({
    clientKey: z.string().min(1, "Client Key مطلوب"),
    clientSecret: z.string().min(1, "Client Secret مطلوب"),
  }),
  snapchat: z.object({
    clientId: z.string().min(1, "Client ID مطلوب"),
    clientSecret: z.string().min(1, "Client Secret مطلوب"),
  }),
  linkedin: z.object({
    clientId: z.string().min(1, "Client ID مطلوب"),
    clientSecret: z.string().min(1, "Client Secret مطلوب"),
  }),
});

const platforms = {
  facebook: {
    title: "فيسبوك وانستغرام",
    description: "قم بإنشاء تطبيق على Facebook Developers وأدخل المفاتيح هنا",
    fields: [
      { name: "appId", label: "App ID", type: "text" },
      { name: "appSecret", label: "App Secret", type: "password" },
    ],
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
    fields: [
      { name: "apiKey", label: "API Key", type: "text" },
      { name: "apiSecret", label: "API Secret", type: "password" },
    ],
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
    fields: [
      { name: "clientKey", label: "Client Key", type: "text" },
      { name: "clientSecret", label: "Client Secret", type: "password" },
    ],
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
    fields: [
      { name: "clientId", label: "Client ID", type: "text" },
      { name: "clientSecret", label: "Client Secret", type: "password" },
    ],
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
    fields: [
      { name: "clientId", label: "Client ID", type: "text" },
      { name: "clientSecret", label: "Client Secret", type: "password" },
    ],
    instructions: [
      "1. قم بزيارة https://www.linkedin.com/developers",
      "2. أنشئ تطبيقًا جديدًا",
      "3. قم بتفعيل Sign In with LinkedIn",
      "4. أضف عنوان OAuth redirect URI: https://your-domain.com/api/auth/linkedin/callback",
    ],
  },
};

export default function ApiKeysForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(platformSchema),
    defaultValues: {
      facebook: { appId: "", appSecret: "" },
      twitter: { apiKey: "", apiSecret: "" },
      tiktok: { clientKey: "", clientSecret: "" },
      snapchat: { clientId: "", clientSecret: "" },
      linkedin: { clientId: "", clientSecret: "" },
    },
  });

  async function onSubmit(data: z.infer<typeof platformSchema>) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/settings/api-keys", data);
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ مفاتيح API بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ مفاتيح API",
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
          {Object.entries(platforms).map(([key, platform]) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger>{platform.title}</AccordionTrigger>
              <AccordionContent>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {platform.description}
                  </p>
                  
                  <div className="space-y-4">
                    {platform.fields.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={`${key}.${field.name}`}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                              <Input
                                type={field.type}
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
