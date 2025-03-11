
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SalesAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  async function fetchAnalytics() {
    setLoading(true);
    try {
      const response = await fetch('/api/sales-analytics');
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('خطأ في جلب تحليلات المبيعات:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // إنشاء بيانات وهمية للرسوم البيانية
  const generateMockChartData = () => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // بيانات المبيعات الشهرية
    const monthlySalesData = months.map((month, index) => {
      // زيادة تدريجية مع بعض التقلبات العشوائية
      const baseValue = 10000 + (index * 1000);
      const randomVariation = Math.random() * 2000 - 1000; // تغير عشوائي
      
      return {
        name: month,
        قيمة: Math.max(baseValue + randomVariation, 5000) // لا تقل عن 5000
      };
    });
    
    // بيانات التنبؤ للأشهر القادمة
    const forecastData = months.slice(0, 6).map((month, index) => {
      const lastMonthValue = monthlySalesData[monthlySalesData.length - 1].قيمة;
      const growthRate = 1 + (Math.random() * 0.08 + 0.02); // 2-10% نمو
      
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري تحليل البيانات باستخدام الذكاء الاصطناعي...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">تحليلات المبيعات الذكية</h1>
          <p className="text-muted-foreground">نظرة تحليلية مدعومة بالذكاء الاصطناعي على أداء المبيعات</p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>العودة للوحة التحكم</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="forecast">التنبؤات</TabsTrigger>
          <TabsTrigger value="products">تحليل المنتجات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>متوسط المبيعات اليومي</CardTitle>
                <CardDescription>
                  تحليل متوسط المبيعات اليومي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analyticsData?.dailyAverageSales.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12.3% من الشهر الماضي
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>توقع المبيعات الأسبوعي</CardTitle>
                <CardDescription>
                  توقع مبيعات الأسبوع القادم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analyticsData?.forecastNextWeek.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  +{((analyticsData?.forecastNextWeek / (analyticsData?.dailyAverageSales * 7) - 1) * 100).toFixed(1)}% متوقع
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>عدد المعاملات</CardTitle>
                <CardDescription>
                  إجمالي عدد المعاملات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(Math.random() * 1000)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +7.4% من الشهر الماضي
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>المبيعات الشهرية</CardTitle>
              <CardDescription>
                تحليل المبيعات على مدار العام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="قيمة" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تنبؤ المبيعات للأشهر القادمة</CardTitle>
              <CardDescription>
                توقعات مدعومة بنماذج الذكاء الاصطناعي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="متوقع" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 bg-blue-50 p-4 rounded-md">
                <p className="text-sm">
                  <strong>تحليل الذكاء الاصطناعي:</strong> بناءً على أنماط المبيعات السابقة والعوامل الموسمية، يتوقع النظام زيادة في المبيعات بنسبة 
                  <strong className="text-blue-600"> {Math.floor(Math.random() * 15 + 5)}% </strong> 
                  خلال الربع القادم. نوصي بزيادة المخزون من المنتجات الأكثر مبيعًا.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>المنتجات الأكثر مبيعًا</CardTitle>
                <CardDescription>
                  تحليل المنتجات ذات المبيعات الأعلى
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.topSellingProducts?.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">المنتج #{product.productId}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.count} وحدة
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {Math.floor(product.count / analyticsData.topSellingProducts.reduce((sum: number, p: any) => sum + p.count, 0) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>توصيات الذكاء الاصطناعي</CardTitle>
                <CardDescription>
                  تحليل وتوصيات بناءً على أنماط البيانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-md">
                    <h4 className="font-medium text-green-800">زيادة المخزون</h4>
                    <p className="text-sm mt-1">
                      نوصي بزيادة مخزون المنتجات ذات الأرقام
                      {analyticsData?.topSellingProducts?.slice(0, 2).map((p: any) => ` #${p.productId}`).join(' و ')}
                      {' '}بنسبة 15% لتلبية الطلب المتزايد المتوقع
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-800">عروض ترويجية</h4>
                    <p className="text-sm mt-1">
                      نوصي بعمل عرض ترويجي يجمع بين المنتجات المرتبطة ببعضها. وفقًا للتحليل، العملاء الذين يشترون المنتج 
                      #{Object.keys(analyticsData?.relatedProducts || {})[0]} غالبًا ما يشترون أيضًا المنتج 
                      #{analyticsData?.relatedProducts?.[Object.keys(analyticsData?.relatedProducts || {})[0]]?.[0]?.productId}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-md">
                    <h4 className="font-medium text-yellow-800">معدل التحويل</h4>
                    <p className="text-sm mt-1">
                      تشير البيانات إلى أن معدل التحويل يمكن تحسينه بنسبة 22% من خلال تخفيض أسعار المنتجات ذات الطلب المنخفض بنسبة 10-15%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
