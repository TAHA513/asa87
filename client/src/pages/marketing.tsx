import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import type { Campaign } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/sidebar";
import { CampaignAnalytics } from "@/components/marketing/campaign-analytics";
import { useAnalyticsSocket } from "@/hooks/use-analytics-socket";

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
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const socket = useAnalyticsSocket();

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/marketing/campaigns"],
  });

  // تصفية الحملات النشطة
  const activeCampaigns = campaigns.filter(campaign => campaign.status === "active");

  // إحصائيات عامة
  const stats = {
    activeCampaigns: activeCampaigns.length,
    totalImpressions: "48.2K",
    conversionRate: "2.4%",
    totalSpend: "$4,325",
    roi: "156%"
  };

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
            <Button className="bg-primary hover:bg-primary/90">
              إنشاء حملة جديدة
            </Button>
          </div>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  الحملات النشطة
                </CardTitle>
                <Megaphone className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {stats.activeCampaigns}
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
                  {stats.totalImpressions}
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
                  {stats.conversionRate}
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
                  {stats.totalSpend}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  العائد على الاستثمار
                </CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">
                  {stats.roi}
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