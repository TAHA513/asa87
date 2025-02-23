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
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const socialPlatforms = [
  { id: "facebook", label: "فيسبوك" },
  { id: "instagram", label: "انستغرام" },
  { id: "twitter", label: "تويتر" },
  { id: "linkedin", label: "لينكد إن" },
  { id: "snapchat", label: "سناب شات" },
  { id: "tiktok", label: "تيك توك" },
];

export default function CampaignForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      name: "",
      description: "",
      platforms: [],
      budget: 0,
      startDate: new Date(),
      endDate: undefined,
    },
  });

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/marketing/campaigns", {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/marketing/campaigns"] });

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الحملة التسويقية بنجاح",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الحملة التسويقية",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الحملة</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platforms"
          render={() => (
            <FormItem>
              <FormLabel>منصات التواصل الاجتماعي</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {socialPlatforms.map((platform) => (
                  <FormField
                    key={platform.id}
                    control={form.control}
                    name="platforms"
                    render={({ field }) => {
                      const value = field.value || [];
                      return (
                        <FormItem className="flex items-center space-x-3 space-x-reverse">
                          <FormControl>
                            <Checkbox
                              checked={value.includes(platform.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...value, platform.id]);
                                } else {
                                  field.onChange(value.filter((v: string) => v !== platform.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {platform.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
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
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ البدء</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ الانتهاء (اختياري)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "جاري الإنشاء..." : "إنشاء الحملة"}
        </Button>
      </form>
    </Form>
  );
}