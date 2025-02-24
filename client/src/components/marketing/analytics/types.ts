import { z } from "zod";

// نوع البيانات الأساسي للتحليلات
export const analyticsDataSchema = z.object({
  impressions: z.number(),
  clicks: z.number(),
  conversions: z.number(),
  spend: z.number(),
  date: z.string(),
});

export type AnalyticsData = z.infer<typeof analyticsDataSchema>;

// أنواع الفلاتر
export interface AnalyticsFilters {
  platform: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

// نوع البيانات المجمعة
export interface AggregatedMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalSpend: number;
  ctr: number; // Click-through rate
  conversionRate: number;
  cpc: number; // Cost per click
  roi: number; // Return on investment
}

// نوع البيانات لكل منصة
export interface PlatformMetrics extends AggregatedMetrics {
  platform: string;
  trend: {
    impressions: number[];
    clicks: number[];
    conversions: number[];
    spend: number[];
    dates: string[];
  };
}
