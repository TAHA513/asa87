import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// تعريف أنواع البيانات
interface PlatformData {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

interface AnalyticsProps {
  platformData: PlatformData[];
}

export function PlatformAnalytics({ platformData }: AnalyticsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [filteredData, setFilteredData] = useState<PlatformData[]>([]);

  // جلب البيانات من API
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/marketing/analytics", selectedPlatform, dateRange],
    enabled: !!user,
  });

  // تحديث البيانات عند تغيير المنصة أو النطاق الزمني
  useEffect(() => {
    let filtered = analyticsData || [];
    if (selectedPlatform !== "all") {
      filtered = filtered.filter((item) => item.name === selectedPlatform);
    }
    setFilteredData(filtered);
  }, [selectedPlatform, analyticsData]);

  // حساب المؤشرات
  const totalSpend = filteredData.reduce((sum, item) => sum + item.spend, 0);
  const totalClicks = filteredData.reduce((sum, item) => sum + item.clicks, 0);
  const totalConversions = filteredData.reduce((sum, item) => sum + item.conversions, 0);
  const totalImpressions = filteredData.reduce((sum, item) => sum + item.impressions, 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">يرجى تسجيل الدخول وربط حسابات التواصل الاجتماعي لعرض التحليلات</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">لا توجد بيانات متاحة. يرجى ربط حسابات التواصل الاجتماعي أولاً.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">أداء المنصات</h2>
        <div className="flex gap-4">
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
          />
          <Select
            value={selectedPlatform}
            onValueChange={setSelectedPlatform}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر المنصة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المنصات</SelectItem>
              <SelectItem value="facebook">فيسبوك</SelectItem>
              <SelectItem value="instagram">انستغرام</SelectItem>
              <SelectItem value="twitter">تويتر</SelectItem>
              <SelectItem value="tiktok">تيك توك</SelectItem>
              <SelectItem value="snapchat">سناب شات</SelectItem>
              <SelectItem value="linkedin">لينكد إن</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المشاهدات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {totalImpressions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>النقرات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {totalClicks.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>معدل التحويل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {totalClicks === 0 ? 0 : ((totalConversions / totalClicks) * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>الإنفاق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ${totalSpend.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>مقارنة المشاهدات والنقرات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="impressions" name="المشاهدات" fill="#8884d8" />
                  <Bar dataKey="clicks" name="النقرات" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التحويلات والإنفاق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="conversions"
                    name="التحويلات"
                    stroke="#8884d8"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="spend"
                    name="الإنفاق"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}