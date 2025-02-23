import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDays, format } from "date-fns";
import { ar } from "date-fns/locale";

interface CampaignAnalyticsProps {
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  platformColors: Record<string, string>;
}

export function CampaignAnalytics({
  selectedPlatform,
  onPlatformChange,
  platformColors
}: CampaignAnalyticsProps) {
  const [dateRange, setDateRange] = useState({
    start: addDays(new Date(), -30),
    end: new Date(),
  });

  // جلب البيانات الفعلية من الخادم
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: [
      "/api/marketing/analytics",
      dateRange.start,
      dateRange.end,
      selectedPlatform,
    ],
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!analyticsData?.platforms?.length) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">لا توجد بيانات متاحة حالياً</p>
        <p className="text-sm text-muted-foreground mt-2">قم بربط حسابات وسائل التواصل الاجتماعي لعرض التحليلات</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* أدوات التصفية */}
      <div className="flex flex-wrap gap-4">
        <Select
          value={selectedPlatform}
          onValueChange={onPlatformChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر المنصة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المنصات</SelectItem>
            <SelectItem value="facebook">فيسبوك</SelectItem>
            <SelectItem value="instagram">انستغرام</SelectItem>
            <SelectItem value="twitter">تويتر</SelectItem>
            <SelectItem value="snapchat">سناب شات</SelectItem>
            <SelectItem value="tiktok">تيك توك</SelectItem>
            <SelectItem value="linkedin">لينكد إن</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDateRange({
              start: addDays(new Date(), -7),
              end: new Date(),
            })}
          >
            آخر 7 أيام
          </Button>
          <Button
            variant="outline"
            onClick={() => setDateRange({
              start: addDays(new Date(), -30),
              end: new Date(),
            })}
          >
            آخر 30 يوم
          </Button>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid gap-8">
        <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
          <CardHeader>
            <CardTitle>أداء الحملات</CardTitle>
            <CardDescription>تحليل الانطباعات والنقرات والتحويلات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analyticsData.timeSeries}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stackId="1"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorImpressions)"
                    name="الانطباعات"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stackId="2"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                    name="النقرات"
                  />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    stackId="3"
                    stroke="#ffc658"
                    fillOpacity={1}
                    fill="url(#colorConversions)"
                    name="التحويلات"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors">
          <CardHeader>
            <CardTitle>أداء المنصات</CardTitle>
            <CardDescription>مقارنة الأداء بين منصات التواصل الاجتماعي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.platforms}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="impressions"
                    name="الانطباعات"
                    fill={platformColors.facebook}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="clicks"
                    name="النقرات"
                    fill={platformColors.instagram}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="conversions"
                    name="التحويلات"
                    fill={platformColors.twitter}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const platformColors = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  tiktok: "#000000",
  snapchat: "#FFFC00",
  linkedin: "#0A66C2",
};

export default CampaignAnalytics;