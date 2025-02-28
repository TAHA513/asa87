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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Package, Users } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import { useRef } from "react";
import type { Sale, Product, InsertInvoice } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface NewSaleFormData {
  productId: number;
  quantity: number;
  customerName: string;
  date: Date;
  isInstallment: boolean;
  printInvoice: boolean;
}

export default function Sales() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", searchQuery],
    enabled: searchQuery.length > 0,
  });

  const form = useForm<NewSaleFormData>({
    defaultValues: {
      quantity: 1,
      date: new Date(),
      isInstallment: false,
      printInvoice: true,
    },
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const onSubmit = async (data: NewSaleFormData) => {
    try {
      const sale = await apiRequest("POST", "/api/sales", {
        productId: data.productId,
        quantity: data.quantity,
        date: data.date,
        isInstallment: data.isInstallment,
      });

      const saleData = await sale.json();

      const product = products.find(p => p.id === data.productId);
      if (!product) return;

      const invoice: InsertInvoice = {
        saleId: saleData.id,
        customerName: data.customerName,
        totalAmount: Number(product.priceIqd) * data.quantity,
        invoiceNumber: `INV-${Date.now()}`,
      };

      const savedInvoice = await apiRequest("POST", "/api/invoices", invoice);

      if (data.printInvoice) {
        setSelectedSale(saleData);
        setTimeout(handlePrint, 100);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      form.reset();

      toast({
        title: "تم إنشاء البيع بنجاح",
        description: `تم إنشاء بيع جديد برقم ${saleData.id}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في إنشاء البيع",
        description: "حدث خطأ أثناء محاولة إنشاء البيع",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>المبيعات الأخيرة</CardTitle>
                <CardDescription>
                  قائمة بجميع عمليات البيع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => {
                      const product = products.find((p) => p.id === sale.productId);
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>{product?.name}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>
                            {Number(sale.priceIqd).toLocaleString()} د.ع
                          </TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>
                            {new Date(sale.date).toLocaleDateString('ar-IQ')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>بيع جديد</CardTitle>
              <CardDescription>إنشاء عملية بيع جديدة</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التاريخ</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العميل</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-8" placeholder="ادخل اسم العميل" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>بحث عن المنتج</Label>
                    <div className="relative">
                      <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="ابحث بالاسم أو الرمز أو الباركود"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الكمية</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="printInvoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>طباعة الفاتورة</FormLabel>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    إتمام البيع
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Print Area */}
        <div className="hidden">
          <div ref={printRef} className="p-4">
            {selectedSale && (
              <div className="space-y-4">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">فاتورة بيع</h1>
                  <p>رقم الفاتورة: {selectedSale.id}</p>
                  <p>التاريخ: {new Date(selectedSale.date).toLocaleDateString('ar-IQ')}</p>
                </div>
                <div>
                  <p>العميل: {selectedSale.customerName}</p>
                  <p>المبلغ الإجمالي: {Number(selectedSale.priceIqd).toLocaleString()} د.ع</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                      <th>المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{products.find(p => p.id === selectedSale.productId)?.name}</td>
                      <td>{selectedSale.quantity}</td>
                      <td>{Number(selectedSale.priceIqd).toLocaleString()} د.ع</td>
                      <td>{(Number(selectedSale.priceIqd) * selectedSale.quantity).toLocaleString()} د.ع</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}