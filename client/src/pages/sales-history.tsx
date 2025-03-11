
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Sale } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function SalesHistory() {
  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 h-full">
          <Sidebar />
        </div>
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin" />
            <span className="mr-2 text-lg">جاري تحميل سجل المبيعات...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">سجل المبيعات</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>تاريخ المبيعات</CardTitle>
              <CardDescription>
                عرض جميع المعاملات السابقة وتفاصيلها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead className="text-left">السعر (د.ع)</TableHead>
                    <TableHead className="text-left">المجموع (د.ع)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        لا توجد بيانات مبيعات حتى الآن
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{new Date(sale.date).toLocaleDateString('ar-IQ')}</TableCell>
                          <TableCell>{sale.productName}</TableCell>
                          <TableCell>{sale.customerName || 'عميل غير مسجل'}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell className="text-left">{Number(sale.priceIqd).toLocaleString('ar-IQ')}</TableCell>
                          <TableCell className="text-left">{(Number(sale.priceIqd) * sale.quantity).toLocaleString('ar-IQ')}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
