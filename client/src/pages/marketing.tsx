import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, MegaphoneIcon, Send, Users } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
      setCampaigns(data.campaigns || []);

      // Fetch campaign statistics
      const statsResponse = await fetch("/api/marketing/statistics");
      const statsData = await statsResponse.json();
      setCampaignStats(statsData);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل حملات التسويق",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast({
          title: "تم إنشاء الحملة",
          description: "تم إنشاء حملة التسويق بنجاح",
        });
        form.reset();
        fetchCampaigns();
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ",
          description: errorData.message || "فشل في إنشاء الحملة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء الحملة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">التسويق والحملات</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء حملة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إنشاء حملة تسويقية جديدة</DialogTitle>
                  <DialogDescription>
                    أنشئ حملة تسويقية جديدة لإرسالها إلى العملاء أو الموردين
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عنوان الحملة</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل عنوان الحملة" {...field} />
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
                              placeholder="أدخل محتوى الحملة التسويقية"
                              {...field}
                              rows={5}
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

                    <DialogFooter>
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        إرسال الحملة
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">إجمالي الحملات</CardTitle>
                <MegaphoneIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaignStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">معدل الفتح</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaignStats.opened}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">معدل النقر</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaignStats.clicked}%</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>الحملات التسويقية</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">لا توجد حملات تسويقية بعد</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold">{campaign.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {campaign.content.substring(0, 100)}
                              {campaign.content.length > 100 ? "..." : ""}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <p>
                                الفئة المستهدفة:{" "}
                                {campaign.target === "all"
                                  ? "الجميع"
                                  : campaign.target === "customers"
                                  ? "العملاء"
                                  : "الموردين"}
                              </p>
                              <p className="mx-2">•</p>
                              <p>{new Date(campaign.createdAt).toLocaleDateString('ar-AE')}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/campaign/${campaign.id}`)}>
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}