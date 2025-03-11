
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ProductRecommendation() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">توصيات المنتجات</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>اختيار المنتج أو العميل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 space-y-2">
                  <label className="text-sm font-medium">اختر منتجًا:</label>
                  <Select
                    value={selectedProductId || ""}
                    onValueChange={(value) => {
                      setSelectedProductId(value);
                      setSelectedCustomerId(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر منتجًا" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">منتج 1</SelectItem>
                      <SelectItem value="2">منتج 2</SelectItem>
                      <SelectItem value="3">منتج 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center md:pt-8">
                  <span className="px-4">أو</span>
                </div>

                <div className="w-full md:w-1/2 space-y-2">
                  <label className="text-sm font-medium">اختر عميلًا:</label>
                  <Select
                    value={selectedCustomerId || ""}
                    onValueChange={(value) => {
                      setSelectedCustomerId(value);
                      setSelectedProductId(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر عميلًا" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">عميل 1</SelectItem>
                      <SelectItem value="2">عميل 2</SelectItem>
                      <SelectItem value="3">عميل 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  variant="default"
                  onClick={() => setLoading(true)}
                  disabled={loading || (!selectedProductId && !selectedCustomerId)}
                >
                  {loading ? "جاري التحليل..." : "تحليل البيانات وعرض التوصيات"}
                </Button>
              </div>
              {loading && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  جاري تحليل البيانات وإنشاء التوصيات المخصصة...
                </div>
              )}
            </CardContent>
          </Card>

          <ProductRecommendations 
            customerId={selectedCustomerId || undefined} 
            currentProductId={selectedProductId || undefined}
          />
        </div>
      </main>
    </div>
  );
}

function ProductRecommendations({
  customerId,
  currentProductId
}: {
  customerId?: string;
  currentProductId?: string;
}) {
  // Here you would fetch recommendations based on customer or product
  // For now we'll just show mock data
  
  if (!customerId && !currentProductId) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">
        {customerId 
          ? "منتجات موصى بها لهذا العميل" 
          : "منتجات مشابهة قد تهمك"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">منتج موصى به #{i+1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground">
                صورة المنتج
              </div>
              <p className="font-medium">اسم المنتج</p>
              <p className="text-sm text-muted-foreground mb-3">وصف قصير للمنتج</p>
              <div className="flex items-center justify-between">
                <span className="font-bold">199 ر.س</span>
                <Button variant="outline" size="sm">إضافة للسلة</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
