
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, Download, Printer, Search } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { DatePickerWithRange } from "@/components/date-picker-with-range";

// إضافة مكونات DialogDescription و DialogFooter يدويًا للتوافق
const DialogDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`text-sm text-muted-foreground ${className || ''}`}>{children}</div>
);

const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}>{children}</div>
);

interface DateRange {
  from?: Date;
  to?: Date;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productName?: string;
  }>;
}

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // جلب الفواتير من API
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ["invoices", searchTerm, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (dateRange.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange.to) params.append("endDate", dateRange.to.toISOString());

      const response = await fetch(`/api/invoices?${params.toString()}`);
      if (!response.ok) {
        throw new Error("فشل في جلب الفواتير");
      }
      return response.json();
    },
  });

  const handleViewInvoice = async (id: number) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (!response.ok) {
        throw new Error("فشل في جلب تفاصيل الفاتورة");
      }
      const invoice = await response.json();
      setSelectedInvoice(invoice);
      setIsViewModalOpen(true);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب تفاصيل الفاتورة",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPrintModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">الفواتير</h1>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة القائمة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="search">بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  className="pr-10"
                  placeholder="رقم الفاتورة أو اسم العميل"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>نطاق التاريخ</Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-lg">جاري تحميل الفواتير...</div>
            </div>
          ) : !response?.data?.length ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-lg">لا توجد فواتير متاحة</div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>قائمة الفواتير</CardTitle>
                <CardDescription>
                  عرض وإدارة جميع الفواتير في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الفاتورة</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {response.data.map((invoice: Invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>
                          {format(new Date(invoice.createdAt), "dd/MM/yyyy", {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>
                          {invoice.totalAmount.toLocaleString()} د.ع
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "active"
                                ? "default"
                                : invoice.status === "cancelled"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {invoice.status === "active"
                              ? "نشط"
                              : invoice.status === "cancelled"
                              ? "ملغي"
                              : "معدل"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice.id)}
                            >
                              عرض
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintInvoice(invoice)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  إجمالي الفواتير: {response.pagination?.total || 0}
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={response.pagination?.page <= 1}
                    onClick={() => {
                      // التنقل بين الصفحات
                    }}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      response.pagination?.page >= response.pagination?.pages
                    }
                    onClick={() => {
                      // التنقل بين الصفحات
                    }}
                  >
                    التالي
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* نافذة عرض تفاصيل الفاتورة */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الفاتورة</DialogTitle>
              <DialogDescription>
                عرض كامل تفاصيل الفاتورة والمنتجات
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-bold">معلومات الفاتورة</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">رقم الفاتورة:</span>
                        <span>{selectedInvoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">التاريخ:</span>
                        <span>
                          {format(new Date(selectedInvoice.createdAt), "dd/MM/yyyy", {
                            locale: ar,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الحالة:</span>
                        <Badge
                          variant={
                            selectedInvoice.status === "active"
                              ? "default"
                              : selectedInvoice.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {selectedInvoice.status === "active"
                            ? "نشط"
                            : selectedInvoice.status === "cancelled"
                            ? "ملغي"
                            : "معدل"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">معلومات العميل</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">اسم العميل:</span>
                        <span>{selectedInvoice.customerName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-2">المنتجات</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>المنتج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.productName || `منتج #${item.productId}`}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitPrice.toLocaleString()} د.ع</TableCell>
                          <TableCell>{item.totalPrice.toLocaleString()} د.ع</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>الإجمالي:</span>
                      <span>{selectedInvoice.totalAmount.toLocaleString()} د.ع</span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handlePrintInvoice(selectedInvoice)}
                  >
                    <Printer className="ml-2 h-4 w-4" />
                    طباعة
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // تحميل الفاتورة
                    }}
                  >
                    <Download className="ml-2 h-4 w-4" />
                    تحميل PDF
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* نموذج طباعة الفاتورة - يظهر فقط عند الطباعة */}
        {selectedInvoice && (
          <div className="hidden print:block p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">فاتورة</h1>
                <p>رقم الفاتورة: {selectedInvoice.invoiceNumber}</p>
                <p>
                  التاريخ:{" "}
                  {format(new Date(selectedInvoice.createdAt), "dd/MM/yyyy", {
                    locale: ar,
                  })}
                </p>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold">شركتكم</h2>
                <p>العنوان: بغداد، العراق</p>
                <p>الهاتف: 07XXXXXXXXX</p>
                <p>البريد الإلكتروني: info@yourcompany.com</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold mb-2">العميل</h3>
              <p className="font-bold">{selectedInvoice.customerName}</p>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 text-right">#</th>
                  <th className="py-2 text-right">المنتج</th>
                  <th className="py-2 text-right">الكمية</th>
                  <th className="py-2 text-right">السعر</th>
                  <th className="py-2 text-right">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{item.productName || `منتج #${item.productId}`}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">{item.unitPrice.toLocaleString()} د.ع</td>
                    <td className="py-2">{item.totalPrice.toLocaleString()} د.ع</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="font-bold">الإجمالي:</span>
                  <span>{selectedInvoice.totalAmount.toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
              <p>شكراً لتعاملكم معنا</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
