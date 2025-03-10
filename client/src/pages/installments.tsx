import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { Loader2, FileText, Plus, Trash } from "lucide-react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";

// إضافة مكونات الحوار المفقودة يدويًا
const DialogDescription = ({ children, className }) => (
  <div className={`text-sm text-muted-foreground ${className || ''}`}>{children}</div>
);

const DialogFooter = ({ children, className }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}>{children}</div>
);

export default function Installments() {
  const [location, setLocation] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const printRef = useRef(null);

  // حالة التطبيق
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // معلومات التقسيط
  const { data: installments, isLoading } = useQuery({
    queryKey: ["installments"],
    queryFn: async () => {
      const response = await axios.get("/api/installments");
      return response.data;
    },
  });

  // معلومات دفعات التقسيط
  const { data: payments, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["installment-payments", selectedInstallment?.id],
    queryFn: async () => {
      if (!selectedInstallment) return [];
      const response = await axios.get(`/api/installment-payments?installmentId=${selectedInstallment.id}`);
      return response.data;
    },
    enabled: !!selectedInstallment,
  });

  // نموذج الدفع
  const paymentForm = {
    amount: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    reset: function() {
      this.amount = "";
      this.paymentDate = format(new Date(), "yyyy-MM-dd");
      this.notes = "";
    }
  };

  // استدعاء طباعة التقرير
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  // الحصول على اسم العميل
  function getCustomerName(installment) {
    return installment?.customerName || "عميل غير معروف";
  }

  // إنشاء تقسيط جديد
  const createInstallmentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/installments", data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء التقسيط بنجاح",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ أثناء إنشاء التقسيط",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // تحديث تقسيط
  const updateInstallmentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(`/api/installments/${selectedInstallment.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث التقسيط بنجاح",
        variant: "default",
      });
      setShowDetails(false);
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ أثناء تحديث التقسيط",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // إضافة دفعة
  const addPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
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
    onError: (error) => {
      toast({
        title: "حدث خطأ أثناء إضافة الدفعة",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // حذف دفعة
  const deletePaymentMutation = useMutation({
    mutationFn: async (id) => {
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
    onError: (error) => {
      toast({
        title: "حدث خطأ أثناء حذف الدفعة",
        description: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center px-4 border-b bg-white">
          <h1 className="text-lg font-semibold">إدارة التقسيط</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>إجمالي التقسيط</CardTitle>
                <CardDescription>إجمالي المبلغ المتبقي في جميع التقسيطات النشطة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>
                      {installments
                        ?.filter(i => i.status === "active")
                        .reduce((sum, i) => sum + i.remainingAmount, 0)
                        .toLocaleString()}{" "}
                      د.ع
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>التقسيطات النشطة</CardTitle>
                <CardDescription>عدد التقسيطات التي لم يتم سدادها بالكامل</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>{installments?.filter(i => i.status === "active").length}</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>التقسيطات المكتملة</CardTitle>
                <CardDescription>عدد التقسيطات التي تم سدادها بالكامل</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>{installments?.filter(i => i.status === "completed").length}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">قائمة التقسيطات</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    تقسيط جديد
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>إضافة تقسيط جديد</SheetTitle>
                    <SheetDescription>أدخل معلومات التقسيط الجديد.</SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">اسم العميل</Label>
                      <Input id="customerName" placeholder="أدخل اسم العميل" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="totalAmount">المبلغ الكلي</Label>
                      <Input id="totalAmount" type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="initialPayment">الدفعة الأولى</Label>
                      <Input id="initialPayment" type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installmentPeriod">فترة التقسيط (بالأشهر)</Label>
                      <Input id="installmentPeriod" type="number" placeholder="3" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">ملاحظات</Label>
                      <Input id="notes" placeholder="أي ملاحظات إضافية" />
                    </div>

                    <Button
                      onClick={() => {
                        const customerName = document.getElementById("customerName").value;
                        const totalAmount = parseFloat(document.getElementById("totalAmount").value);
                        const initialPayment = parseFloat(document.getElementById("initialPayment").value) || 0;
                        const installmentPeriod = parseInt(document.getElementById("installmentPeriod").value);
                        const notes = document.getElementById("notes").value;

                        if (!customerName || isNaN(totalAmount) || isNaN(installmentPeriod) || installmentPeriod <= 0) {
                          toast({
                            title: "بيانات غير صالحة",
                            description: "يرجى التأكد من إدخال اسم العميل والمبلغ الكلي وفترة التقسيط بشكل صحيح",
                            variant: "destructive",
                          });
                          return;
                        }

                        createInstallmentMutation.mutate({
                          customerName,
                          totalAmount,
                          initialPayment,
                          remainingAmount: totalAmount - initialPayment,
                          installmentPeriod,
                          startDate: new Date().toISOString(),
                          status: "active",
                          notes,
                        });
                      }}
                    >
                      إنشاء التقسيط
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">التقسيطات النشطة</TabsTrigger>
                <TabsTrigger value="completed">التقسيطات المكتملة</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ الكلي</TableHead>
                      <TableHead>المبلغ المتبقي</TableHead>
                      <TableHead>تاريخ البدء</TableHead>
                      <TableHead>فترة التقسيط</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : installments?.filter(i => i.status === "active").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          لا توجد تقسيطات نشطة
                        </TableCell>
                      </TableRow>
                    ) : (
                      installments
                        ?.filter(i => i.status === "active")
                        .map(installment => (
                          <TableRow key={installment.id}>
                            <TableCell>{getCustomerName(installment)}</TableCell>
                            <TableCell>{installment.totalAmount.toLocaleString()} د.ع</TableCell>
                            <TableCell>{installment.remainingAmount.toLocaleString()} د.ع</TableCell>
                            <TableCell>
                              {format(new Date(installment.startDate), "yyyy/MM/dd", { locale: ar })}
                            </TableCell>
                            <TableCell>{installment.installmentPeriod} شهر</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInstallment(installment);
                                    setShowDetails(true);
                                  }}
                                >
                                  عرض التفاصيل
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="completed">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ الكلي</TableHead>
                      <TableHead>تاريخ البدء</TableHead>
                      <TableHead>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : installments?.filter(i => i.status === "completed").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          لا توجد تقسيطات مكتملة
                        </TableCell>
                      </TableRow>
                    ) : (
                      installments
                        ?.filter(i => i.status === "completed")
                        .map(installment => (
                          <TableRow key={installment.id}>
                            <TableCell>{getCustomerName(installment)}</TableCell>
                            <TableCell>{installment.totalAmount.toLocaleString()} د.ع</TableCell>
                            <TableCell>
                              {format(new Date(installment.startDate), "yyyy/MM/dd", { locale: ar })}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInstallment(installment);
                                    setShowDetails(true);
                                  }}
                                >
                                  عرض التفاصيل
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* تفاصيل التقسيط */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>تفاصيل التقسيط</SheetTitle>
          </SheetHeader>
          {selectedInstallment && (
            <>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">العميل</p>
                    <p>{getCustomerName(selectedInstallment)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">تاريخ البدء</p>
                    <p>
                      {format(new Date(selectedInstallment.startDate), "yyyy/MM/dd", {
                        locale: ar,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">المبلغ الكلي</p>
                    <p>{selectedInstallment.totalAmount.toLocaleString()} د.ع</p>
                  </div>
                  {selectedInstallment.status === "active" && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">المبلغ المتبقي</p>
                      <p>{selectedInstallment.remainingAmount.toLocaleString()} د.ع</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">فترة التقسيط</p>
                    <p>{selectedInstallment.installmentPeriod} شهر</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">الحالة</p>
                    <p>
                      {selectedInstallment.status === "active" ? (
                        <span className="text-blue-600">نشط</span>
                      ) : (
                        <span className="text-green-600">مكتمل</span>
                      )}
                    </p>
                  </div>
                </div>

                {selectedInstallment.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">ملاحظات</p>
                    <p className="text-sm text-muted-foreground">{selectedInstallment.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">دفعات التقسيط</h3>
                    {selectedInstallment.status === "active" && (
                      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" /> إضافة دفعة
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>إضافة دفعة جديدة</DialogTitle>
                            <DialogDescription>
                              أدخل تفاصيل الدفعة الجديدة للتقسيط.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="payment-amount">المبلغ</Label>
                              <Input
                                id="payment-amount"
                                type="number"
                                placeholder="0"
                                value={paymentForm.amount}
                                onChange={(e) => paymentForm.amount = e.target.value}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="payment-date">تاريخ الدفع</Label>
                              <Input
                                id="payment-date"
                                type="date"
                                value={paymentForm.paymentDate}
                                onChange={(e) => paymentForm.paymentDate = e.target.value}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="payment-notes">ملاحظات</Label>
                              <Input
                                id="payment-notes"
                                placeholder="ملاحظات إضافية"
                                value={paymentForm.notes}
                                onChange={(e) => paymentForm.notes = e.target.value}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                const amount = parseFloat(paymentForm.amount);
                                if (isNaN(amount) || amount <= 0) {
                                  toast({
                                    title: "المبلغ غير صالح",
                                    description: "يرجى إدخال مبلغ صالح أكبر من الصفر",
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                if (amount > selectedInstallment.remainingAmount) {
                                  toast({
                                    title: "المبلغ أكبر من المتبقي",
                                    description: `المبلغ المتبقي هو ${selectedInstallment.remainingAmount.toLocaleString()} د.ع`,
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                addPaymentMutation.mutate({
                                  installmentId: selectedInstallment.id,
                                  amount,
                                  paymentDate: new Date(paymentForm.paymentDate).toISOString(),
                                  notes: paymentForm.notes,
                                });
                              }}
                            >
                              إضافة الدفعة
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {isPaymentsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : payments?.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">لا توجد دفعات مسجلة</p>
                  ) : (
                    <div className="space-y-2">
                      {payments?.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center border rounded-md p-2">
                          <div>
                            <p className="font-medium">{payment.amount.toLocaleString()} د.ع</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.paymentDate), "yyyy/MM/dd", {
                                locale: ar,
                              })}
                            </p>
                            {payment.notes && <p className="text-xs">{payment.notes}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
                                deletePaymentMutation.mutate(payment.id);
                              }
                            }}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" /> طباعة
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
                <p>الاسم: {getCustomerName(selectedInstallment)}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">تفاصيل التقسيط</h2>
                <div className="grid grid-cols-2 gap-2">
                  <p>المبلغ الكلي: {selectedInstallment.totalAmount.toLocaleString()} د.ع</p>
                  <p>المبلغ المتبقي: {selectedInstallment.remainingAmount.toLocaleString()} د.ع</p>
                  <p>
                    تاريخ البدء:{" "}
                    {format(new Date(selectedInstallment.startDate), "yyyy/MM/dd", { locale: ar })}
                  </p>
                  <p>فترة التقسيط: {selectedInstallment.installmentPeriod} شهر</p>
                  <p>
                    الحالة:{" "}
                    {selectedInstallment.status === "active" ? "نشط" : "مكتمل"}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">دفعات التقسيط</h2>
                {payments?.length === 0 ? (
                  <p>لا توجد دفعات مسجلة</p>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 text-right">التاريخ</th>
                        <th className="border border-gray-300 p-2 text-right">المبلغ</th>
                        <th className="border border-gray-300 p-2 text-right">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments?.map((payment) => (
                        <tr key={payment.id}>
                          <td className="border border-gray-300 p-2">
                            {format(new Date(payment.paymentDate), "yyyy/MM/dd", {
                              locale: ar,
                            })}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {payment.amount.toLocaleString()} د.ع
                          </td>
                          <td className="border border-gray-300 p-2">{payment.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}