import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronDownIcon, PlusIcon } from "lucide-react";


export default function Sales() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterText, setFilterText] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [sales, setSales] = useState([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);

  const refetchSales = async () => {
    setIsLoadingSales(true);
    try {
      const response = await axios.get('/api/sales');
      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast({
        title: "خطأ",
        description: "فشل جلب بيانات المبيعات",
        variant: "destructive"
      })
    } finally {
      setIsLoadingSales(false);
    }
  };

  useEffect(() => {
    refetchSales();
  }, []);


  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/products');
        return response.data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/customers');
        return response.data || [];
      } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
      }
    }
  });

  const { data: exchangeRate } = useQuery({
    queryKey: ["/api/exchange-rate"],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/exchange-rate');
        return response.data;
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return { usdToIqd: 1500 };
      }
    }
  });

  // تحليل بيانات المبيعات للرسم البياني
  const analyticsData = sales && Array.isArray(sales) ? sales.reduce((acc: any[], sale) => {
    // التحقق من وجود البيع وأنه يحتوي على تاريخ
    if (sale && sale.date) {
      // تنسيق التاريخ ليكون yyyy-MM-dd
      const date = new Date(sale.date).toISOString().split('T')[0];

      // البحث عن تاريخ موجود بالفعل للتحديث
      const existingDateIndex = acc.findIndex(item => item.date === date);

      // حساب الإيرادات
      const revenue = Number(sale.finalPriceIqd || 0);

      if (existingDateIndex !== -1) {
        // تحديث عنصر موجود
        acc[existingDateIndex].sales += 1;
        acc[existingDateIndex].revenue += revenue;
      } else {
        // إضافة عنصر جديد
        acc.push({
          date,
          sales: 1,
          revenue: revenue
        });
      }
    }
    return acc;
  }, []) : [];

  const addSaleMutation = useMutation({
    mutationFn: async (newSale: any) => {
      return await axios.post('/api/sales', newSale);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      setIsAddDialogOpen(false);
      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة عملية البيع بنجاح",
      });
      refetchSales();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشلت إضافة عملية البيع. تأكد من توفر المخزون الكافي.",
        variant: "destructive",
      });
      console.error("Error adding sale:", error);
    }
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (newCustomer: any) => {
      return await axios.post('/api/customers', newCustomer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setIsCustomerDialogOpen(false);
      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة العميل بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشلت إضافة العميل",
        variant: "destructive",
      });
      console.error("Error adding customer:", error);
    }
  });

  const handleDeleteSale = async (saleId: number) => {
    try {
      await axios.delete(`/api/sales/${saleId}`);
      toast({
        title: "تم حذف البيع بنجاح",
        description: "تم حذف بيانات البيع من النظام",
      });
      refetchSales();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في حذف البيع",
        description: error.message || "حدث خطأ أثناء حذف البيع",
      });
      console.error("Error deleting sale:", error);
    }
  };

  // فلترة المبيعات بناءً على نص البحث
  const filteredSales = Array.isArray(sales) ? sales.filter(sale => {
    // ابحث في اسم المنتج أو اسم العميل أو أي حقل آخر حسب الحاجة
    const product = products.find(p => p.id === sale.productId);
    const customer = customers.find(c => c.id === sale.customerId);

    return (
      !filterText ||
      (product && product.name.includes(filterText)) ||
      (customer && customer.name.includes(filterText)) ||
      sale.id.toString().includes(filterText)
    );
  }) : [];

  return (
    <div className="container mx-auto py-6 space-y-6 rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">المبيعات</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>إضافة عملية بيع</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales && Array.isArray(sales) ? sales.length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>الإيرادات (دينار)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales && Array.isArray(sales)
                ? sales.reduce((sum, sale) => sum + Number(sale.finalPriceIqd || 0), 0).toLocaleString()
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>متوسط قيمة البيع (دينار)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales && Array.isArray(sales) && sales.length > 0
                ? (sales.reduce((sum, sale) => sum + Number(sale.finalPriceIqd || 0), 0) / sales.length).toLocaleString()
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="بحث في المبيعات..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم العملية</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>السعر (دينار)</TableHead>
              <TableHead>الخصم</TableHead>
              <TableHead>السعر النهائي</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSales ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  جارٍ التحميل...
                </TableCell>
              </TableRow>
            ) : filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  لا توجد بيانات مبيعات
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => {
                const product = products.find(p => p.id === sale.productId);
                const customer = customers.find(c => c.id === sale.customerId);

                return (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell>{product ? product.name : 'غير معروف'}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{Number(sale.priceIqd).toLocaleString()}</TableCell>
                    <TableCell>{Number(sale.discount || 0).toLocaleString()}</TableCell>
                    <TableCell>{Number(sale.finalPriceIqd).toLocaleString()}</TableCell>
                    <TableCell>{customer ? customer.name : 'غير معروف'}</TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString('ar-IQ')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSale(sale.id)}
                      >
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة عملية بيع جديدة</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const productId = Number(formData.get('productId'));
              const quantity = Number(formData.get('quantity'));
              const discount = Number(formData.get('discount') || 0);

              // العثور على المنتج للحصول على سعره
              const product = products.find(p => p.id === productId);
              if (!product) {
                toast({
                  title: "خطأ",
                  description: "يرجى اختيار منتج صالح",
                  variant: "destructive",
                });
                return;
              }

              const priceIqd = Number(product.priceIqd);
              const totalPrice = priceIqd * quantity - discount;

              const newSale = {
                productId,
                quantity,
                priceIqd: priceIqd.toString(),
                discount: discount.toString(),
                finalPriceIqd: totalPrice.toString(),
                customerName: formData.get('customerName'),
                isInstallment: false,
                date: date ? date.toISOString() : new Date().toISOString()
              };

              addSaleMutation.mutate(newSale);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">المنتج</Label>
                <Select name="productId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر منتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - المخزون: {product.stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">الخصم (دينار)</Label>
              <Input
                id="discount"
                name="discount"
                type="number"
                min="0"
                defaultValue="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">اسم العميل (اختياري)</Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="عميل نقدي"
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ البيع</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ar}
                className="border rounded-md p-3"
              />
            </div>

            <DialogFooter>
              <Button type="submit">حفظ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
                <DialogDescription>
                  أدخل معلومات العميل الجديد
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newCustomer = {
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    address: formData.get('address'),
                    notes: formData.get('notes'),
                  };

                  addCustomerMutation.mutate(newCustomer);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">اسم العميل</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="اسم العميل"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="رقم الهاتف"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="البريد الإلكتروني"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="عنوان العميل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerNotes">ملاحظات</Label>
                  <Input
                    id="customerNotes"
                    name="notes"
                    placeholder="ملاحظات إضافية..."
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">إضافة</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    </div>
  );
}