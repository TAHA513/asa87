
import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function InventoryForecasting() {
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState<tf.Sequential | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // إنشاء وتدريب النموذج
  useEffect(() => {
    async function fetchDataAndTrainModel() {
      try {
        setIsLoading(true);
        
        // جلب بيانات المخزون والمبيعات
        const response = await fetch('/api/inventory/transactions');
        const transactions = await response.json();
        
        if (!transactions || transactions.length === 0) {
          setError("لا توجد بيانات كافية للتنبؤ بالمخزون");
          setIsLoading(false);
          return;
        }
        
        setInventoryData(transactions);
        
        // معالجة البيانات لنموذج التعلم الآلي
        const productsData: Record<number, number[]> = {};
        
        // تجميع بيانات المخزون حسب المنتج والتاريخ
        transactions.forEach((transaction: any) => {
          if (!productsData[transaction.productId]) {
            productsData[transaction.productId] = [];
          }
          
          // إضافة أو طرح الكمية حسب نوع الحركة
          const quantity = transaction.type === 'in' ? transaction.quantity : -transaction.quantity;
          productsData[transaction.productId].push(quantity);
        });
        
        // إنشاء نموذج تنبؤ بسيط لكل منتج
        const allPredictions: any[] = [];
        
        for (const [productId, data] of Object.entries(productsData)) {
          // نحتاج على الأقل إلى 10 نقاط بيانات للتنبؤ
          if (data.length < 10) continue;
          
          // تجهيز البيانات
          const xs = tf.tensor2d(data.slice(0, -5).map((_, i) => [i]));
          const ys = tf.tensor2d(data.slice(0, -5).map(value => [value]));
          
          // إنشاء نموذج LSTM بسيط
          const model = tf.sequential();
          model.add(tf.layers.dense({ units: 10, inputShape: [1], activation: 'relu' }));
          model.add(tf.layers.dense({ units: 1 }));
          
          // تجميع النموذج
          model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
          
          // تدريب النموذج
          await model.fit(xs, ys, { epochs: 100, verbose: 0 });
          
          // التنبؤ للأيام القادمة
          const lastIndex = data.length - 1;
          const futurePredictions = [];
          
          for (let i = 1; i <= 7; i++) {
            const input = tf.tensor2d([[lastIndex + i]]);
            const prediction = model.predict(input) as tf.Tensor;
            const value = await prediction.data();
            futurePredictions.push({
              day: i,
              value: Math.round(value[0]),
              productId: parseInt(productId)
            });
            prediction.dispose();
            input.dispose();
          }
          
          // الحصول على اسم المنتج
          const productResponse = await fetch(`/api/products/${productId}`);
          let productName = `المنتج ${productId}`;
          
          try {
            const product = await productResponse.json();
            if (product && product.name) {
              productName = product.name;
            }
          } catch (e) {
            console.error("تعذر الحصول على معلومات المنتج:", e);
          }
          
          allPredictions.push({
            productId: parseInt(productId),
            productName,
            predictions: futurePredictions,
            averageDemand: Math.round(futurePredictions.reduce((sum, pred) => sum + pred.value, 0) / futurePredictions.length)
          });
          
          // تنظيف موارد TensorFlow
          xs.dispose();
          ys.dispose();
          model.dispose();
        }
        
        setPredictions(allPredictions);
        setIsLoading(false);
      } catch (err) {
        console.error("حدث خطأ أثناء تدريب النموذج:", err);
        setError("تعذر إنشاء التنبؤات. يرجى المحاولة مرة أخرى لاحقًا.");
        setIsLoading(false);
      }
    }
    
    fetchDataAndTrainModel();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحليل بيانات المخزون وإنشاء التنبؤات...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>تعذر إنشاء التنبؤات</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تنبؤات المخزون بالذكاء الاصطناعي</CardTitle>
          <CardDescription>توقعات الطلب للأسبوع القادم مبنية على نمط المبيعات السابقة</CardDescription>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">لا توجد بيانات كافية للتنبؤ</p>
          ) : (
            <div className="space-y-8">
              {predictions.map((product) => (
                <div key={product.productId} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">{product.productName}</h3>
                  <p className="text-muted-foreground mb-4">
                    متوسط الطلب المتوقع: <span className="font-semibold">{product.averageDemand}</span> وحدة يوميًا
                  </p>
                  
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={product.predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" label={{ value: 'الأيام القادمة', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'الطلب المتوقع', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value} وحدة`, 'الطلب المتوقع']} labelFormatter={(day) => `اليوم ${day}`} />
                        <Area type="monotone" dataKey="value" name="الطلب" stroke="#8884d8" fill="#8884d8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>توصية: {product.averageDemand > 10 ? 'ينصح بزيادة المخزون' : 'المخزون الحالي قد يكون كافيًا'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>حركات المخزون الأخيرة</CardTitle>
          <CardDescription>آخر 10 حركات للمخزون</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productId" label={{ value: 'رقم المنتج', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'الكمية', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" name="الكمية" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InventoryForecasting;
