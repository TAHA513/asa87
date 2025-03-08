import { useState, useRef } from "react";
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
import { useReactToPrint } from "react-to-print";

const InvoicePrintTemplate = ({ sale, product }) => (
  <div className="p-8" dir="rtl">
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold">فاتورة مبيعات</h1>
      <p className="text-muted-foreground">رقم الفاتورة: INV-{sale.id.toString().padStart(4, '0')}</p>
      <p className="text-muted-foreground">{new Date(sale.date).toLocaleDateString("ar-IQ")}</p>
    </div>

    <div className="border-t border-b py-4 my-4">
      <h2 className="font-semibold mb-2">تفاصيل المنتج:</h2>
      <p>اسم المنتج: {product?.name}</p>
      <p>الكمية: {sale.quantity}</p>
      <p>السعر: {sale.currency === "USD"
        ? `$${Number(sale.priceUsd).toFixed(2)}`
        : `${Number(sale.priceIqd).toFixed(2)} د.ع`}
      </p>
    </div>

    <div className="mt-6">
      <p className="font-semibold">المجموع الكلي: {sale.currency === "USD"
        ? `$${(Number(sale.priceUsd) * sale.quantity).toFixed(2)}`
        : `${(Number(sale.priceIqd) * sale.quantity).toFixed(2)} د.ع`}
      </p>
    </div>
  </div>
);

export default function Invoices() {
  const [search, setSearch] = useState("");
  const printTemplateRef = useRef();
  const [selectedSale, setSelectedSale] = useState(null);

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handlePrint = useReactToPrint({
    content: () => printTemplateRef.current,
  });

  const filteredSales = sales.filter((sale) => {
    const product = products.find(p => p.id === sale.productId);
    return product?.name.toLowerCase().includes(search.toLowerCase());
  });

  const groupedSales = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date).toLocaleDateString();
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
                  placeholder="بحث في الفواتير..."
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
                  {sales.length} فاتورة
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
                            {sale.currency === "USD"
                              ? `$${Number(sale.priceUsd).toFixed(2)}`
                              : `${Number(sale.priceIqd).toFixed(2)} د.ع`}
                          </TableCell>
                          <TableCell>
                            {new Date(sale.date).toLocaleTimeString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSale(sale);
                                handlePrint();
                              }}
                            >
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

      {/* Print Template (hidden) */}
      <div style={{ display: "none" }}>
        <div ref={printTemplateRef}>
          {selectedSale && (
            <InvoicePrintTemplate
              sale={selectedSale}
              product={products.find(p => p.id === selectedSale.productId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}