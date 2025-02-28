import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ComposedChart,
  Scatter
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import type { Sale, Product, Customer } from "@shared/schema";
import { cn } from "@/lib/utils";

const colorSchemes = {
  default: {
    primary: 'hsl(var(--primary))',
    secondary: '#82ca9d',
    tertiary: '#ffc658',
    background: 'hsl(var(--background))'
  },
  warm: {
    primary: '#ff7300',
    secondary: '#ff9800',
    tertiary: '#ffc107',
    background: '#fff5e6'
  },
  cool: {
    primary: '#00bcd4',
    secondary: '#03a9f4',
    tertiary: '#2196f3',
    background: '#e1f5fe'
  }
} as const;

type ColorScheme = keyof typeof colorSchemes;

export function SalesTrendsChart() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [updateInterval, setUpdateInterval] = useState(30000);
  const [chartType, setChartType] = useState<'area' | 'line' | 'composed'>('area');

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    refetchInterval: updateInterval,
  });

  // تجميع المبيعات حسب اليوم مع تنبؤات مستقبلية
  const chartData = useMemo(() => {
    const dailySales = sales.reduce((acc: any[], sale) => {
      const date = new Date(sale.date).toLocaleDateString('ar-IQ');
      const existingDay = acc.find(d => d.date === date);

      if (existingDay) {
        existingDay.amount += Number(sale.priceIqd) * sale.quantity;
        existingDay.count += 1;
        existingDay.avgOrder = existingDay.amount / existingDay.count;
      } else {
        acc.push({
          date,
          amount: Number(sale.priceIqd) * sale.quantity,
          count: 1,
          avgOrder: Number(sale.priceIqd) * sale.quantity
        });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // إضافة تنبؤات بسيطة للأيام القادمة
    const lastAmount = dailySales[dailySales.length - 1]?.amount || 0;
    const growth = 0.05; // معدل نمو افتراضي 5%

    for (let i = 1; i <= 7; i++) {
      const lastDate = new Date(dailySales[dailySales.length - 1]?.date);
      lastDate.setDate(lastDate.getDate() + 1);

      dailySales.push({
        date: lastDate.toLocaleDateString('ar-IQ'),
        predictedAmount: lastAmount * (1 + growth * i),
        isPrediction: true
      });
    }

    return dailySales;
  }, [sales]);

  const colors = colorSchemes[colorScheme];

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} د.ع`}
              labelFormatter={(label) => `التاريخ: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              name="المبيعات"
              stroke={colors.primary}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="predictedAmount"
              name="التنبؤات"
              stroke={colors.tertiary}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
            />
            <Brush dataKey="date" height={30} stroke={colors.primary} />
          </LineChart>
        );

      case 'composed':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} د.ع`}
              labelFormatter={(label) => `التاريخ: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="amount"
              name="المبيعات"
              fill={colors.primary}
              fillOpacity={0.3}
              stroke={colors.primary}
            />
            <Bar
              dataKey="count"
              name="عدد الطلبات"
              fill={colors.secondary}
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="avgOrder"
              name="متوسط الطلب"
              stroke={colors.tertiary}
              strokeWidth={2}
            />
            <Scatter
              dataKey="predictedAmount"
              name="التنبؤات"
              fill={colors.tertiary}
            />
          </ComposedChart>
        );

      default:
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} د.ع`}
              labelFormatter={(label) => `التاريخ: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="amount"
              name="المبيعات"
              stroke={colors.primary}
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
            <Area
              type="monotone"
              dataKey="predictedAmount"
              name="التنبؤات"
              stroke={colors.tertiary}
              strokeDasharray="5 5"
              fill={colors.tertiary}
              fillOpacity={0.1}
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>اتجاهات المبيعات</CardTitle>
            <CardDescription>
              تحليل المبيعات اليومية والتنبؤات المستقبلية
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={colorScheme}
              onValueChange={(value: ColorScheme) => setColorScheme(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="نمط الألوان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">الافتراضي</SelectItem>
                <SelectItem value="warm">دافئ</SelectItem>
                <SelectItem value="cool">بارد</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={updateInterval.toString()}
              onValueChange={(value) => setUpdateInterval(Number(value))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="فترة التحديث" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5000">كل 5 ثواني</SelectItem>
                <SelectItem value="30000">كل 30 ثانية</SelectItem>
                <SelectItem value="60000">كل دقيقة</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={chartType} onValueChange={(value: typeof chartType) => setChartType(value)}>
              <TabsList>
                <TabsTrigger value="area">مساحي</TabsTrigger>
                <TabsTrigger value="line">خطي</TabsTrigger>
                <TabsTrigger value="composed">مركب</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductPerformanceChart() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [updateInterval, setUpdateInterval] = useState(30000);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    refetchInterval: updateInterval,
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  // تحليل أداء المنتجات
  const productPerformance = useMemo(() => {
    return products.map(product => {
      const productSales = sales.filter(sale => sale.productId === product.id);
      const totalQuantity = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
      const totalRevenue = productSales.reduce((sum, sale) => 
        sum + (Number(sale.priceIqd) * sale.quantity), 0
      );

      return {
        name: product.name,
        quantity: totalQuantity,
        revenue: totalRevenue,
        stock: product.stock
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [products, sales]);

  const colors = colorSchemes[colorScheme];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>أداء المنتجات</CardTitle>
          <CardDescription>
            أفضل 5 منتجات من حيث المبيعات
          </CardDescription>
          <Select
            value={colorScheme}
            onValueChange={(value: ColorScheme) => setColorScheme(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="نمط الألوان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">الافتراضي</SelectItem>
              <SelectItem value="warm">دافئ</SelectItem>
              <SelectItem value="cool">بارد</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={updateInterval.toString()}
            onValueChange={(value) => setUpdateInterval(Number(value))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="فترة التحديث" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5000">كل 5 ثواني</SelectItem>
              <SelectItem value="30000">كل 30 ثانية</SelectItem>
              <SelectItem value="60000">كل دقيقة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke={colors.primary} />
              <YAxis yAxisId="right" orientation="right" stroke={colors.secondary} />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="الإيرادات"
                fill={colors.primary}
              />
              <Bar
                yAxisId="right"
                dataKey="quantity"
                name="الكمية المباعة"
                fill={colors.secondary}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomerGrowthChart() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [updateInterval, setUpdateInterval] = useState(30000);

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    refetchInterval: updateInterval,
  });

  // تحليل نمو العملاء عبر الزمن
  const customerGrowth = useMemo(() => {
    return customers.reduce((acc: any[], customer) => {
      const date = new Date(customer.createdAt).toLocaleDateString('ar-IQ');
      const existingDay = acc.find(d => d.date === date);

      if (existingDay) {
        existingDay.total += 1;
      } else {
        acc.push({
          date,
          total: acc.length > 0 ? acc[acc.length - 1].total + 1 : 1
        });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [customers]);

  const colors = colorSchemes[colorScheme];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>نمو العملاء</CardTitle>
          <CardDescription>
            تطور عدد العملاء عبر الزمن
          </CardDescription>
          <Select
            value={colorScheme}
            onValueChange={(value: ColorScheme) => setColorScheme(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="نمط الألوان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">الافتراضي</SelectItem>
              <SelectItem value="warm">دافئ</SelectItem>
              <SelectItem value="cool">بارد</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={updateInterval.toString()}
            onValueChange={(value) => setUpdateInterval(Number(value))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="فترة التحديث" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5000">كل 5 ثواني</SelectItem>
              <SelectItem value="30000">كل 30 ثانية</SelectItem>
              <SelectItem value="60000">كل دقيقة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="إجمالي العملاء"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}