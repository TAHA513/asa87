import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Plus, CheckCircle, XCircle, Clock, Filter, Search } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { type Appointment, type Customer, insertAppointmentSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

type AppointmentStatus = "scheduled" | "completed" | "cancelled";

type NewAppointmentForm = {
  title: string;
  description: string | null;
  customerId: number;
  date: Date;
  duration: number;
  notes: string | null;
};

const statusIcons: Record<AppointmentStatus, JSX.Element> = {
  scheduled: <Clock className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusText: Record<AppointmentStatus, string> = {
  scheduled: "قيد الانتظار",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(new Date().setDate(1)), // أول يوم من الشهر الحالي
    endDate: new Date()
  });

  const appointmentForm = useForm<NewAppointmentForm>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      title: "",
      description: "",
      customerId: 0,
      date: new Date(),
      duration: 30,
      notes: "",
    },
  });

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    refetchOnWindowFocus: false,
  });

  const { data: appointmentsReport, isLoading: isReportLoading } = useQuery({
    queryKey: [
      "/api/reports/appointments",
      reportDateRange.startDate,
      reportDateRange.endDate
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: reportDateRange.startDate.toISOString(),
        endDate: reportDateRange.endDate.toISOString()
      });
      const res = await fetch(`/api/reports/appointments?${params}`);
      if (!res.ok) throw new Error("فشل في جلب تقرير المواعيد");
      return res.json();
    },
    enabled: !!reportDateRange.startDate && !!reportDateRange.endDate
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: NewAppointmentForm) => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الموعد بنجاح",
        variant: "default",
      });
      setIsNewAppointmentOpen(false);
      appointmentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء الموعد",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: AppointmentStatus }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث حالة الموعد",
        variant: "default",
      });
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث حالة الموعد",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الموعد بنجاح",
        variant: "default",
      });
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف الموعد",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitAppointment = (data: NewAppointmentForm) => {
    createAppointmentMutation.mutate(data);
  };

  const handleStatusChange = (id: number, status: AppointmentStatus) => {
    updateAppointmentMutation.mutate({ id, status });
  };

  const handleDeleteAppointment = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الموعد؟")) {
      deleteAppointmentMutation.mutate(id);
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || "عميل غير معروف";
  };

  const filteredAppointments = appointments.filter(appointment => {
    // تصفية حسب الحالة
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }
    // تصفية حسب البحث
    if (searchQuery && !appointment.title.includes(searchQuery)) {
      return false;
    }
    return true;
  });

  const selectedDateAppointments = filteredAppointments.filter(
    (appointment) =>
      format(new Date(appointment.date), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );


  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">المواعيد</h1>
        </div>

        <div className="flex items-center gap-4">
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة موعد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>إضافة موعد جديد</DialogTitle>
              </DialogHeader>

              <Form {...appointmentForm}>
                <form
                  onSubmit={appointmentForm.handleSubmit(onSubmitAppointment)}
                  className="space-y-2"
                >
                  <FormField
                    control={appointmentForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الموعد</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="أدخل عنوان الموعد" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={appointmentForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="أدخل وصف الموعد"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={appointmentForm.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العميل</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value ? String(field.value) : undefined}
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
                                value={String(customer.id)}
                              >
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={appointmentForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>تاريخ الموعد</FormLabel>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ar}
                          className="rounded-md border"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={appointmentForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدة (بالدقائق)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={appointmentForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="أدخل ملاحظات إضافية"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={createAppointmentMutation.isPending}>
                      {createAppointmentMutation.isPending ? "جاري الإضافة..." : "إضافة الموعد"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">التقويم</TabsTrigger>
          <TabsTrigger value="list">قائمة المواعيد</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>التقويم</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  className="rounded-md border"
                  locale={ar}
                />
              </CardContent>
              <CardFooter>
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>تصفية حسب الحالة:</span>
                  </div>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الحالات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="scheduled">قيد الانتظار</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Search className="h-4 w-4" />
                    <span>بحث:</span>
                  </div>
                  <Input 
                    placeholder="ابحث عن موعد..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  مواعيد {format(selectedDate, "yyyy/MM/dd", { locale: ar })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-4">جاري التحميل...</div>
                  ) : selectedDateAppointments.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      لا توجد مواعيد لهذا اليوم
                    </div>
                  ) : (
                    selectedDateAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-start gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge className={statusColors[appointment.status as AppointmentStatus]}>
                                    {statusIcons[appointment.status as AppointmentStatus]}
                                    <span className="ml-1">{statusText[appointment.status as AppointmentStatus]}</span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  حالة الموعد: {statusText[appointment.status as AppointmentStatus]}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div>
                              <h3 className="font-medium">{appointment.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.date), "hh:mm a", { locale: ar })}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Badge variant="outline">
                              {getCustomerName(appointment.customerId)}
                            </Badge>
                          </div>
                        </div>
                        {appointment.description && (
                          <p className="text-sm mb-3">{appointment.description}</p>
                        )}
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-sm text-muted-foreground">
                            المدة: {appointment.duration} دقيقة
                          </span>
                          <div className="flex gap-2">
                            {appointment.status === "scheduled" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleStatusChange(appointment.id, "completed")}
                                >
                                  <CheckCircle className="h-4 w-4 ml-1" />
                                  إكمال
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleStatusChange(appointment.id, "cancelled")}
                                >
                                  <XCircle className="h-4 w-4 ml-1" />
                                  إلغاء
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-100"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-right">العنوان</th>
                  <th className="p-2 text-right">العميل</th>
                  <th className="p-2 text-right">التاريخ</th>
                  <th className="p-2 text-right">المدة</th>
                  <th className="p-2 text-right">الحالة</th>
                  <th className="p-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      لا توجد مواعيد
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{appointment.title}</td>
                      <td className="p-2">{getCustomerName(appointment.customerId)}</td>
                      <td className="p-2">
                        {format(new Date(appointment.date), "yyyy/MM/dd", { locale: ar })}
                      </td>
                      <td className="p-2">{appointment.duration} دقيقة</td>
                      <td className="p-2">
                        <Badge className={statusColors[appointment.status as AppointmentStatus]}>
                          {statusText[appointment.status as AppointmentStatus]}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 justify-end">
                          {appointment.status === "scheduled" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleStatusChange(appointment.id, "completed")}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleStatusChange(appointment.id, "cancelled")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-100"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            حذف
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {isReportLoading ? (
              <div className="col-span-3 text-center py-8">جاري تحميل التحليلات...</div>
            ) : appointmentsReport ? (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {appointmentsReport.summary?.totalAppointments || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      إجمالي المواعيد
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {appointmentsReport.summary?.completedAppointments || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      المواعيد المكتملة
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {appointmentsReport.summary?.cancelledAppointments || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      المواعيد الملغاة
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-3 text-center py-8">لا توجد بيانات للتحليل</div>
            )}
          </div>

          {appointmentsReport?.statusDistribution && (
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات المواعيد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentsReport.statusDistribution}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar
                        dataKey="value"
                        fill="var(--primary)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}