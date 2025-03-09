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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Package, Users, Clock, FileDown, BarChart2, Printer, Trash } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import { useRef } from "react";
import type { Sale, Product, InsertInvoice, InsertInstallment } from "@shared/schema";
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
import { useNavigate } from "react-router-dom"; // Added import
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";


interface NewSaleFormData {
  productId: number;
  quantity: number;
  customerName: string;
  date: Date;
  time: string;
  discount: number;
  isInstallment: boolean;
  customerPhone: string;
  identityNumber: string;
  downPayment: number;
  numberOfPayments: number;
  startDate: Date;
  guarantorName?: string;
  guarantorPhone?: string;
}

export default function Sales() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const navigate = useNavigate(); // Using useNavigate from react-router-dom

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
      discount: 0,
      isInstallment: false,
      customerName: "",
      customerPhone: "",
      identityNumber: "",
      downPayment: 0,
      numberOfPayments: 1,
      startDate: new Date(),
      guarantorName: "",
      guarantorPhone: "",
    },
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true);
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      form.reset();
      setSelectedProduct(null);
      setSearchQuery("");
    },
    onPrintError: (error) => {
      console.error('Print failed:', error);
      toast({
        title: "خطأ في الطباعة",
        description: "حدث خطأ أثناء محاولة الطباعة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setIsPrinting(false);
    },
  });

  const handleSaleSubmit = async (data: NewSaleFormData, withPrint: boolean = false) => {
    try {
      if (!selectedProduct) {
        toast({
          title: "خطأ",
          description: "الرجاء اختيار منتج",
          variant: "destructive",
        });
        return;
      }

      // التحقق من المخزون
      if (selectedProduct.stock < data.quantity) {
        toast({
          title: "خطأ في المخزون",
          description: `المخزون غير كافٍ. المتوفر: ${selectedProduct.stock} قطعة`,
          variant: "destructive",
        });
        return;
      }

      const [hours, minutes] = data.time.split(':');
      const saleDate = new Date(data.date);
      saleDate.setHours(parseInt(hours), parseInt(minutes));

      const totalPrice = Number(selectedProduct.priceIqd) * data.quantity;
      const finalPrice = totalPrice - data.discount;

      const sale = await apiRequest("POST", "/api/sales", {
        productId: selectedProduct.id,
        quantity: data.quantity,
        date: saleDate,
        isInstallment: data.isInstallment,
        priceIqd: selectedProduct.priceIqd,
        discount: data.discount.toString(),
        userId: user?.id,
        customerName: data.customerName || undefined,
      });

      if (!sale.ok) {
        const errorData = await sale.json();
        throw new Error(errorData.message || "فشل في إنشاء عملية البيع");
      }

      const saleData = await sale.json();

      if (data.isInstallment) {
        const installment: InsertInstallment = {
          saleId: saleData.id,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          identityNumber: data.identityNumber,
          totalAmount: finalPrice.toString(),
          downPayment: data.downPayment.toString(),
          numberOfPayments: data.numberOfPayments,
          remainingAmount: (finalPrice - data.downPayment).toString(),
          startDate: data.startDate,
          nextPaymentDate: data.startDate,
          guarantorName: data.guarantorName || undefined,
          guarantorPhone: data.guarantorPhone || undefined,
        };

        const savedInstallment = await apiRequest("POST", "/api/installments", installment);
        if (!savedInstallment.ok) {
          throw new Error("فشل في إنشاء التقسيط");
        }
      }

      const invoice: InsertInvoice = {
        saleId: saleData.id,
        customerName: data.customerName || "عميل نقدي",
        totalAmount: totalPrice,
        discountAmount: data.discount,
        finalAmount: finalPrice.toString(),
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: saleDate,
      };

      const savedInvoice = await apiRequest("POST", "/api/invoices", invoice);
      if (!savedInvoice.ok) {
        throw new Error("فشل في إنشاء الفاتورة");
      }

      if (withPrint) {
        setSelectedSale({
          ...saleData,
          customerName: data.customerName || "عميل نقدي",
        });
        setTimeout(handlePrint, 100);
      } else {
        form.reset();
        setSelectedProduct(null);
        setSearchQuery("");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });

      toast({
        title: "تم بنجاح",
        description: `تم إنشاء ${data.isInstallment ? 'البيع بالتقسيط' : 'البيع'} والفاتورة بنجاح`,
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

  const exportToCSV = () => {
    // Add your CSV export logic here
    console.log("Exporting to CSV");
    toast({title: "تصدير", description: "جارى تصدير البيانات"})
  };

  const salesChartData = [
    // Sample data, replace with your actual data
    { date: '2024-03-01', amount: 1000, count: 5 },
    { date: '2024-03-02', amount: 1500, count: 8 },
    { date: '2024-03-03', amount: 1200, count: 6 },
    { date: '2024-03-04', amount: 800, count: 3 },
    { date: '2024-03-05', amount: 2000, count: 10 },
    { date: '2024-03-06', amount: 1800, count: 9 },
    { date: '2024-03-07', amount: 1600, count: 7 },
  ];


  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="shadow-lg transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader className="space-y-1 border-b pb-7 mb-2">
                <CardTitle className="text-2xl font-bold tracking-tight">المبيعات الأخيرة</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  قائمة بجميع عمليات البيع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الخصم</TableHead>
                        <TableHead>السعر النهائي</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الخيارات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => {
                        const product = searchResults.find((p) => p.id === sale.productId);
                        const finalPrice = Number(sale.priceIqd) * sale.quantity - Number(sale.discount);
                        return (
                          <TableRow key={sale.id} className="hover:bg-muted/30 transition-colors duration-200">
                            <TableCell className="font-medium">{product?.name}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell>
                              {Number(sale.priceIqd).toLocaleString()} د.ع
                            </TableCell>
                            <TableCell className="text-red-500">
                              {Number(sale.discount).toLocaleString()} د.ع
                            </TableCell>
                            <TableCell className="font-semibold">
                              {finalPrice.toLocaleString()} د.ع
                            </TableCell>
                            <TableCell>{sale.customerName || "عميل نقدي"}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(sale.date).toLocaleDateString('ar-IQ')}
                            </TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSale(sale.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  // طباعة الفاتورة
                                  const product = searchResults.find(p => p.id === sale.productId);
                                  // Assuming you have a way to fetch customer details based on sale.customerId
                                  const customer = {name: "test", phone: "1234567890"}; // Replace with actual customer fetch

                                  const printWindow = window.open('', '_blank');
                                  if (printWindow) {
                                    printWindow.document.write(`
                                      <html dir="rtl">
                                        <head>
                                          <title>فاتورة مبيعات</title>
                                          <style>
                                            body { font-family: Arial, sans-serif; padding: 20px; }
                                            .header { text-align: center; margin-bottom: 20px; }
                                            .details { margin-bottom: 20px; }
                                            .total { font-weight: bold; margin-top: 20px; text-align: left; }
                                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                            th, td { padding: 8px; text-align: right; border-bottom: 1px solid #ddd; }
                                            th { background-color: #f2f2f2; }
                                            @media print { 
                                              button { display: none; }
                                              body { margin: 0; padding: 0 10px; }
                                            }
                                          </style>
                                        </head>
                                        <body>
                                          <div class="header">
                                            <h1>فاتورة مبيعات</h1>
                                            <p>رقم الفاتورة: ${sale.id}</p>
                                            <p>التاريخ: ${new Date(sale.date).toLocaleDateString('ar-IQ')}</p>
                                          </div>
                                          <div class="details">
                                            <h2>تفاصيل العميل:</h2>
                                            <p>الاسم: ${customer.name || 'عميل نقدي'}</p>
                                            <p>الهاتف: ${customer.phone || '-'}</p>
                                          </div>
                                          <table>
                                            <thead>
                                              <tr>
                                                <th>المنتج</th>
                                                <th>الكمية</th>
                                                <th>السعر</th>
                                                <th>الإجمالي</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr>
                                                <td>${product?.name || 'منتج غير معروف'}</td>
                                                <td>${sale.quantity}</td>
                                                <td>${Number(sale.priceIqd).toFixed(2)} د.ع</td>
                                                <td>${(Number(sale.priceIqd) * sale.quantity).toFixed(2)} د.ع</td>
                                              </tr>
                                            </tbody>
                                          </table>
                                          <div class="total">
                                            <p>المجموع الإجمالي: ${(Number(sale.priceIqd) * sale.quantity).toFixed(2)} د.ع</p>
                                          </div>
                                          <button onclick="window.print();" style="display: block; margin: 20px auto; padding: 10px 20px;">
                                            طباعة الفاتورة
                                          </button>
                                        </body>
                                      </html>
                                    `);
                                    printWindow.document.close();
                                  }
                                }}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
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

          <Card className="shadow-lg transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="space-y-1 border-b pb-7 mb-2">
              <CardTitle className="text-2xl font-bold tracking-tight">بيع جديد</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                إنشاء عملية بيع جديدة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => handleSaleSubmit(data, false))} className="space-y-6">
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
                                className="pl-8 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                              className="pl-8 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                              placeholder="ادخل اسم العميل"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            placeholder="ادخل رقم الهاتف"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">بحث عن المنتج</Label>
                    <div className="relative">
                      <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8 w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                              className="cursor-pointer transition-colors duration-200 hover:bg-muted"
                            >
                              {product.name} - {product.productCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {selectedProduct && (
                      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">السعر:</span>
                          <span>{Number(selectedProduct.priceIqd).toLocaleString()} د.ع</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">المخزون الحالي:</span>
                          <div className="flex items-center gap-2">
                            <span className={selectedProduct.stock < 10 ? "text-red-500" : ""}>
                              {selectedProduct.stock} قطعة
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newStock = window.prompt("أدخل الكمية الجديدة:", selectedProduct.stock.toString());
                                if (newStock && !isNaN(Number(newStock))) {
                                  apiRequest("PATCH", `/api/products/${selectedProduct.id}`, {
                                    stock: Number(newStock)
                                  }).then((response) => {
                                    if (response.ok) {
                                      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
                                      toast({
                                        title: "تم التحديث",
                                        description: "تم تحديث المخزون بنجاح",
                                      });
                                    } else {
                                      toast({
                                        title: "خطأ",
                                        description: "فشل تحديث المخزون",
                                        variant: "destructive",
                                      });
                                    }
                                  });
                                }
                              }}
                            >
                              تعديل المخزون
                            </Button>
                          </div>
                        </div>
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
                            className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">الخصم (د.ع)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isInstallment"
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
                        <FormLabel className="text-sm font-medium mr-2">بيع بالتقسيط</FormLabel>
                      </FormItem>
                    )}
                  />

                  {form.watch("isInstallment") && (
                    <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                      <FormField
                        control={form.control}
                        name="identityNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">رقم الهوية</FormLabel>
                            <FormControl>
                              <Input
                                className="w-full"
                                placeholder="ادخل رقم الهوية"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="downPayment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">الدفعة الأولى</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numberOfPayments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">عدد الأقساط</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="w-full"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">تاريخ بداية التقسيط</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={field.value}
                                onSelect={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4 border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground">معلومات الكفيل (اختياري)</h4>

                        <FormField
                          control={form.control}
                          name="guarantorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">اسم الكفيل</FormLabel>
                              <FormControl>
                                <Input
                                  className="w-full"
                                  placeholder="ادخل اسم الكفيل"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="guarantorPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">رقم هاتف الكفيل</FormLabel>
                              <FormControl>
                                <Input
                                  className="w-full"
                                  placeholder="ادخل رقم هاتف الكفيل"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {selectedProduct && form.watch("quantity") > 0 && (
                    <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>السعر الإجمالي:</span>
                        <span>{(Number(selectedProduct.priceIqd) * form.watch("quantity")).toLocaleString()} د.ع</span>
                      </div>
                      <div className="flex justify-between text-sm text-red-500">
                        <span>الخصم:</span>
                        <span>- {Number(form.watch("discount")).toLocaleString()} د.ع</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>السعر النهائي:</span>
                        <span>
                          {(Number(selectedProduct.priceIqd) * form.watch("quantity") - Number(form.watch("discount"))).toLocaleString()} د.ع
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-white transition-all duration-200"
                      disabled={isPrinting}
                    >
                      إتمام البيع
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 bg-primary hover:bg-primary/90 text-white transition-all duration-200"
                      disabled={isPrinting}
                      onClick={() => {
                        form.handleSubmit((data) => handleSaleSubmit(data, true))();
                      }}
                    >
                      {isPrinting ? "جاري الطباعة..." : "البيع مع طباعة الفاتورة"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {showAnalytics && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>تحليل المبيعات - آخر 7 أيام</CardTitle>
              <CardDescription>عرض رسم بياني بإجمالي المبيعات اليومية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} د.ع`} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="amount" name="إجمالي المبيعات" fill="hsl(var(--primary))" />
                    <Line yAxisId="right" type="monotone" dataKey="count" name="عدد المبيعات" stroke="#82ca9d" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

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
                  {Number(selectedSale.discount) > 0 && (
                    <p className="text-red-500">
                      الخصم: {Number(selectedSale.discount).toLocaleString()} د.ع
                    </p>
                  )}
                  <p className="font-bold mt-2">
                    المبلغ النهائي: {(Number(selectedSale.priceIqd) * selectedSale.quantity - Number(selectedSale.discount)).toLocaleString()} د.ع
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