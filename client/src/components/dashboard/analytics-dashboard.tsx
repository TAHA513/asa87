import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useMemo } from "react";

// Define types for our analytics data
interface SalesData {
  date: string;
  amount: number;
}

interface CustomerData {
  name: string;
  value: number;
}

interface ProductData {
  name: string;
  sales: number;
}

interface DashboardMetrics {
  totalSales: number;
  averageOrderValue: number;
  totalCustomers: number;
  topProducts: ProductData[];
}

const colors = {
  sales: '#10B981',
  revenue: '#3B82F6',
  customers: '#6366F1',
  products: '#8B5CF6'
};

export const AnalyticsDashboard = () => {
  // Fetch analytics data with proper typing
  const { data: salesData = [] } = useQuery<SalesData[]>({
    queryKey: ['/api/analytics/sales'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: customerData = [] } = useQuery<CustomerData[]>({
    queryKey: ['/api/analytics/customers'],
    refetchInterval: 30000,
  });

  const { data: productData = [] } = useQuery<ProductData[]>({
    queryKey: ['/api/analytics/products'],
    refetchInterval: 30000,
  });

  // Calculate summary metrics
  const metrics: DashboardMetrics = useMemo(() => {
    return {
      totalSales: salesData.reduce((sum, sale) => sum + sale.amount, 0),
      averageOrderValue: salesData.length ? 
        salesData.reduce((sum, sale) => sum + sale.amount, 0) / salesData.length : 0,
      totalCustomers: customerData.length,
      topProducts: productData.slice(0, 5)
    };
  }, [salesData, customerData, productData]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم التحليلية</h1>
        <p className="text-muted-foreground">تحليلات متقدمة لأداء المبيعات والعملاء والمنتجات</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي المبيعات</CardTitle>
            <CardDescription>القيمة الإجمالية للمبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalSales.toLocaleString('ar-IQ')} د.ع
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>متوسط قيمة الطلب</CardTitle>
            <CardDescription>متوسط قيمة الطلب الواحد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageOrderValue.toLocaleString('ar-IQ')} د.ع
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>عدد العملاء</CardTitle>
            <CardDescription>إجمالي عدد العملاء</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalCustomers.toLocaleString('ar-IQ')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
            <CardDescription>أفضل 5 منتجات مبيعاً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topProducts.map((product) => (
                <div key={product.name} className="flex justify-between">
                  <span>{product.name}</span>
                  <span>{product.sales}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاه المبيعات</CardTitle>
          <CardDescription>تحليل المبيعات على مدار الوقت</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={colors.sales} 
                  name="المبيعات"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Customer Distribution and Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>أداء المنتجات</CardTitle>
            <CardDescription>تحليل مبيعات المنتجات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill={colors.products} name="المبيعات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;