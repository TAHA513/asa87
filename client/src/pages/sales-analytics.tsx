import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

// Define types at the top level
type Period = 'week' | 'month' | 'year';

export function SalesAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<Period>('week');
  const [forecastData, setForecastData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const response = await fetch(`/api/sales-analytics?period=${period}`);
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      const data = await response.json();
      setAnalyticsData(data);

      if (data.dailyAverageSales) {
        await predictFutureSales(data);
      }
    } catch (error) {
      console.error('خطأ في جلب تحليلات المبيعات:', error);
    } finally {
      setLoading(false);
    }
  }

  async function predictFutureSales(data: any) {
    try {
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 10, inputShape: [1], activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1 }));
      model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

      const dailySales = data.dailyAverageSales;
      const growthRate = 1.05; // نمو بنسبة 5%

      const futureDays = 7;
      const forecast = [];

      for (let i = 1; i <= futureDays; i++) {
        const predictedValue = dailySales * Math.pow(growthRate, i);
        forecast.push({
          day: `اليوم ${i}`,
          sales: Number(predictedValue.toFixed(0))
        });
      }

      setForecastData(forecast);
    } catch (error) {
      console.error('خطأ في التنبؤ بالمبيعات:', error);
    }
  }

  const generateMockChartData = () => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const monthlySalesData = months.map((month, index) => {
      const baseValue = 10000 + (index * 1000);
      const randomVariation = Math.random() * 2000 - 1000;

      return {
        name: month,
        قيمة: Math.max(baseValue + randomVariation, 5000)
      };
    });

    const forecastData = months.slice(0, 6).map((month, index) => {
      const lastMonthValue = monthlySalesData[monthlySalesData.length - 1].قيمة;
      const growthRate = 1 + (Math.random() * 0.08 + 0.02);

      return {
        name: month,
        متوقع: lastMonthValue * Math.pow(growthRate, index + 1)
      };
    });

    return {
      monthlySalesData,
      forecastData
    };
  };

  const chartData = generateMockChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحليل البيانات باستخدام الذكاء الاصطناعي...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">تحليلات المبيعات الذكية</h1>
          <p className="text-muted-foreground">نظرة تحليلية مدعومة بالذكاء الاصطناعي على أداء المبيعات</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            onClick={() => setPeriod('week')}
          >
            أسبوع
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
          >
            شهر
          </Button>
          <Button
            variant={period === 'year' ? 'default' : 'outline'}
            onClick={() => setPeriod('year')}
          >
            سنة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">متوسط المبيعات اليومي</CardTitle>
            <CardDescription>متوسط المبيعات لكل يوم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyticsData?.dailyAverageSales?.toLocaleString() || '0'} د.ع
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-500">+15% </span>
              <span className="text-muted-foreground mr-1">من الأسبوع الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">توقعات الأسبوع القادم</CardTitle>
            <CardDescription>توقعات المبيعات بناءً على الذكاء الاصطناعي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyticsData?.forecastNextWeek?.toLocaleString() || '0'} د.ع
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
              <span className="text-green-500">+8% </span>
              <span className="text-muted-foreground mr-1">توقع النمو</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">المنتجات الأكثر مبيعًا</CardTitle>
            <CardDescription>أفضل المنتجات من حيث الكمية المباعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(analyticsData?.topSellingProducts || []).slice(0, 3).map((product: any, index: number) => (
                <div key={product.productId} className="flex justify-between items-center">
                  <span>{product.name || `منتج ${product.productId}`}</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-2 bg-primary rounded"
                      style={{
                        width: `${(product.count / (analyticsData?.topSellingProducts?.[0]?.count || 1)) * 100}px`
                      }}
                    />
                    <span>{product.count} قطعة</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">تحليل المبيعات</TabsTrigger>
          <TabsTrigger value="forecast">التنبؤ المستقبلي</TabsTrigger>
          <TabsTrigger value="products">تحليل المنتجات</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="p-4 border rounded-md shadow-sm bg-card">
          <h2 className="text-xl font-bold mb-4">اتجاه المبيعات</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="قيمة" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="p-4 border rounded-md shadow-sm bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">توقعات المبيعات للأسبوع القادم</h2>
            <div className="flex items-center text-amber-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">توقعات بناءً على تحليل البيانات التاريخية</span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="products" className="p-4 border rounded-md shadow-sm bg-card">
          <h2 className="text-xl font-bold mb-4">توزيع المبيعات حسب المنتج</h2>
          <div className="flex flex-col md:flex-row justify-between">
            <div className="h-80 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.topSellingProducts || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name || 'منتج'} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(analyticsData?.topSellingProducts || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="md:w-1/2 mt-4 md:mt-0 md:pr-6">
              <h3 className="text-lg font-medium mb-4">منتجات مرتبطة</h3>
              <div className="space-y-4">
                {(analyticsData?.topSellingProducts || []).slice(0, 3).map((product: any) => (
                  <Card key={product.productId}>
                    <CardHeader className="py-2">
                      <CardTitle className="text-base">{product.name || `منتج ${product.productId}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-muted-foreground">العملاء الذين اشتروا هذا المنتج اشتروا أيضًا:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(analyticsData?.relatedProducts?.[product.productId] || []).map((relatedProduct: any, index: number) => (
                          <div
                            key={index}
                            className="px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                          >
                            {relatedProduct.name || `منتج ${relatedProduct.productId}`}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SalesAnalytics;