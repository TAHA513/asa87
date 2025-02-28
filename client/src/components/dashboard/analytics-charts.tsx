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
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Sale, Product, Customer } from "@shared/schema";

export function SalesTrendsChart() {
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  // تجميع المبيعات حسب اليوم
  const dailySales = sales.reduce((acc: any[], sale) => {
    const date = new Date(sale.date).toLocaleDateString('ar-IQ');
    const existingDay = acc.find(d => d.date === date);
    
    if (existingDay) {
      existingDay.amount += Number(sale.priceIqd) * sale.quantity;
      existingDay.count += 1;
    } else {
      acc.push({
        date,
        amount: Number(sale.priceIqd) * sale.quantity,
        count: 1
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>اتجاهات المبيعات</CardTitle>
        <CardDescription>
          تحليل المبيعات اليومية والإيرادات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySales}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `${value.toLocaleString()} د.ع`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="amount"
                name="المبيعات"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductPerformanceChart() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  // تحليل أداء المنتجات
  const productPerformance = products.map(product => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>أداء المنتجات</CardTitle>
        <CardDescription>
          أفضل 5 منتجات من حيث المبيعات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="الإيرادات"
                fill="#8884d8"
              />
              <Bar
                yAxisId="right"
                dataKey="quantity"
                name="الكمية المباعة"
                fill="#82ca9d"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomerGrowthChart() {
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // تحليل نمو العملاء عبر الزمن
  const customerGrowth = customers.reduce((acc: any[], customer) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>نمو العملاء</CardTitle>
        <CardDescription>
          تطور عدد العملاء عبر الزمن
        </CardDescription>
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
                stroke="#82ca9d"
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
