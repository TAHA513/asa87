import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product, Sale, Customer } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function StatsCards() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // حساب إجمالي المبيعات بالدينار العراقي
  const totalSales = sales.reduce((sum, sale) => {
    return sum + Number(sale.priceIqd) * sale.quantity;
  }, 0);

  // حساب النمو في المبيعات مقارنة بالشهر الماضي
  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && 
           saleDate.getFullYear() === now.getFullYear();
  }).reduce((sum, sale) => sum + Number(sale.priceIqd) * sale.quantity, 0);

  const lastMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return saleDate.getMonth() === lastMonth && 
           saleDate.getFullYear() === lastMonthYear;
  }).reduce((sum, sale) => sum + Number(sale.priceIqd) * sale.quantity, 0);

  const salesGrowth = lastMonthSales === 0 ? 100 : 
    ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100;

  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock < 10).length;
  const totalTransactions = sales.length;

  // حساب نمو المعاملات مقارنة بالساعة الماضية
  const currentHourTransactions = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const now = new Date();
    return saleDate.getHours() === now.getHours() &&
           saleDate.getDate() === now.getDate() &&
           saleDate.getMonth() === now.getMonth() &&
           saleDate.getFullYear() === now.getFullYear();
  }).length;

  const lastHourTransactions = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const now = new Date();
    const lastHour = now.getHours() === 0 ? 23 : now.getHours() - 1;
    return saleDate.getHours() === lastHour &&
           saleDate.getDate() === now.getDate() &&
           saleDate.getMonth() === now.getMonth() &&
           saleDate.getFullYear() === now.getFullYear();
  }).length;

  const transactionGrowth = currentHourTransactions - lastHourTransactions;

  // حساب العملاء النشطين (الذين لديهم مشتريات هذا الشهر)
  const activeCustomers = new Set(
    sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        const now = new Date();
        return saleDate.getMonth() === now.getMonth() && 
               saleDate.getFullYear() === now.getFullYear();
      })
      .map(sale => sale.customerId)
  ).size;

  // دالة لتحديد لون المؤشر بناءً على النسبة
  const getIndicatorColor = (value: number, thresholds: { low: number; medium: number }) => {
    if (value >= thresholds.medium) return "text-green-500";
    if (value >= thresholds.low) return "text-amber-500";
    return "text-red-500";
  };

  // دالة لتحديد لون خلفية البطاقة
  const getCardGradient = (value: number, thresholds: { low: number; medium: number }) => {
    if (value >= thresholds.medium) return "bg-gradient-to-br from-green-50 to-white dark:from-green-950/20";
    if (value >= thresholds.low) return "bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20";
    return "bg-gradient-to-br from-red-50 to-white dark:from-red-950/20";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className={cn(
        "transition-all duration-500",
        getCardGradient(salesGrowth, { low: 0, medium: 10 })
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <DollarSign className={cn(
            "h-4 w-4 transition-colors duration-500",
            getIndicatorColor(salesGrowth, { low: 0, medium: 10 })
          )} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales.toLocaleString()} د.ع</div>
          <div className="space-y-2">
            <p className={cn(
              "text-xs",
              getIndicatorColor(salesGrowth, { low: 0, medium: 10 })
            )}>
              {salesGrowth >= 0 ? "+" : ""}{salesGrowth.toFixed(1)}% عن الشهر الماضي
            </p>
            <Progress 
              value={Math.min(Math.max(salesGrowth, 0), 100)} 
              className="h-1" 
              indicatorClassName={cn(
                getIndicatorColor(salesGrowth, { low: 0, medium: 10 }).replace("text-", "bg-")
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className={cn(
        "transition-all duration-500",
        getCardGradient(100 - (lowStock / totalProducts * 100), { low: 60, medium: 80 })
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
          <Package className={cn(
            "h-4 w-4 transition-colors duration-500",
            getIndicatorColor(100 - (lowStock / totalProducts * 100), { low: 60, medium: 80 })
          )} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <div className="space-y-2">
            <p className={cn(
              "text-xs",
              getIndicatorColor(100 - (lowStock / totalProducts * 100), { low: 60, medium: 80 })
            )}>
              {lowStock} منتجات منخفضة المخزون
            </p>
            <Progress 
              value={100 - (lowStock / totalProducts * 100)} 
              className="h-1"
              indicatorClassName={cn(
                getIndicatorColor(100 - (lowStock / totalProducts * 100), { low: 60, medium: 80 }).replace("text-", "bg-")
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className={cn(
        "transition-all duration-500",
        getCardGradient(transactionGrowth, { low: 0, medium: 5 })
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المبيعات</CardTitle>
          <ShoppingCart className={cn(
            "h-4 w-4 transition-colors duration-500",
            getIndicatorColor(transactionGrowth, { low: 0, medium: 5 })
          )} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTransactions}</div>
          <div className="space-y-2">
            <p className={cn(
              "text-xs",
              getIndicatorColor(transactionGrowth, { low: 0, medium: 5 })
            )}>
              {transactionGrowth >= 0 ? "+" : ""}{transactionGrowth} منذ الساعة الماضية
            </p>
            <Progress 
              value={Math.min(Math.max(transactionGrowth * 10, 0), 100)} 
              className="h-1"
              indicatorClassName={cn(
                getIndicatorColor(transactionGrowth, { low: 0, medium: 5 }).replace("text-", "bg-")
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className={cn(
        "transition-all duration-500",
        getCardGradient(activeCustomers, { low: 10, medium: 30 })
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
          <Users className={cn(
            "h-4 w-4 transition-colors duration-500",
            getIndicatorColor(activeCustomers, { low: 10, medium: 30 })
          )} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCustomers}</div>
          <div className="space-y-2">
            <p className={cn(
              "text-xs",
              getIndicatorColor(activeCustomers, { low: 10, medium: 30 })
            )}>
              عملاء نشطون هذا الشهر
            </p>
            <Progress 
              value={Math.min(activeCustomers * 2, 100)} 
              className="h-1"
              indicatorClassName={cn(
                getIndicatorColor(activeCustomers, { low: 10, medium: 30 }).replace("text-", "bg-")
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}