import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Sidebar from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Phone, Mail, MapPin, Tag } from 'lucide-react';
import type { Supplier, InsertSupplier } from '@shared/schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { insertSupplierSchema } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useMutation } from '@tanstack/react-query';

const DEFAULT_CATEGORIES = ['أجهزة', 'قطع غيار', 'مواد استهلاكية', 'خدمات'];

export default function SuppliersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [supplierSheetOpen, setSupplierSheetOpen] = useState(false);

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      taxNumber: '',
      paymentTerms: '',
      notes: '',
      categories: ['أجهزة'],
      userId: user?.id || 0,
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      if (!user) throw new Error('يجب تسجيل الدخول أولاً');

      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في إنشاء المورد');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers'] });
      setSupplierSheetOpen(false);
      form.reset();
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة المورد الجديد',
      });
    },
    onError: (error: Error) => {
      console.error('خطأ في إنشاء المورد:', error);
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoadingSuppliers) {
    return (
      <div className="flex h-screen">
        <div className="h-full w-64">
          <Sidebar />
        </div>
        <main className="flex-1 p-8">
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="h-full w-64">
        <Sidebar />
      </div>
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">الموردين</h2>
              <p className="text-muted-foreground">إدارة الموردين والمعاملات</p>
            </div>
            <Sheet open={supplierSheetOpen} onOpenChange={setSupplierSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة مورد
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>إضافة مورد جديد</SheetTitle>
                </SheetHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(data => createSupplierMutation.mutate(data))}
                    className="mt-4 space-y-3"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المورد</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الشخص المسؤول</FormLabel>
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
                            <Input {...field} type="tel" dir="ltr" />
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
                      name="categories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الفئات</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {DEFAULT_CATEGORIES.map(category => (
                              <Badge
                                key={category}
                                variant={field.value.includes(category) ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                  const newCategories = field.value.includes(category)
                                    ? field.value.filter(c => c !== category)
                                    : [...field.value, category];
                                  field.onChange(newCategories);
                                }}
                              >
                                <Tag className="ml-1 h-3 w-3" />
                                {category}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createSupplierMutation.isPending}
                    >
                      {createSupplierMutation.isPending && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      إضافة مورد جديد
                    </Button>
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>قائمة الموردين</CardTitle>
              <CardDescription>
                {suppliers.length === 0
                  ? 'لم تتم إضافة أي موردين بعد'
                  : `${suppliers.length} موردين مسجلين`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  لا يوجد موردين. قم بإضافة مورد جديد باستخدام الزر أعلاه.
                </div>
              ) : (
                <div className="grid gap-4">
                  {suppliers.map(supplier => (
                    <div
                      key={supplier.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{supplier.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{supplier.name}</h3>
                          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {supplier.phone}
                            </span>
                            {supplier.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {supplier.email}
                              </span>
                            )}
                            {supplier.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {supplier.address}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex gap-2">
                            {supplier.categories?.map(category => (
                              <Badge key={category} variant="secondary">
                                <Tag className="ml-1 h-3 w-3" />
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                        {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
