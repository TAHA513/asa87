import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, TrendingUp, Users, DollarSign } from "lucide-react";
import type { Campaign } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import { CampaignAnalytics } from "@/components/marketing/campaign-analytics";
import { useAnalyticsSocket } from "@/hooks/use-analytics-socket";
import CampaignForm from "@/components/marketing/campaign-form";
import SocialAccounts from "@/components/marketing/social-accounts";
import { Redirect } from "wouter";

// تكوين الألوان حسب المنصات
const platformColors = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  snapchat: "#FFFC00",
  tiktok: "#000000",
  linkedin: "#0A66C2",
};

export default function MarketingPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const socket = useAnalyticsSocket();

  // التحقق من تسجيل الدخول
  if (isAuthLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const { data: campaigns = [], isLoading: isCampaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/marketing/campaigns"],
    enabled: !!user,
  });

  // تصفية الحملات النشطة
  const activeCampaigns = campaigns.filter(campaign => campaign.status === "active");

  if (isCampaignsLoading) {
    return <div>جاري تحميل البيانات...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Megaphone className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">التسويق</h1>
            </div>
            <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  إنشاء حملة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>إنشاء حملة إعلانية جديدة</DialogTitle>
                  <DialogDescription>
                    اختر المنصة التي تريد إنشاء حملة إعلانية عليها
                  </DialogDescription>
                </DialogHeader>
                <CampaignForm onSuccess={() => setShowNewCampaign(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* حسابات المنصات الاجتماعية */}
          <SocialAccounts />

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  الحملات النشطة
                </CardTitle>
                <Megaphone className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {activeCampaigns.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  إجمالي الانطباعات
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  -
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  معدل التحويل
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  -
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  إجمالي الإنفاق
                </CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  -
                </div>
              </CardContent>
            </Card>
          </div>

          {/* مكون التحليلات */}
          <CampaignAnalytics 
            selectedPlatform={selectedPlatform}
            onPlatformChange={setSelectedPlatform}
            platformColors={platformColors}
          />
        </div>
      </main>
    </div>
  );
}