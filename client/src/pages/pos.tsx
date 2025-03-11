
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/sidebar";

export default function PosPage() {
  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">نقطة البيع</h1>
          <Card>
            <CardHeader>
              <CardTitle>نظام نقطة البيع</CardTitle>
              <CardDescription>
                يمكنك من هنا إدارة المبيعات وإصدار الفواتير بطريقة سهلة وسريعة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                سيتم تطوير واجهة نقطة البيع هنا قريباً.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
