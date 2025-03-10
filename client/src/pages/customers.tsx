
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Calendar as CalendarIcon, Phone, AlertCircle, Edit, Trash2, X, BarChart3, User, FileText, ShoppingCart } from "lucide-react";
import { CustomerGrowthChart } from "@/components/dashboard/analytics-charts";

// إضافة مكونات الحوار المفقودة
const DialogDescription = ({ children, className }) => (
  <div className={`text-sm text-muted-foreground ${className || ''}`}>{children}</div>
);

const DialogFooter = ({ children, className }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}>{children}</div>
);

// تعريف أنواع البيانات
interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
}

interface Sale {
  id: number;
  productId: number;
  customerId: number;
  quantity: number;
  priceIqd: string;
  date: string;
}

// مخططات التحقق من صحة البيانات
const insertCustomerSchema = z.object({
  name: z.string().min(1, { message: "الاسم مطلوب" }),
  phone: z.string().min(1, { message: "رقم الهاتف مطلوب" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }).optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const insertAppointmentSchema = z.object({
  title: z.string().min(1, { message: "العنوان مطلوب" }),
  description: z.string().optional().nullable(),
  date: z.date(),
  duration: z.number().min(1, { message: "المدة مطلوبة" }),
  notes: z.string().optional().nullable(),
});

// أنواع النماذج
type NewCustomerForm = z.infer<typeof insertCustomerSchema>;
type NewAppointmentForm = z.infer<typeof insertAppointmentSchema>;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("customers");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const customerForm = useForm<NewCustomerForm>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const appointmentForm = useForm<NewAppointmentForm>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      duration: 30,
      notes: "",
    },
  });

  const queryClient = useQueryClient();

  // استعلام لجلب قائمة العملاء
  const { data, isLoading, error } = useQuery<Customer[]>({
    queryKey: ["/api/customers", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      try {
        const res = await fetch(`/api/customers?${params.toString()}`);
        if (!res.ok) {
          throw new Error("فشل في جلب قائمة العملاء");
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("خطأ في جلب بيانات العملاء:", error);
        throw error;
      }
    },
  });

  // استعلام لجلب المبيعات
  const { data: salesData } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/sales`);
        if (!res.ok) {
          throw new Error("فشل في جلب بيانات المبيعات");
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("خطأ في جلب بيانات المبيعات:", error);
        return [];
      }
    },
  });

  // mutation لإضافة عميل جديد
  const createCustomerMutation = useMutation({
    mutationFn: async (data: NewCustomerForm) => {
      const response = await apiRequest('POST', '/api/customers', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsNewCustomerOpen(false);
      customerForm.reset();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة العميل بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ في إضافة العميل",
        variant: "destructive",
      });
    },
  });

  // mutation لإضافة موعد جديد
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: NewAppointmentForm) => {
      if (!selectedCustomer) throw new Error("لم يتم تحديد العميل");
      
      const appointmentData = {
        ...data,
        customerId: selectedCustomer.id,
      };
      
      const response = await apiRequest('POST', '/api/appointments', appointmentData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الموعد بنجاح",
      });
      setIsNewAppointmentOpen(false);
      appointmentForm.reset();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ في إنشاء الموعد",
        variant: "destructive",
      });
    },
  });

  // mutation لحذف العميل
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('فشل في حذف العميل');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setSelectedCustomer(null);
      setIsDeleteConfirmOpen(false);
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف العميل بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في حذف العميل",
        variant: "destructive",
      });
    },
  });

  const customers = data || [];
  const sales = salesData || [];

  const onSubmitCustomer = (data: NewCustomerForm) => {
    createCustomerMutation.mutate(data);
  };

  const onSubmitAppointment = (data: NewAppointmentForm) => {
    createAppointmentMutation.mutate(data);
  };

  const handleDeleteCustomer = (customerId: number) => {
    setCustomerToDelete(customerId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteCustomer = () => {
    if (customerToDelete) {
      deleteCustomerMutation.mutate(customerToDelete);
    }
  };

  // احتساب قيمة العميل
  const calculateCustomerValue = (customerId: number) => {
    const customerSales = sales.filter(sale => sale.customerId === customerId);
    return customerSales.reduce((total, sale) => {
      return total + (parseFloat(sale.priceIqd) * sale.quantity);
    }, 0);
  };

  // الحصول على عدد مرات الشراء
  const getCustomerPurchaseCount = (customerId: number) => {
    return sales.filter(sale => sale.customerId === customerId).length;
  };

  // تصنيف العملاء حسب قيمتهم
  const getCustomerCategory = (customerId: number) => {
    const value = calculateCustomerValue(customerId);
    
    if (value > 1000000) return { label: "ممتاز", color: "bg-green-500" };
    if (value > 500000) return { label: "جيد جدًا", color: "bg-blue-500" };
    if (value > 100000) return { label: "جيد", color: "bg-yellow-500" };
    return { label: "جديد", color: "bg-gray-500" };
  };

  return (
    <div className="container p-4 mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">إدارة العملاء</h1>
            <p className="text-muted-foreground">قم بإدارة العملاء، تتبع المبيعات وإنشاء المواعيد</p>
          </div>
          <TabsList>
            <TabsTrigger value="customers">
              <User className="w-4 h-4 ml-2" />
              العملاء
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 ml-2" />
              تحليلات
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="customers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>قائمة العملاء</CardTitle>
                <CardDescription>إدارة العملاء والمبيعات والمواعيد</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="البحث عن عميل..."
                    className="pl-8 w-[250px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 ml-2" />
                      عميل جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>إضافة عميل جديد</DialogTitle>
                      <DialogDescription>
                        أدخل بيانات العميل الجديد ثم اضغط على حفظ.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input id="name" {...customerForm.register("name")} />
                        {customerForm.formState.errors.name && (
                          <p className="text-red-500 text-sm">{customerForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input id="phone" type="tel" dir="ltr" {...customerForm.register("phone")} />
                        {customerForm.formState.errors.phone && (
                          <p className="text-red-500 text-sm">{customerForm.formState.errors.phone.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                        <Input id="email" type="email" dir="ltr" {...customerForm.register("email")} />
                        {customerForm.formState.errors.email && (
                          <p className="text-red-500 text-sm">{customerForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">العنوان (اختياري)</Label>
                        <Input id="address" {...customerForm.register("address")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                        <Textarea id="notes" {...customerForm.register("notes")} />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createCustomerMutation.isPending}>
                          {createCustomerMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <p>جاري تحميل البيانات...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                    <p className="mt-2">حدث خطأ أثناء تحميل البيانات</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/customers"] })}
                    >
                      إعادة المحاولة
                    </Button>
                  </div>
                </div>
              ) : customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="mb-4 text-muted-foreground">لا يوجد عملاء مسجلين حاليًا</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsNewCustomerOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 ml-2" />
                    إضافة عميل جديد
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>رقم الهاتف</TableHead>
                        <TableHead>تصنيف العميل</TableHead>
                        <TableHead>قيمة المشتريات</TableHead>
                        <TableHead>تاريخ الإضافة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => {
                        const category = getCustomerCategory(customer.id);
                        return (
                          <TableRow 
                            key={customer.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell dir="ltr" className="text-right">{customer.phone || "—"}</TableCell>
                            <TableCell>
                              <Badge className={`${category.color} hover:${category.color}`}>
                                {category.label}
                              </Badge>
                            </TableCell>
                            <TableCell>{calculateCustomerValue(customer.id).toLocaleString()} د.ع</TableCell>
                            <TableCell>{format(new Date(customer.createdAt), "PPP", { locale: ar })}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomer(customer);
                                  }}
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCustomer(customer.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* حوار تأكيد الحذف */}
          <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogDescription>
                  هل أنت متأكد من رغبتك في حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteCustomer}
                  disabled={deleteCustomerMutation.isPending}
                >
                  {deleteCustomerMutation.isPending ? "جاري الحذف..." : "حذف"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* تفاصيل العميل */}
          <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
            <SheetContent className="sm:max-w-[540px] overflow-y-auto">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle>بيانات العميل</SheetTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <SheetDescription>
                  عرض وإدارة بيانات ومبيعات ومواعيد العميل
                </SheetDescription>
              </SheetHeader>
              {selectedCustomer && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="mb-2 font-semibold">معلومات العميل</h3>
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">الاسم</p>
                            <p className="font-medium">{selectedCustomer.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                            <p className="font-medium" dir="ltr">{selectedCustomer.phone || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                            <p className="font-medium" dir="ltr">{selectedCustomer.email || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">العنوان</p>
                            <p className="font-medium">{selectedCustomer.address || "—"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ملاحظات</p>
                            <p className="font-medium">{selectedCustomer.notes || "—"}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold">إحصائيات العميل</h3>
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">تصنيف العميل</p>
                            <Badge className={`${getCustomerCategory(selectedCustomer.id).color} hover:${getCustomerCategory(selectedCustomer.id).color} mt-1`}>
                              {getCustomerCategory(selectedCustomer.id).label}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                            <p className="font-medium">{calculateCustomerValue(selectedCustomer.id).toLocaleString()} د.ع</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">عدد عمليات الشراء</p>
                            <p className="font-medium">{getCustomerPurchaseCount(selectedCustomer.id)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                            <p className="font-medium">{format(new Date(selectedCustomer.createdAt), "PPP", { locale: ar })}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">آخر المشتريات</h3>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="w-4 h-4 ml-2" />
                        عرض الكل
                      </Button>
                    </div>
                    <Card>
                      <CardContent className="p-4">
                        {sales.filter(sale => sale.customerId === selectedCustomer.id).length > 0 ? (
                          <div className="space-y-3">
                            {sales
                              .filter(sale => sale.customerId === selectedCustomer.id)
                              .slice(0, 5)
                              .map(sale => (
                                <div key={sale.id} className="p-3 border rounded-lg">
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {sale.productId}
                                    </span>
                                    <span>
                                      {Number(sale.priceIqd).toLocaleString()} د.ع
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                                    <span>الكمية: {sale.quantity}</span>
                                    <span>
                                      {format(new Date(sale.date), "PPP", { locale: ar })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6">
                            <p className="text-muted-foreground">لا توجد مشتريات للعميل</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" className="w-full" onClick={() => setIsNewAppointmentOpen(true)}>
                      <CalendarIcon className="w-4 h-4 ml-2" />
                      إضافة موعد جديد
                    </Button>
                  </div>

                  <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>إضافة موعد جديد</DialogTitle>
                        <DialogDescription>
                          إضافة موعد جديد للعميل {selectedCustomer.name}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={appointmentForm.handleSubmit(onSubmitAppointment)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">عنوان الموعد</Label>
                          <Input id="title" {...appointmentForm.register("title")} />
                          {appointmentForm.formState.errors.title && (
                            <p className="text-red-500 text-sm">{appointmentForm.formState.errors.title.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">الوصف (اختياري)</Label>
                          <Textarea id="description" {...appointmentForm.register("description")} />
                        </div>
                        <div className="space-y-2">
                          <Label>التاريخ</Label>
                          <div className="border rounded-md p-3">
                            <Calendar
                              mode="single"
                              selected={appointmentForm.getValues("date")}
                              onSelect={(date) => date && appointmentForm.setValue("date", date)}
                              locale={ar}
                              disabled={(date) => date < new Date()}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">المدة (بالدقائق)</Label>
                          <Select 
                            value={appointmentForm.getValues("duration").toString()} 
                            onValueChange={(value) => appointmentForm.setValue("duration", parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المدة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 دقيقة</SelectItem>
                              <SelectItem value="30">30 دقيقة</SelectItem>
                              <SelectItem value="45">45 دقيقة</SelectItem>
                              <SelectItem value="60">60 دقيقة</SelectItem>
                              <SelectItem value="90">90 دقيقة</SelectItem>
                              <SelectItem value="120">ساعتان</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                          <Textarea id="notes" {...appointmentForm.register("notes")} />
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={createAppointmentMutation.isPending}>
                            {createAppointmentMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>تحليلات العملاء</CardTitle>
                <CardDescription>تحليل نمو وتفاعل العملاء مع متجرك</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <CustomerGrowthChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
