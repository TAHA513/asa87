import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Sidebar } from "@/components/ui/sidebar";
import { useLocation } from "wouter";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "يجب أن يحتوي العنوان على حرفين على الأقل",
  }),
  content: z.string().min(10, {
    message: "يجب أن يحتوي المحتوى على 10 أحرف على الأقل",
  }),
  target: z.enum(["all", "customers", "suppliers"]),
});

export default function MarketingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campaignStats, setCampaignStats] = useState({
    total: 0,
    opened: 0,
    clicked: 0,
  });
  const [, navigate] = useLocation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      target: "all",
    },
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/marketing/campaigns");
      const data = await response.json();
      setCampaigns(data || []);

      // Fetch campaign statistics
      const statsResponse = await fetch("/api/marketing/platform-stats");
      const statsData = await statsResponse.json();
      setCampaignStats({
        total: statsData.length || 0,
        opened: statsData.filter((s: any) => s.opened)?.length || 0,
        clicked: statsData.filter((s: any) => s.clicked)?.length || 0,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في جلب الحملات التسويقية",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("فشل في إنشاء الحملة");
      }

      toast({
        title: "تم إنشاء الحملة بنجاح",
        description: "تم إنشاء الحملة التسويقية بنجاح",
      });

      form.reset();
      fetchCampaigns();
      navigate("/marketing");
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الحملة التسويقية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">التسويق</h1>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>إجمالي الحملات</CardTitle>
                <CardDescription>
                  عدد الحملات التسويقية النشطة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{campaignStats.total || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>معدل الفتح</CardTitle>
                <CardDescription>
                  نسبة الرسائل التي تم فتحها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {campaignStats.total
                    ? Math.round(
                        (campaignStats.opened / campaignStats.total) * 100
                      )
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>معدل النقر</CardTitle>
                <CardDescription>
                  نسبة الرسائل التي تم النقر عليها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {campaignStats.total
                    ? Math.round(
                        (campaignStats.clicked / campaignStats.total) * 100
                      )
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>إنشاء حملة جديدة</CardTitle>
                <CardDescription>
                  أنشئ حملة تسويقية جديدة لعملائك أو مورديك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الحملة</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="أدخل عنوان الحملة"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>محتوى الحملة</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="أدخل محتوى الحملة"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الفئة المستهدفة</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الفئة المستهدفة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">الجميع</SelectItem>
                              <SelectItem value="customers">العملاء</SelectItem>
                              <SelectItem value="suppliers">الموردين</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={loading}>
                      {loading ? "جاري الإنشاء..." : "إنشاء الحملة"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الحملات الحالية</CardTitle>
                <CardDescription>
                  قائمة بالحملات التسويقية الحالية
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    لا توجد حملات حالية
                  </p>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign: any) => (
                      <Card key={campaign.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {campaign.title}
                          </CardTitle>
                          <CardDescription>
                            المستهدفون:{" "}
                            {campaign.target === "all"
                              ? "الجميع"
                              : campaign.target === "customers"
                              ? "العملاء"
                              : "الموردين"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm truncate">{campaign.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}