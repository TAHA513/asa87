import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// إضافة مكونات الحوار المفقودة يدويًا
const DialogDescription = ({ children, className }) => (
  <div className={`text-sm text-muted-foreground ${className || ''}`}>{children}</div>
);

const DialogFooter = ({ children, className }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}>{children}</div>
);
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter"; // Importing from wouter
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
import { CalendarIcon, ChevronDownIcon, PlusIcon, PrinterIcon, SearchIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useReactToPrint } from "react-to-print";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Sale {
  id: number;
  productId: number;
  customerId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  saleDate: string;
  notes?: string;
  product: {
    name: string;
    sku: string;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  guarantorName?: string;
  guarantorPhone?: string;
}

export default function Sales() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isInstallmentDialogOpen, setIsInstallmentDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filterText, setFilterText] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [, navigate] = useLocation(); // Using useLocation from wouter correctly

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">يرجى تسجيل الدخول للوصول إلى صفحة المبيعات</div>;
  }

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/sales');
        console.log("Fetched sales:", response);
        return response;
      } catch (error) {
        console.error("Error fetching sales:", error);
        return [];
      }
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/products');
        console.log("Fetched products:", response);
        return response;
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/customers');
        console.log("Fetched customers:", response);
        return response;
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
        const response = await apiRequest('GET', '/api/exchange-rate');
        console.log("Fetched exchange rate:", response);
        return response;
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return { usdToIqd: 1500 };
      }
    }
  });

  // You can access URL search params if needed, using Wouter
  useEffect(() => {
    // Parse current location to extract any search parameters
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setFilterText(searchParam);
    }
  }, [location]);

  const addSaleMutation = useMutation({
    mutationFn: async (newSale: any) => {
      return await apiRequest('POST', '/api/sales', newSale);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      setIsAddDialogOpen(false);
      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة عملية البيع بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشلت إضافة عملية البيع",
        variant: "destructive",
      });
      console.error("Error adding sale:", error);
    }
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (newCustomer: any) => {
      return await apiRequest('POST', '/api/customers', newCustomer);
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

  const filteredSales = sales.filter(sale => {
    const searchTerm = filterText.toLowerCase();
    return (
      sale.product?.name?.toLowerCase().includes(searchTerm) ||
      sale.customer?.name?.toLowerCase().includes(searchTerm) ||
      sale.paymentStatus?.toLowerCase().includes(searchTerm) ||
      sale.paymentMethod?.toLowerCase().includes(searchTerm) ||
      (sale.notes && sale.notes.toLowerCase().includes(searchTerm))
    );
  });

  const invoiceTemplateRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => invoiceTemplateRef.current,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      setSelectedSale(null);
    },
  });

  // Analytics data transformation
  const analyticsData = sales.reduce((acc: any[], sale) => {
    // استخدم date أو saleDate حسب ما هو متوفر
    const saleDate = sale.date || sale.saleDate;
    if (!saleDate) return acc;

    const date = new Date(saleDate).toLocaleDateString();
    const existingDate = acc.find(item => item.date === date);

    // التأكد من أن totalPrice أو priceIqd * quantity متوفر
    const revenue = sale.totalPrice || 
                   (sale.priceIqd && sale.quantity ? Number(sale.priceIqd) * sale.quantity : 0);

    if (existingDate) {
      existingDate.sales += 1;
      existingDate.revenue += revenue;
    } else {
      acc.push({
        date,
        sales: 1,
        revenue: revenue
      });
    }
    return acc;
  }, []);


  const handleDeleteSale = (saleId: number) => {
    // Implementation for deleting a sale
    apiRequest('DELETE', `/api/sales/${saleId}`)
      .then(response => {
        queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
        toast({
          title: "تم الحذف",
          description: "تم حذف عملية البيع بنجاح",
        });
      })
      .catch(error => {
        toast({
          title: "خطأ",
          description: "فشل حذف عملية البيع",
          variant: "destructive",
        });
        console.error("Error deleting sale:", error);
      });
  };

  const goToInstallments = (saleId: number) => {
    // Navigate to installments page with the sale ID
    navigate(`/installments?saleId=${saleId}`);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المبيعات</h1>
          <p className="text-muted-foreground">
            إدارة وتتبع عمليات البيع والفواتير
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <ChevronDownIcon className="h-4 w-4" />
            {showAnalytics ? "إخفاء التحليلات" : "عرض التحليلات"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PlusIcon className="h-4 w-4" />
                إضافة عملية بيع
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة عملية بيع جديدة</DialogTitle>
                <DialogDescription>
                  قم بإدخال تفاصيل عملية البيع الجديدة
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const productId = Number(formData.get('productId'));
                  const customerId = Number(formData.get('customerId'));
                  const quantity = Number(formData.get('quantity'));

                  // Find the product to get its price
                  const product = products.find(p => p.id === productId);
                  const unitPrice = product ? product.price : 0;
                  const totalPrice = unitPrice * quantity;

                  const newSale = {
                    productId,
                    customerId,
                    quantity,
                    unitPrice,
                    totalPrice,
                    paymentStatus: formData.get('paymentStatus'),
                    paymentMethod: formData.get('paymentMethod'),
                    saleDate: date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                    notes: formData.get('notes'),
                    guarantorName: formData.get('guarantorName'),
                    guarantorPhone: formData.get('guarantorPhone'),
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
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="customerId">العميل</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsCustomerDialogOpen(true)}
                      >
                        + جديد
                      </Button>
                    </div>
                    <Select name="customerId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر عميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="saleDate">تاريخ البيع</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full flex justify-between"
                        >
                          {date ? format(date, 'P') : <span>اختر تاريخ</span>}
                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">حالة الدفع</Label>
                    <Select name="paymentStatus" defaultValue="paid" required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">مدفوع</SelectItem>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="installment">تقسيط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                    <Select name="paymentMethod" defaultValue="cash" required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقدي</SelectItem>
                        <SelectItem value="card">بطاقة ائتمان</SelectItem>
                        <SelectItem value="bank">تحويل بنكي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="أي ملاحظات إضافية..."
                  />
                </div>
                <div className="space-y-4" id="guarantorInfo">
                  <h4 className="text-sm font-medium">معلومات الضامن (للتقسيط فقط)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guarantorName">اسم الضامن</Label>
                      <Input
                        id="guarantorName"
                        name="guarantorName"
                        placeholder="اسم الضامن"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guarantorPhone">هاتف الضامن</Label>
                      <Input
                        id="guarantorPhone"
                        name="guarantorPhone"
                        placeholder="رقم هاتف الضامن"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">إضافة</Button>
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
                onSubmit={(e) => {
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
      </div>

      {showAnalytics && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>تحليلات المبيعات</CardTitle>
            <CardDescription>
              نظرة عامة على أداء المبيعات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: any) => 
                    typeof value === 'number' ? value.toLocaleString() : value
                  } />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="عدد المبيعات" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff7300" name="الإيرادات" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {sales.length.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    إجمالي عمليات البيع
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {sales.reduce((sum, sale) => sum + sale.totalPrice, 0).toLocaleString()} $
                  </div>
                  <p className="text-xs text-muted-foreground">
                    إجمالي الإيرادات بالدولار
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {(sales.reduce((sum, sale) => sum + sale.totalPrice, 0) * (exchangeRate?.usdToIqd || 1500)).toLocaleString()} د.ع
                  </div>
                  <p className="text-xs text-muted-foreground">
                    إجمالي الإيرادات بالدينار العراقي
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="البحث في المبيعات..."
            className="pl-8"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <Card className="flex-1">
        <CardHeader className="p-4">
          <CardTitle>قائمة المبيعات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>حالة الدفع</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      لا توجد بيانات مبيعات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.id}</TableCell>
                      <TableCell>{sale.product.name}</TableCell>
                      <TableCell>{sale.customer.name}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell>${sale.unitPrice.toLocaleString()}</TableCell>
                      <TableCell>${sale.totalPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          sale.paymentStatus === 'paid' ? 'default' :
                          sale.paymentStatus === 'pending' ? 'outline' : 
                          'secondary'
                        }>
                          {sale.paymentStatus === 'paid' ? 'مدفوع' :
                          sale.paymentStatus === 'pending' ? 'قيد الانتظار' : 
                          'تقسيط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sale.paymentMethod === 'cash' ? 'نقدي' :
                        sale.paymentMethod === 'card' ? 'بطاقة ائتمان' : 
                        'تحويل بنكي'}
                      </TableCell>
                      <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDownIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedSale(sale);
                                setTimeout(() => {
                                  handlePrint();
                                }, 100);
                              }}
                            >
                              طباعة الفاتورة
                            </DropdownMenuItem>
                            {sale.paymentStatus === 'installment' && (
                              <DropdownMenuItem onClick={() => goToInstallments(sale.id)}>
                                عرض الأقساط
                              </DropdownMenuItem>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  حذف
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    سيؤدي هذا إلى حذف عملية البيع بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSale(sale.id)}
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Print Template */}
      <div className="hidden">
        <div ref={invoiceTemplateRef} className="p-8 bg-white">
          {selectedSale && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">فاتورة</h1>
                  <p className="text-muted-foreground">رقم الفاتورة: {selectedSale.id}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold">شركتك</h2>
                  <p>العنوان: شارع الرئيسي، المدينة</p>
                  <p>الهاتف: 123-456-789</p>
                  <p>البريد الإلكتروني: info@yourcompany.com</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">العميل</h3>
                  <p className="font-bold">{selectedSale.customer.name}</p>
                  <p>{selectedSale.customer.phone}</p>
                  <p>{selectedSale.customer.email}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold mb-2">تفاصيل الفاتورة</h3>
                  <p>تاريخ البيع: {new Date(selectedSale.saleDate).toLocaleDateString()}</p>
                  <p>حالة الدفع: {
                    selectedSale.paymentStatus === 'paid' ? 'مدفوع' :
                    selectedSale.paymentStatus === 'pending' ? 'قيد الانتظار' : 
                    'تقسيط'
                  }</p>
                  <p>طريقة الدفع: {
                    selectedSale.paymentMethod === 'cash' ? 'نقدي' :
                    selectedSale.paymentMethod === 'card' ? 'بطاقة ائتمان' : 
                    'تحويل بنكي'
                  }</p>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-left">
                  <thead className="border-b">
                    <tr className="border-b">
                      <th className="py-2 text-right">المنتج</th>
                      <th className="py-2 text-right">الكمية</th>
                      <th className="py-2 text-right">سعر الوحدة</th>
                      <th className="py-2 text-right">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">{selectedSale.product.name}</td>
                      <td className="py-2">{selectedSale.quantity}</td>
                      <td className="py-2">${selectedSale.unitPrice.toLocaleString()}</td>
                      <td className="py-2">${selectedSale.totalPrice.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="border rounded-md p-4 w-72">
                  <div className="flex justify-between mb-2">
                    <span>المجموع:</span>
                    <span>${selectedSale.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>الضريبة (0%):</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>الإجمالي:</span>
                    <span>${selectedSale.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-muted-foreground text-sm">
                    <span>بالدينار العراقي:</span>
                    <span>
                      {(selectedSale.totalPrice * (exchangeRate?.usdToIqd || 1500)).toLocaleString()} د.ع
                    </span>
                  </div>
                </div>
              </div>

              {selectedSale.notes && (
                <div>
                  <h3 className="text-lg font-bold mb-2">ملاحظات</h3>
                  <p>{selectedSale.notes}</p>
                </div>
              )}

              {selectedSale.paymentStatus === 'installment' && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold mb-2">معلومات التقسيط</h3>
                  {selectedSale.guarantorName && (
                    <p>الضامن: {selectedSale.guarantorName} {selectedSale.guarantorPhone ? `- ${selectedSale.guarantorPhone}` : ''}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    * يرجى مراجعة جدول الأقساط المرفق للاطلاع على مواعيد السداد.
                  </p>
                </div>
              )}

              <div className="text-center mt-8 pt-8 border-t text-sm text-muted-foreground">
                <p>شكراً لتعاملكم معنا!</p>
                <p>هذه الفاتورة أنشئت بواسطة نظام إدارة المبيعات</p>
                <p>طبعت بواسطة: {user?.fullName || 'مدير النظام'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}