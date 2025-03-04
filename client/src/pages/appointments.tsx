import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Appointment, type Customer, insertAppointmentSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

type NewAppointmentForm = {
  title: string;
  description: string;
  customerId: number;
  date: Date;
  duration: number;
  notes: string;
};

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const { toast } = useToast();

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
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: NewAppointmentForm) => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "فشل في إنشاء الموعد");
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
    onError: (error: Error) => {
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

  const selectedDateAppointments = appointments.filter(
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
                        <Input {...field} />
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
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر العميل" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer: Customer) => (
                            <SelectItem
                              key={customer.id}
                              value={customer.id.toString()}
                            >
                              {customer.name} - {customer.phone}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={appointmentForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التاريخ</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-2">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            className="w-full"
                          />
                        </div>
                      </FormControl>
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
                          min="1"
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={createAppointmentMutation.isPending}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:max-w-sm">
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
        </Card>

        <Card>
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
                    className="p-4 border rounded-lg hover:bg-secondary/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{appointment.title}</h4>
                        {appointment.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {appointment.description}
                          </p>
                        )}
                        <p className="text-sm mt-1">
                          {customers.find((c: Customer) => c.id === appointment.customerId)?.name}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(appointment.date), "p", { locale: ar })}
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}