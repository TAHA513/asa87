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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/sidebar";
import CampaignForm from "@/components/marketing/campaign-form";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function MarketingPage() {
  const [showNewCampaign, setShowNewCampaign] = useState(false);

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/marketing/campaigns"],
  });

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "active"
  );

  // بيانات تجريبية للرسوم البيانية
  const performanceData = [
    { name: "يناير", انطباعات: 4000, نقرات: 2400, تحويلات: 400 },
    { name: "فبراير", انطباعات: 3000, نقرات: 1398, تحويلات: 210 },
    { name: "مارس", انطباعات: 2000, نقرات: 9800, تحويلات: 290 },
    { name: "أبريل", انطباعات: 2780, نقرات: 3908, تحويلات: 300 },
  ];

  const platformData = [
    { name: "فيسبوك", قيمة: 4000 },
    { name: "انستغرام", قيمة: 3000 },
    { name: "تويتر", قيمة: 2000 },
    { name: "لينكد إن", قيمة: 2780 },
    { name: "سناب شات", قيمة: 1890 },
    { name: "تيك توك", قيمة: 2390 },
  ];

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Megaphone className="h-6 w-6" />
              <h1 className="text-3xl font-bold">التسويق</h1>
            </div>
            <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
              <DialogTrigger asChild>
                <Button>إنشاء حملة جديدة</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>إنشاء حملة تسويقية جديدة</DialogTitle>
                </DialogHeader>
                <CampaignForm />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  الحملات النشطة
                </CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCampaigns.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  إجمالي الانطباعات
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48.2K</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  معدل التحويل
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  إجمالي الإنفاق
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4,325</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>أداء الحملات</CardTitle>
                <CardDescription>
                  تحليل الانطباعات والنقرات والتحويلات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="انطباعات"
                        stroke="#8884d8"
                      />
                      <Line type="monotone" dataKey="نقرات" stroke="#82ca9d" />
                      <Line
                        type="monotone"
                        dataKey="تحويلات"
                        stroke="#ffc658"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أداء المنصات</CardTitle>
                <CardDescription>
                  مقارنة الأداء بين منصات التواصل الاجتماعي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="قيمة" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}