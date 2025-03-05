import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, UserRound, FileText, Calendar, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  type Customer,
  type Sale,
  type Appointment,
  insertCustomerSchema,
  insertAppointmentSchema,
} from '@shared/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

// ... (previous type definitions remain the same)

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const { toast } = useToast();

  const customerForm = useForm<NewCustomerForm>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    },
  });

  const appointmentForm = useForm<NewAppointmentForm>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      duration: 30,
      notes: '',
    },
  });

  const { data, isLoading, error } = useQuery<Customer[]>({
    queryKey: ['/api/customers', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await fetch(`/api/customers?${params.toString()}`);
      if (!res.ok) {
        throw new Error('فشل في جلب قائمة العملاء');
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: customerSales = [] } = useQuery<Sale[]>({
    queryKey: ['/api/customers', selectedCustomer?.id, 'sales'],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      const res = await fetch(`/api/customers/${selectedCustomer.id}/sales`);
      if (!res.ok) {
        throw new Error('فشل في جلب مشتريات العميل');
      }
      return res.json();
    },
    enabled: !!selectedCustomer?.id,
  });

  const { data: customerAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/customers', selectedCustomer?.id, 'appointments'],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      const res = await fetch(`/api/customers/${selectedCustomer.id}/appointments`);
      if (!res.ok) {
        throw new Error('فشل في جلب مواعيد العميل');
      }
      return res.json();
    },
    enabled: !!selectedCustomer?.id,
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: NewCustomerForm) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('فشل في إنشاء العميل');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: 'تم إنشاء العميل بنجاح',
        description: 'تم إضافة العميل الجديد إلى قائمة العملاء',
      });
      setIsNewCustomerOpen(false);
      customerForm.reset();
    },
    onError: error => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: NewAppointmentForm) => {
      if (!selectedCustomer?.id) throw new Error('لم يتم اختيار العميل');
      const res = await fetch(`/api/customers/${selectedCustomer.id}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error('فشل في إنشاء الموعد');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/customers', selectedCustomer?.id, 'appointments'],
      });
      toast({
        title: 'تم إنشاء الموعد بنجاح',
        description: 'تم إضافة الموعد الجديد إلى جدول المواعيد',
      });
      setIsNewAppointmentOpen(false);
      appointmentForm.reset();
    },
    onError: error => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // إضافة mutation لحذف العميل
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
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setSelectedCustomer(null);
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف العميل بنجاح',
      });
    },
    onError: error => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في حذف العميل',
        variant: 'destructive',
      });
    },
  });

  const customers = data || [];

  const onSubmitCustomer = (data: NewCustomerForm) => {
    createCustomerMutation.mutate(data);
  };

  const onSubmitAppointment = (data: NewAppointmentForm) => {
    createAppointmentMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <UserRound className="h-6 w-6" />
          <h1 className="text-2xl font-bold">العملاء</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن العملاء..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة عميل جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
              </DialogHeader>

              <Form {...customerForm}>
                <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
                  <FormField
                    control={customerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العميل</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={customerForm.control}
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
                    disabled={createCustomerMutation.isPending}
                  >
                    {createCustomerMutation.isPending && (
                      <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    إضافة العميل
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="ml-2 h-4 w-4" />
                إضافة موعد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة موعد جديد</DialogTitle>
              </DialogHeader>

              <Form {...appointmentForm}>
                <form
                  onSubmit={appointmentForm.handleSubmit(onSubmitAppointment)}
                  className="space-y-4"
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
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-right font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ar })
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
                    disabled={createAppointmentMutation.isPending}
                  >
                    {createAppointmentMutation.isPending && (
                      <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                    إضافة الموعد
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="min-h-[800px] rounded-lg border">
        <ResizablePanel defaultSize={25} minSize={15}>
          <div className="flex h-full flex-col">
            <div className="flex-1 px-4 py-4">
              <h2 className="mb-4 text-lg font-semibold">قائمة العملاء</h2>
              <div className="space-y-4">
                {customers.map(customer => (
                  <div
                    key={customer.id}
                    className={cn(
                      'hover:bg-secondary/50 flex cursor-pointer items-center justify-between rounded-lg border p-4',
                      selectedCustomer?.id === customer.id && 'bg-secondary'
                    )}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      {customer.phone && (
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
                            deleteCustomerMutation.mutate(customer.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="py-4 text-center text-muted-foreground">جاري التحميل...</div>
                )}

                {error && (
                  <div className="py-4 text-center text-destructive">حدث خطأ في تحميل البيانات</div>
                )}

                {!isLoading && !error && customers.length === 0 && (
                  <div className="py-4 text-center text-muted-foreground">لا يوجد عملاء</div>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50}>
              <div className="h-full p-4">
                {/* المواعيد والحجوزات */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">المواعيد والحجوزات</h2>
                    <p className="text-sm text-muted-foreground">
                      {customerAppointments.length} موعد
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {customerAppointments.map(appointment => (
                    <div key={appointment.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{appointment.title}</h4>
                          {appointment.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {appointment.description}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(appointment.date), 'PPP', { locale: ar })}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                        <span>المدة: {appointment.duration} دقيقة</span>
                        <span className="capitalize">{appointment.status}</span>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 border-t pt-2 text-sm text-muted-foreground">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {customerAppointments.length === 0 && (
                    <div className="py-4 text-center text-muted-foreground">
                      لا توجد مواعيد أو حجوزات
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="h-full p-4">
                {selectedCustomer ? (
                  <>
                    {/* تفاصيل العميل */}
                    <div className="mb-8">
                      <h2 className="mb-4 text-lg font-semibold">
                        تفاصيل العميل - {selectedCustomer.name}
                      </h2>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">رقم الهاتف:</span>
                          <span>{selectedCustomer.phone || 'غير متوفر'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">البريد الإلكتروني:</span>
                          <span>{selectedCustomer.email || 'غير متوفر'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">العنوان:</span>
                          <span>{selectedCustomer.address || 'غير متوفر'}</span>
                        </div>
                        {selectedCustomer.notes && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ملاحظات:</span>
                            <span>{selectedCustomer.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* سجل المشتريات */}
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">سجل المشتريات</h2>
                        <p className="text-sm text-muted-foreground">
                          {customerSales.length} عملية شراء
                        </p>
                      </div>
                      <div className="space-y-4">
                        {customerSales.map(sale => (
                          <div key={sale.id} className="rounded-lg border p-4">
                            <div className="flex justify-between">
                              <span className="font-medium">{sale.productId}</span>
                              <span>{Number(sale.priceIqd).toLocaleString()} د.ع</span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                              <span>الكمية: {sale.quantity}</span>
                              <span>{format(new Date(sale.date), 'PPP', { locale: ar })}</span>
                            </div>
                          </div>
                        ))}

                        {customerSales.length === 0 && (
                          <div className="py-4 text-center text-muted-foreground">
                            لا توجد مشتريات
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    اختر عميلاً لعرض التفاصيل
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
