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
import { Calendar, Package, Users, Clock } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import { useRef } from "react";
import type { Sale, Product, InsertInvoice } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface NewSaleFormData {
  productId: number;
  quantity: number;
  customerName: string;
  date: Date;
  time: string;
  isInstallment: boolean;
  printInvoice: boolean;
}

export default function Sales() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: searchResults = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", searchQuery],
    enabled: searchQuery.length > 0,
  });

  const form = useForm<NewSaleFormData>({
    defaultValues: {
      quantity: 1,
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
      isInstallment: false,
      printInvoice: true,
      customerName: "",
    },
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const onSubmit = async (data: NewSaleFormData) => {
    try {
      if (!selectedProduct) {
        toast({
          title: "خطأ",
          description: "الرجاء اختيار منتج",
          variant: "destructive",
        });
        return;
      }

      if (!user) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        return;
      }

      const [hours, minutes] = data.time.split(':');
      const saleDate = new Date(data.date);
      saleDate.setHours(parseInt(hours), parseInt(minutes));

      const sale = await apiRequest("POST", "/api/sales", {
        productId: selectedProduct.id,
        quantity: data.quantity,
        date: saleDate,
        isInstallment: data.isInstallment,
        priceIqd: selectedProduct.priceIqd,
        userId: user.id,
        customerName: data.customerName || undefined,
      });

      if (!sale.ok) {
        const errorData = await sale.json();
        throw new Error(errorData.message || "فشل في إنشاء عملية البيع");
      }

      const saleData = await sale.json();

      const invoice: InsertInvoice = {
        saleId: saleData.id,
        customerName: data.customerName || "عميل نقدي",
        totalAmount: Number(selectedProduct.priceIqd) * data.quantity,
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: saleDate,
      };

      const savedInvoice = await apiRequest("POST", "/api/invoices", invoice);
      if (!savedInvoice.ok) {
        throw new Error("فشل في إنشاء الفاتورة");
      }

      if (data.printInvoice) {
        setSelectedSale({
          ...saleData,
          customerName: data.customerName || "عميل نقدي",
        });
        setTimeout(handlePrint, 100);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      form.reset();
      setSelectedProduct(null);
      setSearchQuery("");

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء البيع والفاتورة بنجاح",
      });
    } catch (error) {
      console.error('Error creating sale:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء البيع",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">المبيعات الأخيرة</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  قائمة بجميع عمليات البيع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>التاريخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => {
                        const product = searchResults.find((p) => p.id === sale.productId);
                        return (
                          <TableRow key={sale.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{product?.name}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell className="font-semibold">
                              {Number(sale.priceIqd).toLocaleString()} د.ع
                            </TableCell>
                            <TableCell>{sale.customerName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(sale.date).toLocaleDateString('ar-IQ')}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg transition-shadow hover:shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">بيع جديد</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                إنشاء عملية بيع جديدة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">التاريخ</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onSelect={field.onChange}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">الوقت</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="time"
                                className="pl-8 w-full"
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">اسم العميل</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              className="pl-8 w-full transition-colors focus:border-primary"
                              placeholder="ادخل اسم العميل"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">بحث عن المنتج</Label>
                    <div className="relative">
                      <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8 w-full transition-colors focus:border-primary"
                        placeholder="ابحث بالاسم أو الرمز أو الباركود"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <Select
                        value={selectedProduct?.id.toString()}
                        onValueChange={(value) => {
                          const product = searchResults.find(p => p.id === parseInt(value));
                          setSelectedProduct(product || null);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          {searchResults.map((product) => (
                            <SelectItem 
                              key={product.id}
                              value={product.id.toString()}
                              className="cursor-pointer hover:bg-muted"
                            >
                              {product.name} - {product.productCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {selectedProduct && (
                      <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                        السعر: {Number(selectedProduct.priceIqd).toLocaleString()} د.ع
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">الكمية</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            className="w-full transition-colors focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="printInvoice"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="rounded border-input"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium mr-2">طباعة الفاتورة</FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white transition-colors"
                  >
                    إتمام البيع
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Print Area */}
        <div className="hidden">
          <div ref={printRef} className="p-8">
            {selectedSale && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-2">فاتورة بيع</h1>
                  <p className="text-muted-foreground">رقم الفاتورة: {selectedSale.id}</p>
                  <p className="text-muted-foreground">
                    التاريخ: {new Date(selectedSale.date).toLocaleDateString('ar-IQ')}
                  </p>
                  <p className="text-muted-foreground">
                    الوقت: {format(new Date(selectedSale.date), 'HH:mm')}
                  </p>
                </div>
                <div className="border-t border-b py-4">
                  <p>العميل: {selectedSale.customerName}</p>
                  <p className="font-semibold">
                    المبلغ الإجمالي: {Number(selectedSale.priceIqd).toLocaleString()} د.ع
                  </p>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-right">المنتج</th>
                      <th className="py-2 text-right">الكمية</th>
                      <th className="py-2 text-right">السعر</th>
                      <th className="py-2 text-right">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">
                        {searchResults.find(p => p.id === selectedSale.productId)?.name}
                      </td>
                      <td className="py-2">{selectedSale.quantity}</td>
                      <td className="py-2">
                        {Number(selectedSale.priceIqd).toLocaleString()} د.ع
                      </td>
                      <td className="py-2 font-semibold">
                        {(Number(selectedSale.priceIqd) * selectedSale.quantity).toLocaleString()} د.ع
                      </td>
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