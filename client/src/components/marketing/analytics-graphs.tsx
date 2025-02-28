import { useQuery } from "@tanstack/react-query";
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
  AreaChart,
  Area
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type PlatformStats = {
  platform: string;
  name: string;
  color: string;
  impressions: number;
  engagements: number;
  spend: number;
};

type HistoricalStats = {
  date: string;
  impressions: number;
  engagements: number;
  spend: number;
  [key: string]: number | string; // For platform-specific data
};

export function PlatformPerformanceGraphs() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch platform-specific analytics with real-time data
  const { data: platformStats = [] } = useQuery<PlatformStats[]>({
    queryKey: ["/api/marketing/platform-stats"],
    refetchInterval: 300000, // تحديث كل 5 دقائق
  });

  // Fetch historical analytics with selected time range
  const { data: historicalData = [] } = useQuery<HistoricalStats[]>({
    queryKey: ["/api/marketing/historical-stats", timeRange],
    refetchInterval: 300000,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر النطاق الزمني" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">آخر 7 أيام</SelectItem>
            <SelectItem value="30d">آخر 30 يوم</SelectItem>
            <SelectItem value="90d">آخر 90 يوم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أداء المنصات</CardTitle>
            <CardDescription>
              إحصائيات حسب كل منصة تواصل اجتماعي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background p-2 rounded-lg border shadow-sm">
                            <p className="font-bold">{data.name}</p>
                            <p>انطباعات: {data.impressions.toLocaleString()}</p>
                            <p>تفاعلات: {data.engagements.toLocaleString()}</p>
                            <p>إنفاق: ${data.spend.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {platformStats.map((platform) => (
                    <Bar
                      key={platform.platform}
                      dataKey="impressions"
                      name={platform.name}
                      fill={platform.color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تحليل الأداء عبر الزمن</CardTitle>
            <CardDescription>
              تطور الأداء على مدار الوقت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background p-2 rounded-lg border shadow-sm">
                            <p className="font-bold">{label}</p>
                            {payload.map((entry) => (
                              <p key={entry.name} style={{ color: entry.color }}>
                                {entry.name}: {entry.value.toLocaleString()}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    name="الانطباعات"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagements"
                    name="التفاعلات"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    name="الإنفاق"
                    stroke="#ffc658"
                    fill="#ffc658"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>تحليل حسب المنصة</CardTitle>
            <CardDescription>
              مقارنة أداء كل منصة بشكل تفصيلي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background p-2 rounded-lg border shadow-sm">
                            <p className="font-bold">{label}</p>
                            {payload.map((entry) => (
                              <p key={entry.name} style={{ color: entry.stroke }}>
                                {entry.name}: {entry.value.toLocaleString()}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  {platformStats.map((platform) => (
                    <Line
                      key={platform.name}
                      type="monotone"
                      dataKey={platform.platform}
                      name={platform.name}
                      stroke={platform.color}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}