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

export function PlatformPerformanceGraphs() {
  // Fetch platform-specific analytics
  const { data: platformStats = [] } = useQuery({
    queryKey: ["/api/marketing/platform-stats"],
    refetchInterval: 300000, // تحديث كل 5 دقائق
  });

  // Fetch historical analytics
  const { data: historicalData = [] } = useQuery({
    queryKey: ["/api/marketing/historical-stats"],
    refetchInterval: 300000,
  });

  return (
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
                <Tooltip />
                <Legend />
                <Bar dataKey="impressions" name="الانطباعات" fill="#8884d8" />
                <Bar dataKey="engagements" name="التفاعلات" fill="#82ca9d" />
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
                <Tooltip />
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
                <Tooltip />
                <Legend />
                {platformStats.map((platform: any) => (
                  <Line
                    key={platform.name}
                    type="monotone"
                    dataKey={platform.name}
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
  );
}
