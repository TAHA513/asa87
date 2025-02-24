import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, UserRound, FileText, Calendar, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { type Customer, type Appointment, insertAppointmentSchema } from "@shared/schema";
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
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type NewAppointmentForm = {
  title: string;
  description?: string;
  date: Date;
  duration: number;
  notes?: string;
};

export default function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const { toast } = useToast();

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

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/customers?${params.toString()}`);
      if (!res.ok) {
        throw new Error("فشل في جلب قائمة العملاء");
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    queryFn: async () => {
      const res = await fetch("/api/appointments");
      if (!res.ok) {
        throw new Error("فشل في جلب المواعيد");
      }
      return res.json();
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: NewAppointmentForm) => {
      if (!selectedCustomer?.id) throw new Error("لم يتم اختيار العميل");
      const res = await fetch(`/api/customers/${selectedCustomer.id}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("فشل في إنشاء الموعد");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "تم إنشاء الموعد بنجاح",
        description: "تم إضافة الموعد الجديد إلى جدول المواعيد",
      });
      setIsNewAppointmentOpen(false);
      appointmentForm.reset();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitAppointment = (data: NewAppointmentForm) => {
    createAppointmentMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-6 w-6" />
          <h1 className="text-2xl font-bold">المواعيد والحجوزات</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن العملاء..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة موعد جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة موعد جديد</DialogTitle>
              </DialogHeader>

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">اختر العميل</h3>
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className={cn(
                        "p-2 border rounded cursor-pointer hover:bg-secondary/50",
                        selectedCustomer?.id === customer.id && "bg-secondary"
                      )}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="font-medium">{customer.name}</div>
                      {customer.phone && (
                        <div className="text-sm text-muted-foreground">
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Form {...appointmentForm}>
                <form onSubmit={appointmentForm.handleSubmit(onSubmitAppointment)} className="space-y-4">
                  <FormField
                    control={appointmentForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الموعد</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={appointmentForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>التاريخ والوقت</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-right font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ar })
                                ) : (
                                  <span>اختر تاريخ</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                          <Input {...field} type="number" min="1" />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createAppointmentMutation.isPending || !selectedCustomer}
                  >
                    {createAppointmentMutation.isPending && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-2" />
                    )}
                    إضافة الموعد
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* المواعيد والحجوزات */}
        <Card className="col-span-12">
          <CardHeader>
            <CardTitle>جميع المواعيد والحجوزات</CardTitle>
            <CardDescription>
              {appointments.length} موعد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{appointment.title}</h4>
                      {appointment.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(appointment.date), "PPP", { locale: ar })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>المدة: {appointment.duration} دقيقة</span>
                    <span className="capitalize">{appointment.status}</span>
                  </div>
                  {appointment.notes && (
                    <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              ))}

              {appointmentsLoading && (
                <div className="text-center py-4 text-muted-foreground">
                  جاري التحميل...
                </div>
              )}

              {!appointmentsLoading && appointments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  لا توجد مواعيد أو حجوزات
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
