import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

// تعريف أنماط البيانات
interface SalesData {
  date: string;
  amount: number;
  orders: number;
  avgOrderValue: number;
}

interface CustomerData {
  name: string;
  value: number;
  growth: number;
}

interface ProductData {
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

interface DashboardMetrics {
  totalSales: number;
  averageOrderValue: number;
  totalCustomers: number;
  topProducts: ProductData[];
  salesGrowth: number;
  customerGrowth: number;
  revenueGrowth: number;
}

// تعريف أنماط الألوان
const colorSchemes = {
  default: {
    primary: 'hsl(var(--primary))',
    secondary: '#82ca9d',
    accent: '#ffc658',
    background: 'hsl(var(--background))'
  },
  warm: {
    primary: '#ff7300',
    secondary: '#ff9800',
    accent: '#ffc107',
    background: '#fff5e6'
  },
  cool: {
    primary: '#00bcd4',
    secondary: '#03a9f4',
    accent: '#2196f3',
    background: '#e1f5fe'
  }
} as const;

type ColorScheme = keyof typeof colorSchemes;

export const AnalyticsDashboard = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

  // استعلامات البيانات مع تحديثات في الوقت الفعلي
  const { data: salesData = [], isLoading: isSalesLoading } = useQuery<SalesData[]>({
    queryKey: ['/api/analytics/sales'],
    refetchInterval: refreshInterval,
  });

  const { data: customerData = [], isLoading: isCustomerLoading } = useQuery<CustomerData[]>({
    queryKey: ['/api/analytics/customers'],
    refetchInterval: refreshInterval,
  });

  const { data: productData = [], isLoading: isProductLoading } = useQuery<ProductData[]>({
    queryKey: ['/api/analytics/products'],
    refetchInterval: refreshInterval,
  });

  // حساب المؤشرات
  const metrics: DashboardMetrics = useMemo(() => {
    const currentSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
    const previousSales = currentSales * 0.8; // مثال - يجب استبداله ببيانات فعلية
    const salesGrowth = ((currentSales - previousSales) / previousSales) * 100;

    return {
      totalSales: currentSales,
      averageOrderValue: salesData.length ? currentSales / salesData.length : 0,
      totalCustomers: customerData.length,
      topProducts: productData.slice(0, 5),
      salesGrowth,
      customerGrowth: 15.2, // مثال - يجب استبداله ببيانات فعلية
      revenueGrowth: 22.5 // مثال - يجب استبداله ببيانات فعلية
    };
  }, [salesData, customerData, productData]);

  const colors = colorSchemes[colorScheme];

  const renderMetricCard = (title: string, value: string | number, growth: number, icon: React.ReactNode) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString('ar-IQ') : value}</div>
        <div className="flex items-center space-x-2 text-xs">
          {growth >= 0 ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={cn(
            "font-medium",
            growth >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {Math.abs(growth).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">من الشهر الماضي</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderChart = () => {
    const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;
    const DataComponent = chartType === 'bar' ? Bar : chartType === 'area' ? Area : Line;

    return (
      <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey="amount"
            name="المبيعات"
            stroke={colors.primary}
            fill={colors.primary}
            fillOpacity={chartType === 'area' ? 0.3 : 1}
          />
          <DataComponent
            type="monotone"
            dataKey="orders"
            name="الطلبات"
            stroke={colors.secondary}
            fill={colors.secondary}
            fillOpacity={chartType === 'area' ? 0.3 : 1}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-8">
      {/* التحكم في التحديث والمظهر */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Select
            value={colorScheme}
            onValueChange={(value: ColorScheme) => setColorScheme(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="نمط الألوان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">الافتراضي</SelectItem>
              <SelectItem value="warm">دافئ</SelectItem>
              <SelectItem value="cool">بارد</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={refreshInterval.toString()}
            onValueChange={(value) => setRefreshInterval(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="فترة التحديث" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5000">كل 5 ثواني</SelectItem>
              <SelectItem value="30000">كل 30 ثانية</SelectItem>
              <SelectItem value="60000">كل دقيقة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" />
          تحديث البيانات
        </Button>
      </div>

      {/* بطاقات المؤشرات */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
          "إجمالي المبيعات",
          `${metrics.totalSales.toLocaleString('ar-IQ')} د.ع`,
          metrics.salesGrowth,
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        )}
        {renderMetricCard(
          "متوسط قيمة الطلب",
          `${metrics.averageOrderValue.toLocaleString('ar-IQ')} د.ع`,
          15.2,
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        )}
        {renderMetricCard(
          "عدد العملاء",
          metrics.totalCustomers,
          metrics.customerGrowth,
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        )}
        {renderMetricCard(
          "نمو الإيرادات",
          `${metrics.revenueGrowth}%`,
          metrics.revenueGrowth,
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* الرسوم البيانية */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>تحليل المبيعات</CardTitle>
              <CardDescription>مقارنة المبيعات والطلبات عبر الزمن</CardDescription>
            </div>
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as typeof chartType)}>
              <TabsList>
                <TabsTrigger value="area">مساحي</TabsTrigger>
                <TabsTrigger value="line">خطي</TabsTrigger>
                <TabsTrigger value="bar">أعمدة</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* المنتجات الأكثر مبيعاً */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
            <CardDescription>أفضل 5 منتجات من حيث المبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.sales} مبيعات
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="font-medium">
                        {product.revenue.toLocaleString('ar-IQ')} د.ع
                      </div>
                      <div className={cn(
                        "text-sm",
                        product.growth >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {product.growth >= 0 ? "+" : "-"}{Math.abs(product.growth)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع العملاء</CardTitle>
            <CardDescription>تحليل قاعدة العملاء</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {customerData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={[colors.primary, colors.secondary, colors.accent][index % 3]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;