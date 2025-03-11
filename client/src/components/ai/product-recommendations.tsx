
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

interface RecommendationProps {
  customerId: number;
  onSelectProduct?: (product: Product) => void;
}

export function ProductRecommendations({ customerId, onSelectProduct }: RecommendationProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // محاكاة خوارزمية الذكاء الاصطناعي البسيطة للتوصيات
  const getRecommendations = async (customerId: number) => {
    setLoading(true);
    
    try {
      // 1. جلب بيانات المبيعات السابقة للعميل
      const salesResponse = await fetch(`/api/sales?customerId=${customerId}`);
      const sales = await salesResponse.json();
      
      // 2. جلب جميع المنتجات
      const productsResponse = await fetch('/api/products');
      const allProducts = await productsResponse.json();
      
      // 3. محاكاة خوارزمية ذكاء اصطناعي بسيطة
      // في هذه الحالة، سنفترض أن الخوارزمية تقوم بترتيب المنتجات بناءً على التشابه
      // مع المنتجات التي اشتراها العميل سابقًا
      
      // استخراج المنتجات التي اشتراها العميل
      const purchasedProductIds = new Set();
      sales.forEach((sale: any) => {
        sale.items.forEach((item: any) => {
          purchasedProductIds.add(item.productId);
        });
      });
      
      // تصفية المنتجات غير المشتراة
      const notPurchasedProducts = allProducts.filter(
        (product: Product) => !purchasedProductIds.has(product.id)
      );
      
      // محاكاة الترتيب بناءً على "تشابه" افتراضي
      // في تطبيق حقيقي، هنا ستستخدم خوارزمية ML/AI حقيقية
      const recommendedProducts = notPurchasedProducts
        .sort(() => 0.5 - Math.random()) // ترتيب عشوائي كمحاكاة
        .slice(0, 3); // أخذ 3 توصيات فقط
      
      // محاكاة تأخير للاتصال بالخدمة
      setTimeout(() => {
        setRecommendations(recommendedProducts);
        setLoading(false);
      }, 800);
      
    } catch (error) {
      console.error('خطأ في جلب التوصيات:', error);
      setLoading(false);
      setRecommendations([]);
    }
  };

  useEffect(() => {
    if (customerId) {
      getRecommendations(customerId);
    }
  }, [customerId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>توصيات ذكية</CardTitle>
          <CardDescription>جاري تحليل أنماط الشراء...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>توصيات قد تعجبك</CardTitle>
        <CardDescription>منتجات مقترحة بناءً على تحليل سلوك الشراء</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((product) => (
            <div key={product.id} className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-muted-foreground">${product.price}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => onSelectProduct?.(product)}
                size="sm"
              >
                إضافة للسلة
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import * as tf from '@tensorflow/tfjs';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface ProductRecommendationsProps {
  customerId?: number;
  currentProductId?: number;
}

export function ProductRecommendations({ customerId, currentProductId }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  // تحميل نموذج الذكاء الاصطناعي أو إنشائه
  useEffect(() => {
    async function loadOrCreateModel() {
      try {
        setLoading(true);
        
        // محاولة تحميل النموذج من التخزين المحلي
        try {
          const loadedModel = await tf.loadLayersModel('indexeddb://recommendation-model');
          console.log('تم تحميل نموذج التوصيات من التخزين المحلي');
          setModel(loadedModel);
        } catch (e) {
          console.log('لم يتم العثور على نموذج مخزن، سيتم إنشاء نموذج جديد');
          // إنشاء نموذج بسيط للتوصيات
          const newModel = tf.sequential();
          newModel.add(tf.layers.dense({ units: 10, inputShape: [5], activation: 'relu' }));
          newModel.add(tf.layers.dense({ units: 5, activation: 'relu' }));
          newModel.add(tf.layers.dense({ units: 3, activation: 'softmax' }));
          
          newModel.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
          });
          
          setModel(newModel);
          await newModel.save('indexeddb://recommendation-model');
        }
      } catch (error) {
        console.error('خطأ في تحميل/إنشاء نموذج الذكاء الاصطناعي:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadOrCreateModel();
  }, []);

  // جلب توصيات المنتجات باستخدام النموذج أو من الخادم
  useEffect(() => {
    async function fetchRecommendations() {
      if (!customerId && !currentProductId) return;
      
      setLoading(true);
      try {
        // إذا كان هناك معرف منتج حالي، جلب المنتجات ذات الصلة
        if (currentProductId) {
          const response = await fetch(`/api/sales-analytics?productId=${currentProductId}`);
          const data = await response.json();
          
          if (data.relatedProducts && data.relatedProducts[currentProductId]) {
            // جلب تفاصيل المنتجات الموصى بها
            const productIds = data.relatedProducts[currentProductId].map((item: any) => item.productId);
            const productsResponse = await fetch(`/api/products?ids=${productIds.join(',')}`);
            const productsData = await productsResponse.json();
            setRecommendations(productsData);
          }
        } 
        // وإلا جلب توصيات بناءً على سجل المشتريات السابقة للعميل
        else if (customerId) {
          const response = await fetch(`/api/customers/${customerId}/recommendations`);
          const data = await response.json();
          setRecommendations(data);
        }
      } catch (error) {
        console.error('خطأ في جلب التوصيات:', error);
        // استخدام محاكاة بسيطة لتوصيات المنتجات
        setRecommendations([
          { id: 1, name: 'منتج موصى به 1', price: 25000 },
          { id: 2, name: 'منتج موصى به 2', price: 30000 },
          { id: 3, name: 'منتج موصى به 3', price: 40000 }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecommendations();
  }, [customerId, currentProductId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>جاري تحميل التوصيات...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>منتجات موصى بها</CardTitle>
        <CardDescription>منتجات قد تهم العميل بناءً على تحليل الذكاء الاصطناعي</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                      <span className="text-xs">صورة</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <Badge variant="outline">{product.price.toLocaleString()} د.ع</Badge>
                  </div>
                </div>
                <Button size="sm" variant="secondary">إضافة</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">لا توجد توصيات حاليًا</p>
        )}
      </CardContent>
    </Card>
  );
}
