import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Search } from "lucide-react";
import type { Sale, Product } from "@shared/schema";

export default function Invoices() {
  const [search, setSearch] = useState("");

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredSales = sales.filter((sale) => {
    const product = products.find(p => p.id === sale.productId);
    return product?.name.toLowerCase().includes(search.toLowerCase());
  });

  const groupedSales = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString('ar-IQ');
    if (!acc[date]) acc[date] = [];
    acc[date].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6" />
              <h1 className="text-3xl font-bold">الفواتير</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الفواتير..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>

          {Object.entries(groupedSales).map(([date, sales]) => (
            <Card key={date} className="mb-6">
              <CardHeader>
                <CardTitle>فواتير {date}</CardTitle>
                <CardDescription>
                  {sales.length} معاملة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الفاتورة</TableHead>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الوقت</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => {
                      const product = products.find(p => p.id === sale.productId);
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>INV-{sale.id.toString().padStart(4, '0')}</TableCell>
                          <TableCell>{product?.name}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>
                            {Number(sale.priceIqd).toLocaleString('ar-IQ')} د.ع
                          </TableCell>
                          <TableCell>
                            {new Date(sale.date).toLocaleTimeString('ar-IQ')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                              <span className="sr-only">طباعة</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}