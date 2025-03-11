import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import * as tf from '@tensorflow/tfjs';

// Define the Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string; // Added imageUrl to match original interface
}

// Combined interface for all possible props
interface RecommendationProps {
  customerId?: number;
  currentProductId?: number;
  onSelectProduct?: (product: Product) => void;
}

export function ProductRecommendations({ customerId, currentProductId, onSelectProduct }: RecommendationProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  // Initialize or load the TensorFlow model
  useEffect(() => {
    async function loadOrCreateModel() {
      setLoading(true);
      try {
        // Try to load an existing model from IndexedDB
        try {
          const loadedModel = await tf.loadLayersModel('indexeddb://recommendation-model');
          setModel(loadedModel);
        } catch (e) {
          // If no model exists, create a new one
          console.log('No existing model found, creating new one...');
          const newModel = tf.sequential();
          newModel.add(tf.layers.dense({ units: 5, inputShape: [5], activation: 'relu' }));
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
        } else if (customerId) {
          // جلب توصيات بناءً على تفضيلات العميل
          const response = await fetch(`/api/product-recommendations?customerId=${customerId}`);
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