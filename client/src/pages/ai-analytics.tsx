
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductRecommendation } from "@/components/ai/product-recommendations";
import InventoryForecasting from "@/components/ai/inventory-forecasting";
import Sidebar from "@/components/sidebar";

export default function AIAnalytics() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">تحليلات الذكاء الاصطناعي</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>نظرة عامة</CardTitle>
              <CardDescription>استخدم الذكاء الاصطناعي لتحسين قرارات عملك</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                تستخدم هذه الأدوات خوارزميات الذكاء الاصطناعي لتحليل بيانات عملك وتقديم توصيات ذكية لتحسين المبيعات وإدارة المخزون والإنفاق. التنبؤات تعتمد على أنماط البيانات التاريخية وتتحسن مع مرور الوقت كلما زادت البيانات المتوفرة.
              </p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="inventory">تنبؤات المخزون</TabsTrigger>
              <TabsTrigger value="sales">توصيات المبيعات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory" className="space-y-6">
              <InventoryForecasting />
            </TabsContent>
            
            <TabsContent value="sales" className="space-y-6">
              <SalesRecommendations />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
