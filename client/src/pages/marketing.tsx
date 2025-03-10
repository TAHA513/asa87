
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Megaphone, TrendingUp, Users, DollarSign, AlertTriangle, Plus, Facebook, Twitter, Instagram, Linkedin, FileSpreadsheet } from "lucide-react";
import type { Campaign, SocialMediaAccount } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// تعريف أنواع البيانات
type SocialStats = {
  impressions: number;
  engagement: number;
  spend: number;
};

type PlatformStat = {
  platform: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
};

type HistoricalData = {
  date: string;
  impressions: number;
  engagements: number;
  spend: number;
  facebook?: number;
  instagram?: number;
  twitter?: number;
  linkedin?: number;
};

export default function MarketingPage() {
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");
  const [tab, setTab] = useState("overview");
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // جلب الحملات التسويقية
  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/marketing/campaigns"],
  });

  // جلب حسابات منصات التواصل الاجتماعي
  const { data: accounts = [], refetch: refetchAccounts } = useQuery<SocialMediaAccount[]>({
    queryKey: ["/api/marketing/social-accounts"],
  });

  // جلب إحصائيات منصات التواصل الاجتماعي
  const { data: socialStats = { impressions: 0, engagement: 0, spend: 0 } } = useQuery<SocialStats>({
    queryKey: ["/api/marketing/social-stats"],
    refetchInterval: 300000, // تحديث كل 5 دقائق
  });

  // جلب البيانات التاريخية
  const { data: historicalData = [] } = useQuery<HistoricalData[]>({
    queryKey: ["/api/marketing/historical-stats", timeRange],
    refetchInterval: 600000, // تحديث كل 10 دقائق
  });

  // إضافة حملة جديدة
  const addCampaign = useMutation({
    mutationFn: async (campaign: Omit<Campaign, "id" | "userId">) => {
      const response = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل في إنشاء الحملة");
      }

      return response.json();
    },
    onSuccess: () => {
      setShowNewCampaign(false);
      refetchCampaigns();
      toast.success("تم إنشاء الحملة بنجاح");
    },
    onError: (error) => {
      toast.error(`فشل في إنشاء الحملة: ${error.message}`);
    },
  });

  // تصفية الحملات النشطة
  const activeCampaigns = campaigns.filter(campaign => campaign.status === "active");

  // ربط حساب منصة تواصل اجتماعي
  const connectSocialAccount = async (platform: string) => {
    setIsConnecting(platform);
    const authWindow = window.open(`/api/marketing/social-auth/${platform}`, `${platform}_auth`, "width=600,height=700");
    
    // استماع للرسالة من نافذة المصادقة
    window.addEventListener("message", async (event) => {
      if (event.data?.type === "social-auth-success" && event.data?.platform === platform) {
        refetchAccounts();
        toast.success(`تم ربط حساب ${platformNames[platform]} بنجاح`);
        setIsConnecting(null);
      }
    });
  };

  // حذف حساب منصة تواصل اجتماعي
  const disconnectAccount = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await fetch(`/api/marketing/social-accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل في إلغاء ربط الحساب");
      }

      return response.json();
    },
    onSuccess: () => {
      refetchAccounts();
      toast.success("تم إلغاء ربط الحساب بنجاح");
    },
    onError: (error) => {
      toast.error(`فشل في إلغاء ربط الحساب: ${error.message}`);
    },
  });

  // أسماء المنصات بالعربية
  const platformNames: Record<string, string> = {
    facebook: "فيسبوك",
    twitter: "تويتر",
    instagram: "انستغرام",
    linkedin: "لينكد إن",
    tiktok: "تيك توك",
    snapchat: "سناب شات",
  };

  // أيقونات المنصات
  const platformIcons: Record<string, React.ReactNode> = {
    facebook: <Facebook className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
    tiktok: <TrendingUp className="h-5 w-5" />,
    snapchat: <AlertTriangle className="h-5 w-5" />,
  };

  // تنسيق تكلفة الإعلان بالدينار العراقي
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "currency",
      currency: "IQD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // تنسيق النسبة المئوية
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "percent",
      maximumFractionDigits: 2,
    }).format(value);
  };

  // حالة ريندر نموذج إنشاء حملة جديدة
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    platforms: [] as string[],
    budget: "0",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "active" as "active" | "paused" | "completed",
  });

  // التعامل مع تغيير قيم نموذج الحملة الجديدة
  const handleCampaignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCampaign({ ...newCampaign, [name]: value });
  };

  // التعامل مع تغيير المنصات المحددة
  const handlePlatformChange = (platform: string) => {
    setNewCampaign(prev => {
      const platforms = prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform];
      return { ...prev, platforms };
    });
  };

  // التعامل مع إرسال نموذج الحملة الجديدة
  const handleSubmitCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCampaign.name) {
      toast.error("يرجى إدخال اسم الحملة");
      return;
    }
    
    if (newCampaign.platforms.length === 0) {
      toast.error("يرجى اختيار منصة واحدة على الأقل");
      return;
    }
    
    addCampaign.mutate(newCampaign);
  };

  return (
    <div className="container py-6 space-y-6 rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">التسويق والإعلانات</h1>
        <Button onClick={() => setShowNewCampaign(true)}>
          <Plus className="h-4 w-4 ml-2" />
          حملة جديدة
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full" value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="campaigns">الحملات</TabsTrigger>
          <TabsTrigger value="accounts">حسابات التواصل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* بطاقات الاحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المشاهدات</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {socialStats.impressions.toLocaleString("ar-IQ")}
                </div>
                <p className="text-xs text-muted-foreground">
                  إجمالي المشاهدات عبر جميع المنصات
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">نسبة التفاعل</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(socialStats.engagement)}
                </div>
                <p className="text-xs text-muted-foreground">
                  متوسط نسبة التفاعل مع المحتوى
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">تكلفة الإعلانات</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(socialStats.spend)}
                </div>
                <p className="text-xs text-muted-foreground">
                  إجمالي الإنفاق خلال الفترة الحالية
                </p>
              </CardContent>
            </Card>
          </div>

          {/* رسوم بيانية للأداء */}
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأداء التسويقي</CardTitle>
              <CardDescription>
                مقارنة أداء المنصات المختلفة خلال الفترة الزمنية المحددة
              </CardDescription>
              <div className="flex gap-2">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="اختر الفترة الزمنية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">آخر 7 أيام</SelectItem>
                    <SelectItem value="30d">آخر 30 يوم</SelectItem>
                    <SelectItem value="90d">آخر 90 يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="h-96">
              {historicalData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد بيانات كافية لعرض الرسم البياني</p>
                  <p className="text-sm text-muted-foreground mt-2">قم بربط حسابات التواصل الاجتماعي وإنشاء حملات لمشاهدة البيانات</p>
                </div>
              ) : (
                <div className="h-full">
                  {/* هنا يمكن إضافة مكتبة رسوم بيانية مثل Chart.js أو recharts */}
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">الرسم البياني سيظهر هنا عند توفر البيانات</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* حملات نشطة */}
          <Card>
            <CardHeader>
              <CardTitle>الحملات النشطة</CardTitle>
              <CardDescription>
                {activeCampaigns.length} حملة نشطة من أصل {campaigns.length} حملة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeCampaigns.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>لا توجد حملات نشطة</AlertTitle>
                  <AlertDescription>
                    ابدأ بإنشاء حملة جديدة لتعزيز مبيعاتك وزيادة ظهور علامتك التجارية
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {activeCampaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(campaign.startDate).toLocaleDateString("ar-IQ")} - {new Date(campaign.endDate).toLocaleDateString("ar-IQ")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {campaign.platforms.map((platform) => (
                          <div key={platform} className="p-1">
                            {platformIcons[platform]}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {activeCampaigns.length > 0 && (
              <CardFooter>
                <Button variant="outline" onClick={() => setTab("campaigns")} className="w-full">
                  عرض جميع الحملات
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>الحملات التسويقية</CardTitle>
                <CardDescription>إدارة حملاتك التسويقية وتتبع أدائها</CardDescription>
              </div>
              <Button onClick={() => setShowNewCampaign(true)}>
                <Plus className="h-4 w-4 ml-2" />
                حملة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-6">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد حملات بعد</h3>
                  <p className="text-muted-foreground mb-4">ابدأ بإنشاء حملة تسويقية لزيادة مبيعاتك</p>
                  <Button onClick={() => setShowNewCampaign(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إنشاء حملة الآن
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{campaign.name}</CardTitle>
                            <CardDescription>
                              {new Date(campaign.startDate).toLocaleDateString("ar-IQ")} - {new Date(campaign.endDate).toLocaleDateString("ar-IQ")}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {campaign.platforms.map((platform) => (
                              <div key={platform} className="p-1">
                                {platformIcons[platform]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{campaign.description}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                            <span>الميزانية: {formatCurrency(Number(campaign.budget))}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              campaign.status === "active" 
                                ? "bg-green-100 text-green-800" 
                                : campaign.status === "paused"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {campaign.status === "active" ? "نشطة" : campaign.status === "paused" ? "متوقفة" : "مكتملة"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>حسابات التواصل الاجتماعي</CardTitle>
              <CardDescription>ربط حسابات منصات التواصل الاجتماعي لإدارة حملاتك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(platformNames).map(([platform, name]) => {
                  const platformAccount = accounts.find(acc => acc.platform === platform);
                  
                  return (
                    <Card key={platform}>
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{name}</CardTitle>
                          <CardDescription>
                            {platformAccount ? `متصل كـ ${platformAccount.accountName}` : "غير متصل"}
                          </CardDescription>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
                          {platformIcons[platform]}
                        </div>
                      </CardHeader>
                      <CardFooter>
                        {platformAccount ? (
                          <Button 
                            variant="destructive" 
                            onClick={() => disconnectAccount.mutate(platformAccount.id)}
                            className="w-full"
                          >
                            إلغاء الربط
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={() => connectSocialAccount(platform)}
                            disabled={isConnecting === platform}
                            className="w-full"
                          >
                            {isConnecting === platform ? "جاري الربط..." : "ربط الحساب"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الواجهة البرمجية</CardTitle>
              <CardDescription>مفاتيح API للاتصال بمنصات التواصل الاجتماعي</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>تحتاج إلى مفاتيح API من منصات التواصل الاجتماعي</AlertTitle>
                <AlertDescription>
                  للاستفادة من كامل ميزات التسويق، قم بإضافة مفاتيح API الخاصة بكل منصة في الإعدادات
                </AlertDescription>
              </Alert>
              <Button variant="outline" className="w-full">
                الانتقال إلى صفحة الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* حوار إنشاء حملة جديدة */}
      <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إنشاء حملة تسويقية جديدة</DialogTitle>
            <DialogDescription>
              أضف تفاصيل الحملة التسويقية الجديدة واختر المنصات التي تريد استهدافها
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCampaign}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم الحملة</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="أدخل اسم الحملة"
                  value={newCampaign.name}
                  onChange={handleCampaignChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">وصف الحملة</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="أدخل وصفاً مختصراً للحملة"
                  value={newCampaign.description}
                  onChange={handleCampaignChange}
                />
              </div>
              <div className="grid gap-2">
                <Label>المنصات</Label>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(platformNames).map(([platform, name]) => (
                    <div key={platform} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`platform-${platform}`}
                        checked={newCampaign.platforms.includes(platform)}
                        onCheckedChange={() => handlePlatformChange(platform)}
                      />
                      <Label htmlFor={`platform-${platform}`} className="cursor-pointer">
                        {name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">الميزانية (بالدينار العراقي)</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="أدخل الميزانية"
                  value={newCampaign.budget}
                  onChange={handleCampaignChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">تاريخ البدء</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newCampaign.startDate}
                    onChange={handleCampaignChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newCampaign.endDate}
                    onChange={handleCampaignChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">حالة الحملة</Label>
                <Select
                  name="status"
                  value={newCampaign.status}
                  onValueChange={(value) => setNewCampaign({...newCampaign, status: value as "active" | "paused" | "completed"})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر حالة الحملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="paused">متوقفة</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewCampaign(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={addCampaign.isPending}>
                {addCampaign.isPending ? "جاري الإنشاء..." : "إنشاء الحملة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
