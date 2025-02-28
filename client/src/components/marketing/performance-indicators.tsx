import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Share2, 
  Heart, 
  MessageCircle,
  BarChart2,
  Globe,
  Target,
  Zap,
  Eye,
  MousePointer,
  DollarSign
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function PerformanceIndicators() {
  // Fetch platform-specific analytics
  const { data: platformStats = [], isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/marketing/platform-stats"],
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  const indicators = [
    {
      title: "معدل المشاركة",
      icon: Share2,
      value: platformStats.length > 0 
        ? `${((platformStats.reduce((acc: number, curr: any) => acc + curr.engagement, 0) / platformStats.length) * 100).toFixed(2)}%`
        : "0%",
      change: "+12.3%",
      color: "text-blue-600"
    },
    {
      title: "معدل التفاعل",
      icon: Heart,
      value: platformStats.length > 0
        ? `${((platformStats.reduce((acc: number, curr: any) => acc + curr.interactions, 0) / platformStats.length) * 100).toFixed(2)}%`
        : "0%",
      change: "+5.7%",
      color: "text-rose-500"
    },
    {
      title: "الوصول الكلي",
      icon: Users,
      value: platformStats.length > 0
        ? platformStats.reduce((acc: number, curr: any) => acc + curr.reach, 0).toLocaleString()
        : "0",
      change: "+28.4%",
      color: "text-green-500"
    },
    {
      title: "معدل الردود",
      icon: MessageCircle,
      value: platformStats.length > 0
        ? `${((platformStats.reduce((acc: number, curr: any) => acc + curr.responseRate, 0) / platformStats.length) * 100).toFixed(2)}%`
        : "0%",
      change: "+3.2%",
      color: "text-purple-500"
    },
    // Additional performance metrics
    {
      title: "الانطباعات",
      icon: Eye,
      value: "0",
      change: "0%",
      color: "text-cyan-500"
    },
    {
      title: "معدل النقر",
      icon: MousePointer,
      value: "0%",
      change: "0%",
      color: "text-amber-500"
    },
    {
      title: "تكلفة النقرة",
      icon: DollarSign,
      value: "$0.00",
      change: "0%",
      color: "text-emerald-500"
    },
    {
      title: "معدل التحويل",
      icon: Target,
      value: "0%",
      change: "0%",
      color: "text-indigo-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {indicators.map((indicator, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {indicator.title}
              </CardTitle>
              <indicator.icon className={`h-4 w-4 ${indicator.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{indicator.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  {indicator.change} من الشهر الماضي
                </div>
                <Progress 
                  value={Math.random() * 100} 
                  className="h-1" 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* مؤشرات نشاط المنصات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Snapchat'].map((platform, index) => (
          <Card key={platform}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {platform}
              </CardTitle>
              <Globe className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">النشاط</span>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">المشاهدات:</span>
                    <span className="ml-1">0</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">التفاعلات:</span>
                    <span className="ml-1">0</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">النقرات:</span>
                    <span className="ml-1">0</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">المشاركات:</span>
                    <span className="ml-1">0</span>
                  </div>
                </div>
                <Progress 
                  value={0} 
                  className="h-1" 
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">تحديث مباشر</span>
                  <Activity className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}