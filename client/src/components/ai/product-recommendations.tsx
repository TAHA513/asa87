
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
