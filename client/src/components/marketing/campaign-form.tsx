import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCampaignSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const platformConfig = {
  facebook: {
    label: "فيسبوك",
    color: "#1877F2",
  },
  instagram: {
    label: "انستغرام",
    color: "#E1306C",
  },
  twitter: {
    label: "تويتر",
    color: "#1DA1F2",
  },
  linkedin: {
    label: "لينكد إن",
    color: "#0A66C2",
  },
  snapchat: {
    label: "سناب شات",
    color: "#FFFC00",
  },
  tiktok: {
    label: "تيك توك",
    color: "#000000",
  },
};

interface CampaignFormProps {
  onSuccess?: () => void;
}

export default function CampaignForm({ onSuccess }: CampaignFormProps) {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      name: "",
      description: "",
      platform: "",
      budget: 0,
      startDate: new Date(),
    },
  });

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/marketing/campaigns", {
        ...data,
        platform: selectedPlatform,
      });

      if (!response.ok) {
        throw new Error("فشل في إنشاء الحملة");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });

      toast({
        title: "تم إنشاء الحملة بنجاح",
        description: "يمكنك الآن متابعة أداء الحملة من لوحة التحكم",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في إنشاء الحملة",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(platformConfig).map(([platform, config]) => (
          <div
            key={platform}
            className="p-4 rounded-lg cursor-pointer transition-all duration-200 border-2"
            style={{
              backgroundColor: selectedPlatform === platform ? config.color : 'transparent',
              borderColor: config.color,
              color: selectedPlatform === platform ? 'white' : 'inherit',
            }}
            onClick={() => setSelectedPlatform(platform)}
          >
            <h3 className="font-medium text-center">{config.label}</h3>
            <p className="text-sm text-center mt-2">
              {selectedPlatform === platform ? "تم الاختيار" : "اضغط للاختيار"}
            </p>
          </div>
        ))}
      </div>

      {selectedPlatform && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الحملة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم الحملة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الحملة</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب وصفاً مختصراً للحملة"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الميزانية</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="أدخل ميزانية الحملة"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء الحملة"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}