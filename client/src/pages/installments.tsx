
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Edit, Printer, Trash } from "lucide-react";
import { useNavigate } from "wouter";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

// إضافة المكونات المفقودة بشكل يدوي
const DialogDescription = ({ children, className }) => (
  <div className={`text-sm text-muted-foreground ${className || ''}`}>{children}</div>
);

const DialogFooter = ({ children, className }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}>{children}</div>
);

// نموذج التحقق من بيانات التقسيط
const installmentFormSchema = z.object({
  invoiceId: z.number().optional(),
  customerId: z.number(),
  totalAmount: z.number().min(1, "يجب إدخال المبلغ الإجمالي"),
  paidAmount: z.number().min(0, "يجب أن يكون المبلغ المدفوع أكبر من أو يساوي صفر"),
  remainingAmount: z.number(),
  installmentCount: z.number().min(1, "يجب أن يكون عدد الأقساط أكبر من 0"),
  installmentAmount: z.number().min(1, "يجب إدخال مبلغ القسط"),
  firstPaymentDate: z.date(),
  status: z.string().default("active"),
  notes: z.string().optional(),
});

type Installment = z.infer<typeof installmentFormSchema> & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  email?: string;
};

type Invoice = {
  id: number;
  invoiceNumber: string;
  customerId: number;
  totalAmount: number;
  status: string;
};

type InstallmentPayment = {
  id: number;
  installmentId: number;
  amount: number;
  paymentDate: string;
  notes?: string;
};

export default function InstallmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<InstallmentPayment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // التحقق من دخول المستخدم
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // نموذج إضافة تقسيط جديد
  const installmentForm = useForm<z.infer<typeof installmentFormSchema>>({
    resolver: zodResolver(installmentFormSchema),
    defaultValues: {
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      installmentCount: 1,
      installmentAmount: 0,
      status: "active",
      firstPaymentDate: new Date(),
      notes: "",
    },
  });

  // نموذج إضافة دفعة جديدة
  const paymentFormSchema = z.object({
    amount: z.number().min(1, "يجب إدخال المبلغ"),
    paymentDate: z.date(),
    notes: z.string().optional(),
  });

  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date(),
      notes: "",
    },
  });

  // استعلام للحصول على قائمة العملاء
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await axios.get("/api/customers");
      return response.data;
    },
  });

  // استعلام للحصول على قائمة الفواتير
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await axios.get("/api/invoices");
      return response.data.data || [];
    },
  });

  // استعلام للحصول على التقسيطات
  const { data: installments = [], isLoading } = useQuery<Installment[]>({
    queryKey: ["installments"],
    queryFn: async () => {
      const response = await axios.get("/api/installments");
      return response.data;
    },
  });

  // استعلام للحصول على مدفوعات التقسيط
  const { data: payments = [] } = useQuery<InstallmentPayment[]>({
    queryKey: ["installment-payments", selectedInstallment?.id],
    queryFn: async () => {
      if (!selectedInstallment) return [];
      const response = await axios.get(`/api/installment-payments/${selectedInstallment.id}`);
      return response.data;
    },
    enabled: !!selectedInstallment,
  });

  // حساب المبلغ المتبقي عند تغيير المبلغ الإجمالي أو المبلغ المدفوع
  useEffect(() => {
    const totalAmount = installmentForm.watch("totalAmount") || 0;
    const paidAmount = installmentForm.watch("paidAmount") || 0;
    installmentForm.setValue("remainingAmount", totalAmount - paidAmount);
    
    // حساب مبلغ القسط
    const installmentCount = installmentForm.watch("installmentCount") || 1;
    if (installmentCount > 0) {
      installmentForm.setValue("installmentAmount", (totalAmount - paidAmount) / installmentCount);
    }
  }, [
    installmentForm.watch("totalAmount"),
    installmentForm.watch("paidAmount"),
    installmentForm.watch("installmentCount"),
  ]);

  // إضافة تقسيط جديد
  const addInstallmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof installmentFormSchema>) => {
      const response = await axios.post("/api/installments", data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة التقسيط بنجاح",
        variant: "default",
      });
      installmentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ أثناء إضافة التقسيط",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // تحديث تقسيط
  const updateInstallmentMutation = useMutation({
    mutationFn: async (data: Partial<Installment>) => {
      const response = await axios.put(`/api/installments/${selectedInstallment?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث التقسيط بنجاح",
        variant: "default",
      });
      setSelectedInstallment(null);
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ أثناء تحديث التقسيط",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // حذف تقسيط
  const deleteInstallmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/installments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "تم حذف التقسيط بنجاح",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ أثناء حذف التقسيط",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // إضافة دفعة جديدة
  const addPaymentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentFormSchema>) => {
      if (!selectedInstallment) throw new Error("لم يتم تحديد التقسيط");
      const paymentData = {
        ...data,
        installmentId: selectedInstallment.id,
      };
      const response = await axios.post("/api/installment-payments", paymentData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الدفعة بنجاح",
        variant: "default",
      });
      paymentForm.reset();
      setShowPaymentDialog(false);
      queryClient.invalidateQueries({ queryKey: ["installment-payments", selectedInstallment?.id] });
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ أثناء إضافة الدفعة",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // حذف دفعة
  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/installment-payments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الدفعة بنجاح",
        variant: "default",
      });
      setSelectedPayment(null);
      queryClient.invalidateQueries({ queryKey: ["installment-payments", selectedInstallment?.id] });
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
    onError: (error: any) => {
      toast({
        title: "حدث خطأ أثناء حذف الدفعة",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // تصفية التقسيطات حسب الحالة
  const filteredInstallments = installments.filter((installment) => {
    if (activeTab === "all") return true;
    return installment.status === activeTab;
  });

  // طباعة التقرير
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  // العثور على اسم العميل
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "غير معروف";
  };

  // حساب إجمالي المدفوعات لتقسيط معين
  const getTotalPayments = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">إدارة التقسيط</h1>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">جميع التقسيطات</TabsTrigger>
            <TabsTrigger value="active">نشط</TabsTrigger>
            <TabsTrigger value="completed">مكتمل</TabsTrigger>
            <TabsTrigger value="overdue">متأخر</TabsTrigger>
          </TabsList>

          <Dialog>
            <DialogTrigger asChild>
              <Button>إضافة تقسيط جديد</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>إضافة تقسيط جديد</DialogTitle>
                <DialogDescription>أدخل بيانات التقسيط الجديد</DialogDescription>
              </DialogHeader>

              <Form {...installmentForm}>
                <form
                  onSubmit={installmentForm.handleSubmit((data) =>
                    addInstallmentMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={installmentForm.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العميل</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر العميل" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem
                                key={customer.id}
                                value={customer.id.toString()}
                              >
                                {customer.name} - {customer.phone || "بدون رقم"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={installmentForm.control}
                    name="invoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفاتورة (اختياري)</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الفاتورة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">بدون فاتورة</SelectItem>
                            {invoices.map((invoice) => (
                              <SelectItem
                                key={invoice.id}
                                value={invoice.id.toString()}
                              >
                                {invoice.invoiceNumber} - {getCustomerName(invoice.customerId)} - {invoice.totalAmount} $
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={installmentForm.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المبلغ الإجمالي</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={installmentForm.control}
                      name="paidAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المبلغ المدفوع مقدماً</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={installmentForm.control}
                    name="remainingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ المتبقي</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={installmentForm.control}
                      name="installmentCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عدد الأقساط</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={installmentForm.control}
                      name="installmentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مبلغ القسط</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={installmentForm.control}
                    name="firstPaymentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>تاريخ أول دفعة</FormLabel>
                        <FormControl>
                          <div className="border rounded-md p-2">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ar}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={installmentForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={addInstallmentMutation.isPending}>
                      {addInstallmentMutation.isPending ? "جارٍ الإضافة..." : "إضافة التقسيط"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">جارٍ التحميل...</div>
          ) : filteredInstallments.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>لا توجد تقسيطات</AlertTitle>
              <AlertDescription>
                لم يتم العثور على أي تقسيطات. يمكنك إضافة تقسيط جديد من خلال الزر أعلاه.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>قائمة التقسيطات</CardTitle>
                <CardDescription>
                  عرض جميع التقسيطات المسجلة في النظام.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الرقم</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ الإجمالي</TableHead>
                      <TableHead>المبلغ المتبقي</TableHead>
                      <TableHead>عدد الأقساط</TableHead>
                      <TableHead>قيمة القسط</TableHead>
                      <TableHead>تاريخ البدء</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.id}</TableCell>
                        <TableCell>{getCustomerName(installment.customerId)}</TableCell>
                        <TableCell>${installment.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>${installment.remainingAmount.toFixed(2)}</TableCell>
                        <TableCell>{installment.installmentCount}</TableCell>
                        <TableCell>${installment.installmentAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(installment.firstPaymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              installment.status === "active"
                                ? "default"
                                : installment.status === "completed"
                                ? "success"
                                : "destructive"
                            }
                          >
                            {installment.status === "active"
                              ? "نشط"
                              : installment.status === "completed"
                              ? "مكتمل"
                              : "متأخر"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInstallment(installment);
                                setShowPaymentDialog(true);
                              }}
                            >
                              إضافة دفعة
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedInstallment(installment);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                if (window.confirm("هل أنت متأكد من حذف هذا التقسيط؟")) {
                                  deleteInstallmentMutation.mutate(installment.id);
                                }
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {/* نفس محتوى علامة التبويب "all" ولكن مع filteredInstallments */}
          {isLoading ? (
            <div className="text-center py-4">جارٍ التحميل...</div>
          ) : filteredInstallments.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>لا توجد تقسيطات نشطة</AlertTitle>
              <AlertDescription>
                لم يتم العثور على أي تقسيطات نشطة. يمكنك إضافة تقسيط جديد من خلال الزر أعلاه.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>قائمة التقسيطات النشطة</CardTitle>
                <CardDescription>
                  عرض جميع التقسيطات النشطة في النظام.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الرقم</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ الإجمالي</TableHead>
                      <TableHead>المبلغ المتبقي</TableHead>
                      <TableHead>عدد الأقساط</TableHead>
                      <TableHead>قيمة القسط</TableHead>
                      <TableHead>تاريخ البدء</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.id}</TableCell>
                        <TableCell>{getCustomerName(installment.customerId)}</TableCell>
                        <TableCell>${installment.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>${installment.remainingAmount.toFixed(2)}</TableCell>
                        <TableCell>{installment.installmentCount}</TableCell>
                        <TableCell>${installment.installmentAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(installment.firstPaymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInstallment(installment);
                                setShowPaymentDialog(true);
                              }}
                            >
                              إضافة دفعة
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedInstallment(installment);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {/* نفس محتوى علامة التبويب "active" ولكن للتقسيطات المكتملة */}
          {isLoading ? (
            <div className="text-center py-4">جارٍ التحميل...</div>
          ) : filteredInstallments.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>لا توجد تقسيطات مكتملة</AlertTitle>
              <AlertDescription>
                لم يتم العثور على أي تقسيطات مكتملة.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>قائمة التقسيطات المكتملة</CardTitle>
                <CardDescription>
                  عرض جميع التقسيطات المكتملة في النظام.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الرقم</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ الإجمالي</TableHead>
                      <TableHead>المبلغ المدفوع</TableHead>
                      <TableHead>عدد الأقساط</TableHead>
                      <TableHead>تاريخ الاكتمال</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.id}</TableCell>
                        <TableCell>{getCustomerName(installment.customerId)}</TableCell>
                        <TableCell>${installment.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>${(installment.totalAmount - installment.remainingAmount).toFixed(2)}</TableCell>
                        <TableCell>{installment.installmentCount}</TableCell>
                        <TableCell>
                          {new Date(installment.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setTimeout(handlePrint, 100);
                            }}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {/* نفس محتوى علامة التبويب "active" ولكن للتقسيطات المتأخرة */}
          {isLoading ? (
            <div className="text-center py-4">جارٍ التحميل...</div>
          ) : filteredInstallments.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>لا توجد تقسيطات متأخرة</AlertTitle>
              <AlertDescription>
                لم يتم العثور على أي تقسيطات متأخرة.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>قائمة التقسيطات المتأخرة</CardTitle>
                <CardDescription>
                  عرض جميع التقسيطات المتأخرة في النظام.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الرقم</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ الإجمالي</TableHead>
                      <TableHead>المبلغ المتبقي</TableHead>
                      <TableHead>عدد الأقساط</TableHead>
                      <TableHead>قيمة القسط</TableHead>
                      <TableHead>تاريخ البدء</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstallments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>{installment.id}</TableCell>
                        <TableCell>{getCustomerName(installment.customerId)}</TableCell>
                        <TableCell>${installment.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>${installment.remainingAmount.toFixed(2)}</TableCell>
                        <TableCell>{installment.installmentCount}</TableCell>
                        <TableCell>${installment.installmentAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(installment.firstPaymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInstallment(installment);
                                setShowPaymentDialog(true);
                              }}
                            >
                              إضافة دفعة
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedInstallment(installment);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* نافذة إضافة دفعة */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>إضافة دفعة جديدة</DialogTitle>
            <DialogDescription>
              {selectedInstallment
                ? `إضافة دفعة للتقسيط الخاص بـ ${getCustomerName(selectedInstallment.customerId)}`
                : "إضافة دفعة"}
            </DialogDescription>
          </DialogHeader>

          <Form {...paymentForm}>
            <form
              onSubmit={paymentForm.handleSubmit((data) =>
                addPaymentMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ الدفع</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-2">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ar}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={addPaymentMutation.isPending}>
                  {addPaymentMutation.isPending ? "جارٍ الإضافة..." : "إضافة الدفعة"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* نافذة عرض تفاصيل التقسيط */}
      <Sheet
        open={!!selectedInstallment && !showPaymentDialog}
        onOpenChange={(open) => !open && setSelectedInstallment(null)}
      >
        <SheetContent className="w-[400px] sm:max-w-[550px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>تفاصيل التقسيط</SheetTitle>
            <SheetDescription>
              عرض تفاصيل التقسيط والمدفوعات
            </SheetDescription>
          </SheetHeader>

          {selectedInstallment && (
            <>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">العميل</h3>
                    <p>{getCustomerName(selectedInstallment.customerId)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">إجمالي المبلغ</h3>
                    <p>${selectedInstallment.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">المبلغ المدفوع</h3>
                    <p>${(selectedInstallment.totalAmount - selectedInstallment.remainingAmount).toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">المبلغ المتبقي</h3>
                    <p>${selectedInstallment.remainingAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">عدد الأقساط</h3>
                    <p>{selectedInstallment.installmentCount}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">قيمة القسط</h3>
                    <p>${selectedInstallment.installmentAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">تاريخ البدء</h3>
                    <p>{new Date(selectedInstallment.firstPaymentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">الحالة</h3>
                    <Badge
                      variant={
                        selectedInstallment.status === "active"
                          ? "default"
                          : selectedInstallment.status === "completed"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {selectedInstallment.status === "active"
                        ? "نشط"
                        : selectedInstallment.status === "completed"
                        ? "مكتمل"
                        : "متأخر"}
                    </Badge>
                  </div>
                </div>

                {selectedInstallment.notes && (
                  <div>
                    <h3 className="font-semibold">ملاحظات</h3>
                    <p>{selectedInstallment.notes}</p>
                  </div>
                )}

                <div className="pt-4">
                  <h3 className="font-semibold text-lg mb-2">سجل المدفوعات</h3>
                  {payments.length === 0 ? (
                    <p className="text-muted-foreground">لم يتم تسجيل أي مدفوعات بعد.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">المبلغ</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead className="text-right">إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  if (window.confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
                                    deletePaymentMutation.mutate(payment.id);
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <div className="py-2">
                  <p className="font-semibold">
                    إجمالي المدفوعات: ${getTotalPayments().toFixed(2)}
                  </p>
                  <p className="font-semibold">
                    المبلغ المتبقي: ${(selectedInstallment.remainingAmount - getTotalPayments()).toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPaymentDialog(true);
                    }}
                  >
                    إضافة دفعة
                  </Button>
                  <Button onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    طباعة التقرير
                  </Button>
                </div>

                {selectedInstallment.status === "active" && (
                  <div className="pt-4">
                    <Button
                      className="w-full"
                      variant="default"
                      onClick={() => {
                        if (window.confirm("هل أنت متأكد من تغيير حالة التقسيط إلى مكتمل؟")) {
                          updateInstallmentMutation.mutate({
                            status: "completed",
                            remainingAmount: 0,
                          });
                        }
                      }}
                    >
                      تعيين كمكتمل
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* قسم الطباعة */}
      <div className="hidden">
        <div ref={printRef} className="p-8">
          {selectedInstallment && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">تقرير التقسيط</h1>
                <p className="text-muted-foreground">
                  {format(new Date(), "yyyy/MM/dd", { locale: ar })}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">معلومات العميل</h2>
                <p>الاسم: {getCustomerName(selectedInstallment.customerId)}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">تفاصيل التقسيط</h2>
                <div className="grid grid-cols-2 gap-4">
                  <p>إجمالي المبلغ: ${selectedInstallment.totalAmount.toFixed(2)}</p>
                  <p>المبلغ المدفوع: ${(selectedInstallment.totalAmount - selectedInstallment.remainingAmount).toFixed(2)}</p>
                  <p>المبلغ المتبقي: ${selectedInstallment.remainingAmount.toFixed(2)}</p>
                  <p>عدد الأقساط: {selectedInstallment.installmentCount}</p>
                  <p>قيمة القسط: ${selectedInstallment.installmentAmount.toFixed(2)}</p>
                  <p>تاريخ البدء: {new Date(selectedInstallment.firstPaymentDate).toLocaleDateString()}</p>
                  <p>الحالة: {selectedInstallment.status === "active"
                    ? "نشط"
                    : selectedInstallment.status === "completed"
                    ? "مكتمل"
                    : "متأخر"}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">سجل المدفوعات</h2>
                {payments.length === 0 ? (
                  <p>لم يتم تسجيل أي مدفوعات بعد.</p>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2">المبلغ</th>
                        <th className="border p-2">التاريخ</th>
                        <th className="border p-2">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="border p-2">${payment.amount.toFixed(2)}</td>
                          <td className="border p-2">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="border p-2">{payment.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="mt-6">
                <p className="font-bold">إجمالي المدفوعات: ${getTotalPayments().toFixed(2)}</p>
                <p className="font-bold">المبلغ المتبقي: ${(selectedInstallment.remainingAmount - getTotalPayments()).toFixed(2)}</p>
              </div>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>تم إنشاء هذا التقرير بواسطة نظام إدارة المتجر</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
