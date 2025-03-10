import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Phone, Mail, MapPin, Tag, Building, User, Landmark, FileText, Trash, Edit, Package } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarNav } from "@/components/ui/sidebar"; //Import SidebarNav
import { SidebarProvider } from "@/components/ui/sidebar"; //Import SidebarProvider


// تعريف أنواع البيانات
type Supplier = {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  status: string;
  categories: string[];
  createdAt: string;
};

type InsertSupplier = {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  categories: string[];
  userId: number;
};

// نموذج التحقق من البيانات
import { z } from "zod";

const insertSupplierSchema = z.object({
  name: z.string().min(1, "اسم المورد مطلوب"),
  contactPerson: z.string().min(1, "اسم الشخص المسؤول مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().nullable(),
  address: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  categories: z.array(z.string()).min(1, "يجب اختيار فئة واحدة على الأقل"),
  userId: z.number(),
});

// قائمة الفئات الافتراضية
const DEFAULT_CATEGORIES = [
  "إلكترونيات",
  "أجهزة كهربائية",
  "أثاث",
  "مستلزمات مكتبية",
  "أدوات طبية",
  "مواد غذائية",
  "سلع استهلاكية",
  "خدمات",
  "نقل وشحن",
  "قطع غيار",
  "مواد بناء",
  "أخرى"
];

export default function SuppliersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [supplierSheetOpen, setSupplierSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // استعلام لجلب قائمة الموردين
  const { data: suppliers = [], isLoading: isLoadingSuppliers, isError, error } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    onError: (err) => {
      console.error("Error fetching suppliers:", err);
      toast({
        title: "خطأ في جلب بيانات الموردين",
        description: "يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  });

  // نموذج إضافة مورد جديد
  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      taxNumber: "",
      paymentTerms: "",
      notes: "",
      categories: ["إلكترونيات"],
      userId: user?.id || 0,
    },
  });

  // إنشاء مورد جديد
  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => {
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل في إنشاء المورد");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setSupplierSheetOpen(false);
      form.reset();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المورد الجديد",
      });
    },
    onError: (error: Error) => {
      console.error("خطأ في إنشاء المورد:", error);
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تحديث بيانات مورد
  const updateSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier & { id: number }) => {
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const { id, ...updateData } = data;
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل في تحديث المورد");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setSupplierSheetOpen(false);
      setEditMode(false);
      form.reset();
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات المورد",
      });
    },
    onError: (error: Error) => {
      console.error("خطأ في تحديث المورد:", error);
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // حذف مورد
  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!user) throw new Error("يجب تسجيل الدخول أولاً");

      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "فشل في حذف المورد");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setDeleteConfirmOpen(false);
      toast({
        title: "تم بنجاح",
        description: "تم حذف المورد",
      });
    },
    onError: (error: Error) => {
      console.error("خطأ في حذف المورد:", error);
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تحميل بيانات المورد للتعديل
  const handleEditSupplier = (supplier: Supplier) => {
    form.reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
      taxNumber: supplier.taxNumber || "",
      paymentTerms: supplier.paymentTerms || "",
      notes: supplier.notes || "",
      categories: supplier.categories,
      userId: user?.id || 0,
    });
    setSelectedSupplierId(supplier.id);
    setEditMode(true);
    setSupplierSheetOpen(true);
  };

  // فلترة الموردين
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = !searchTerm || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm);

    const matchesCategory = !filterCategory || 
      supplier.categories.includes(filterCategory);

    return matchesSearch && matchesCategory;
  });

  // إذا كان هناك تحميل
  if (isLoadingSuppliers) {
    return (
      <div className="flex h-screen">
        <div className="w-64 h-full">
          <SidebarNav />
        </div>
        <main className="flex-1 p-8">
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  // عرض الصفحة الرئيسية
  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <SidebarNav />
      </div>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">الموردين</h2>
                <p className="text-muted-foreground">
                  إدارة الموردين والمعاملات
                </p>
              </div>
              <Sheet open={supplierSheetOpen} onOpenChange={(open) => {
                setSupplierSheetOpen(open);
                if (!open) {
                  form.reset();
                  setEditMode(false);
                }
              }}>
                <SheetTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مورد
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{editMode ? "تعديل بيانات المورد" : "إضافة مورد جديد"}</SheetTitle>
                  </SheetHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => {
                      if (editMode && selectedSupplierId) {
                        updateSupplierMutation.mutate({ ...data, id: selectedSupplierId });
                      } else {
                        createSupplierMutation.mutate(data);
                      }
                    })} className="space-y-3 mt-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المورد</FormLabel>
                            <FormControl>
                              <Input placeholder="اسم الشركة أو المؤسسة" {...field} />
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
                            <FormLabel>اسم الشخص المسؤول</FormLabel>
                            <FormControl>
                              <Input placeholder="المدير أو المسؤول المباشر" {...field} />
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
                              <Input type="tel" placeholder="078xxxxxxxx" {...field} />
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
                              <Input type="email" placeholder="example@company.com" {...field} value={field.value || ""} />
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
                              <Textarea placeholder="عنوان المقر الرئيسي" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الرقم الضريبي</FormLabel>
                            <FormControl>
                              <Input placeholder="اختياري" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>شروط الدفع</FormLabel>
                            <FormControl>
                              <Input placeholder="مثال: 30 يوم" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="categories"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>فئات المنتجات</FormLabel>
                              <FormDescription>
                                اختر الفئات التي يوفرها هذا المورد
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {DEFAULT_CATEGORIES.map((category) => (
                                <FormField
                                  key={category}
                                  control={form.control}
                                  name="categories"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={category}
                                        className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(category)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, category])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== category
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {category}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
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
                              <Textarea placeholder="ملاحظات إضافية حول المورد" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}>
                        {(createSupplierMutation.isPending || updateSupplierMutation.isPending) ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : editMode ? (
                          <>
                            <Edit className="h-4 w-4 ml-2" />
                            تحديث بيانات المورد
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 ml-2" />
                            إضافة مورد جديد
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </SheetContent>
              </Sheet>
            </div>

            {/* فلاتر البحث */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="searchSupplier">بحث</Label>
                <Input
                  id="searchSupplier"
                  placeholder="ابحث بالاسم أو رقم الهاتف"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-64">
                <Label htmlFor="filterCategory">تصفية حسب الفئة</Label>
                <Select value={filterCategory || ""} onValueChange={(value) => setFilterCategory(value || null)}>
                  <SelectTrigger id="filterCategory">
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الفئات</SelectItem>
                    {DEFAULT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>قائمة الموردين</CardTitle>
                <CardDescription>
                  {filteredSuppliers.length === 0
                    ? "لم تتم إضافة أي موردين بعد"
                    : `${filteredSuppliers.length} موردين مسجلين${
                        searchTerm || filterCategory ? " (مفلترة)" : ""
                      }`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {suppliers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                    <Building className="h-16 w-16 text-muted-foreground/20 mb-4" />
                    <p>لا يوجد موردين مسجلين حالياً</p>
                    <p className="text-sm">قم بإضافة مورد جديد باستخدام الزر أعلاه</p>
                  </div>
                ) : filteredSuppliers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج مطابقة لمعايير البحث
                  </div>
                ) : (
                  <Tabs defaultValue="cards" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="cards">بطاقات</TabsTrigger>
                      <TabsTrigger value="table">جدول</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cards">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredSuppliers.map((supplier) => (
                          <div
                            key={supplier.id}
                            className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden"
                          >
                            <div className="flex flex-col p-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 bg-primary/10">
                                  <AvatarFallback className="text-primary">
                                    {supplier.name.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">{supplier.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    <User className="h-3 w-3 inline ml-1" />
                                    {supplier.contactPerson}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm">
                                  <Phone className="h-4 w-4 mr-2" />
                                  <span>{supplier.phone}</span>
                                </div>
                                {supplier.email && (
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-4 w-4 mr-2" />
                                    <span>{supplier.email}</span>
                                  </div>
                                )}
                                {supplier.address && (
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    <span>{supplier.address}</span>
                                  </div>
                                )}
                                {supplier.taxNumber && (
                                  <div className="flex items-center text-sm">
                                    <Landmark className="h-4 w-4 mr-2" />
                                    <span>الرقم الضريبي: {supplier.taxNumber}</span>
                                  </div>
                                )}
                                {supplier.paymentTerms && (
                                  <div className="flex items-center text-sm">
                                    <FileText className="h-4 w-4 mr-2" />
                                    <span>شروط الدفع: {supplier.paymentTerms}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {supplier.categories.map((category) => (
                                  <Badge key={category} variant="secondary">
                                    <Tag className="h-3 w-3 ml-1" />
                                    {category}
                                  </Badge>
                                ))}
                              </div>

                              {supplier.notes && (
                                <div className="mt-4 text-sm text-muted-foreground">
                                  <p>ملاحظات: {supplier.notes}</p>
                                </div>
                              )}

                              <div className="mt-4 pt-4 border-t flex justify-between">
                                <Button variant="outline" size="sm" onClick={() => handleEditSupplier(supplier)}>
                                  <Edit className="h-4 w-4 ml-2" />
                                  تعديل
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSupplierId(supplier.id);
                                    setDeleteConfirmOpen(true);
                                  }}
                                >
                                  <Trash className="h-4 w-4 ml-2" />
                                  حذف
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="table">
                      <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="py-3 px-4 text-right font-medium">اسم المورد</th>
                                <th className="py-3 px-4 text-right font-medium">الشخص المسؤول</th>
                                <th className="py-3 px-4 text-right font-medium">الهاتف</th>
                                <th className="py-3 px-4 text-right font-medium">البريد الإلكتروني</th>
                                <th className="py-3 px-4 text-right font-medium">الفئات</th>
                                <th className="py-3 px-4 text-right font-medium">الإجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredSuppliers.map((supplier, index) => (
                                <tr key={supplier.id} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                                  <td className="py-3 px-4">{supplier.name}</td>
                                  <td className="py-3 px-4">{supplier.contactPerson}</td>
                                  <td className="py-3 px-4 whitespace-nowrap">{supplier.phone}</td>
                                  <td className="py-3 px-4">{supplier.email || "-"}</td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-wrap gap-1">
                                      {supplier.categories.slice(0, 2).map((category) => (
                                        <Badge key={category} variant="outline" className="text-xs py-0">
                                          {category}
                                        </Badge>
                                      ))}
                                      {supplier.categories.length > 2 && (
                                        <Badge variant="outline" className="text-xs py-0">
                                          +{supplier.categories.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="icon" onClick={() => handleEditSupplier(supplier)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => {
                                          setSelectedSupplierId(supplier.id);
                                          setDeleteConfirmOpen(true);
                                        }}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* مربع حوار تأكيد الحذف */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد حذف المورد</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من رغبتك في حذف هذا المورد؟ هذا الإجراء لا يمكن التراجع عنه.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedSupplierId) {
                    deleteSupplierMutation.mutate(selectedSupplierId);
                  }
                }}
                disabled={deleteSupplierMutation.isPending}
              >
                {deleteSupplierMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Trash className="h-4 w-4 ml-2" />
                )}
                حذف المورد
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}