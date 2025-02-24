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
import { type Customer, type Sale, insertCustomerSchema } from "@shared/schema";
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

type NewCustomerForm = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<NewCustomerForm>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const { data, isLoading, error } = useQuery<Customer[]>({
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

  const { data: customerSales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/customers", selectedCustomer?.id, "sales"],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      const res = await fetch(`/api/customers/${selectedCustomer.id}/sales`);
      if (!res.ok) {
        throw new Error("فشل في جلب مشتريات العميل");
      }
      return res.json();
    },
    enabled: !!selectedCustomer?.id,
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: NewCustomerForm) => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("فشل في إنشاء العميل");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "تم إنشاء العميل بنجاح",
        description: "تم إضافة العميل الجديد إلى قائمة العملاء",
      });
      setIsNewCustomerOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const customers = data || [];

  const onSubmit = (data: NewCustomerForm) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
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
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة عميل جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ml-2" />
                    )}
                    إضافة العميل
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* قائمة العملاء */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء</CardTitle>
            <CardDescription>
              {customers.length} عميل
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div>
                    <h3 className="font-medium">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {isLoading && (
                <div className="text-center py-4 text-muted-foreground">
                  جاري التحميل...
                </div>
              )}

              {error && (
                <div className="text-center py-4 text-destructive">
                  حدث خطأ في تحميل البيانات
                </div>
              )}

              {!isLoading && !error && customers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  لا يوجد عملاء
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل العميل والمشتريات */}
        {selectedCustomer && (
          <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>تفاصيل العميل - {selectedCustomer.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* معلومات العميل */}
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">رقم الهاتف:</span>
                        <span>{selectedCustomer.phone || "غير متوفر"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">البريد الإلكتروني:</span>
                        <span>{selectedCustomer.email || "غير متوفر"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">العنوان:</span>
                        <span>{selectedCustomer.address || "غير متوفر"}</span>
                      </div>
                      {selectedCustomer.notes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ملاحظات:</span>
                          <span>{selectedCustomer.notes}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* المشتريات */}
                <Card>
                  <CardHeader>
                    <CardTitle>سجل المشتريات</CardTitle>
                    <CardDescription>
                      {customerSales.length} عملية شراء
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {sale.productId} {/* سيتم استبدالها باسم المنتج */}
                            </span>
                            <span>
                              {Number(sale.priceIqd).toLocaleString()} د.ع
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>الكمية: {sale.quantity}</span>
                            <span>
                              {new Date(sale.date).toLocaleDateString("ar-IQ")}
                            </span>
                          </div>
                        </div>
                      ))}

                      {customerSales.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          لا توجد مشتريات
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* المواعيد والحجوزات */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>المواعيد والحجوزات</CardTitle>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 ml-2" />
                        إضافة موعد
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4 text-muted-foreground">
                      لا توجد مواعيد أو حجوزات
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}