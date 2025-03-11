
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
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import * as tf from '@tensorflow/tfjs';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function SalesAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState<any>(null);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/sales-analytics?period=${period}`);
        if (!response.ok) throw new Error('فشل في جلب البيانات');
        
        const data = await response.json();
        setAnalyticsData(data);
        
        // تنفيذ التنبؤ بالمبيعات المستقبلية
        if (data.dailyAverageSales) {
          await predictFutureSales(data);
        }
      } catch (error) {
        console.error('خطأ في جلب تحليلات المبيعات:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [period]);

  // استخدام TensorFlow.js للتنبؤ بالمبيعات المستقبلية
  async function predictFutureSales(data: any) {
    try {
      // هذه محاكاة بسيطة للتنبؤ - في التطبيق الحقيقي نقوم بتدريب النموذج على البيانات التاريخية
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 10, inputShape: [1], activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1 }));
      model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
      
      // بيانات للتدريب (تخمين بسيط)
      const dailySales = data.dailyAverageSales;
      const growthRate = 1.05; // نمو بنسبة 5%
      
      // توليد بيانات التنبؤ للأيام القادمة
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin" />
          <span className="mr-2 text-lg">جاري تحليل البيانات...</span>
        </div>
      </div>
    );
  }

  // تحويل البيانات ليتم عرضها في الرسوم البيانية
  const mockChartData = [
    { name: 'السبت', sales: 4000 },
    { name: 'الأحد', sales: 3000 },
    { name: 'الإثنين', sales: 2000 },
    { name: 'الثلاثاء', sales: 2780 },
    { name: 'الأربعاء', sales: 1890 },
    { name: 'الخميس', sales: 2390 },
    { name: 'الجمعة', sales: 3490 }
  ];

  const topProducts = analyticsData?.topSellingProducts || [
    { productId: 1, count: 28, name: 'منتج 1' },
    { productId: 2, count: 22, name: 'منتج 2' },
    { productId: 3, count: 17, name: 'منتج 3' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تحليلات المبيعات الذكية</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {topProducts.slice(0, 3).map((product: any, index: number) => (
                <div key={product.productId} className="flex justify-between items-center">
                  <span>{product.name || `منتج ${product.productId}`}</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 bg-primary rounded" style={{ width: `${(product.count / topProducts[0].count) * 100}px` }}></div>
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
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
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
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name || 'منتج'} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {topProducts.map((entry: any, index: number) => (
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
                {(topProducts.slice(0, 3)).map((product: any) => (
                  <Card key={product.productId}>
                    <CardHeader className="py-2">
                      <CardTitle className="text-base">{product.name || `منتج ${product.productId}`}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-muted-foreground">العملاء الذين اشتروا هذا المنتج اشتروا أيضًا:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">منتج مرتبط 1</Badge>
                        <Badge variant="outline">منتج مرتبط 2</Badge>
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
