import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsSocket } from "@/lib/websocket";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { MetricsLineChart, MetricsAreaChart } from "./ChartComponents";
import type { AnalyticsFilters, PlatformMetrics } from "./types";
import { useAuth } from "@/hooks/use-auth";
import LiveUpdates from "./LiveUpdates";

const platforms = {
  facebook: "فيسبوك",
  instagram: "انستغرام",
  twitter: "تويتر",
  tiktok: "تيك توك",
  snapchat: "سناب شات",
  linkedin: "لينكد إن"
};

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AnalyticsFilters>({
    platform: "all",
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
  });

  const { data: metrics, isLoading } = useQuery<PlatformMetrics[]>({
    queryKey: ["/api/marketing/analytics", filters],
    enabled: !!user,
  });

  const renderMetricCard = (
    title: string,
    value: number,
    description: string,
    format: (val: number) => string = (val) => val.toLocaleString('ar-IQ')
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{format(value)}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const renderPlatformTab = (platform: PlatformMetrics) => (
    <TabsContent value={platform.platform} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
          "المشاهدات",
          platform.totalImpressions,
          "إجمالي عدد مرات ظهور الإعلان"
        )}
        {renderMetricCard(
          "النقرات",
          platform.totalClicks,
          "إجمالي عدد النقرات"
        )}
        {renderMetricCard(
          "معدل النقر",
          platform.ctr,
          "نسبة النقر إلى الظهور",
          (val) => `${(val * 100).toFixed(2)}%`
        )}
        {renderMetricCard(
          "التحويلات",
          platform.totalConversions,
          "إجمالي عدد التحويلات"
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricsLineChart
          data={platform.trend.dates.map((date, i) => ({
            date,
            value: platform.trend.impressions[i],
            secondaryValue: platform.trend.clicks[i],
          }))}
          title="تحليل الأداء"
          description="المشاهدات والنقرات على مدار الوقت"
          primaryMetric="المشاهدات"
          secondaryMetric="النقرات"
        />

        <MetricsAreaChart
          data={platform.trend.dates.map((date, i) => ({
            date,
            value: platform.trend.spend[i],
            secondaryValue: (platform.trend.conversions[i] * 100) / platform.trend.spend[i],
          }))}
          title="العائد والتكلفة"
          description="تحليل الإنفاق والعائد على الاستثمار"
          primaryMetric="الإنفاق"
          secondaryMetric="العائد على الاستثمار"
        />
      </div>

      <LiveUpdates />
    </TabsContent>
  );

  if (isLoading) {
    return <div className="grid gap-4">
      <Skeleton className="h-[200px]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[100px]" />
        ))}
      </div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">تحليلات الحملات</h2>
        <DateRangePicker
          value={filters.dateRange}
          onChange={(range: DateRange) =>
            setFilters((prev) => ({ ...prev, dateRange: range || prev.dateRange }))
          }
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">جميع المنصات</TabsTrigger>
          {Object.entries(platforms).map(([key, title]) => (
            <TabsTrigger key={key} value={key}>
              {title}
            </TabsTrigger>
          ))}
        </TabsList>

        {metrics?.map((platform) => renderPlatformTab(platform))}
      </Tabs>
    </div>
  );
}