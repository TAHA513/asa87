import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Phone, Mail, MapPin, Tag, Building, User, Landmark, FileText, Trash, Edit, Package } from "lucide-react";
import { Sidebar, SidebarContent, SidebarMenu, SidebarProvider } from "@/components/ui/sidebar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// تعريف أنواع البيانات
type Supplier = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  companyType: string;
  contactPerson: string;
  bankAccount: string;
  notes: string;
  categories?: string[];
};

type Transaction = {
  id: number;
  supplierId: number;
  date: string;
  type: "payment" | "refund" | "advance" | "other";
  amount: number;
  reference: string;
  notes: string;
  status: "completed" | "pending" | "cancelled";
};

type PurchaseData = {
  type: "payment" | "refund" | "advance" | "other";
  amount: number;
  reference: string;
  notes: string;
  status: "completed" | "pending" | "cancelled";
};

export default function SuppliersPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    taxNumber: "",
    companyType: "",
    contactPerson: "",
    bankAccount: "",
    notes: "",
    categories: "",
  });
  const [viewingTransactions, setViewingTransactions] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    type: "payment",
    amount: 0,
    reference: "",
    notes: "",
    status: "completed",
  });

  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true);
      const response = await fetch(`${apiUrl}/api/suppliers`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        console.error("Error fetching suppliers:", await response.text());
        toast({
          title: "خطأ",
          description: "فشل في جلب قائمة الموردين",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const fetchTransactions = async (supplierId: number) => {
    try {
      setIsLoadingTransactions(true);
      const response = await fetch(`${apiUrl}/api/suppliers/${supplierId}/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error("Error fetching transactions:", await response.text());
        toast({
          title: "خطأ",
          description: "فشل في جلب سجل المشتريات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleViewTransactions = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewingTransactions(true);
    fetchTransactions(supplier.id);
  };

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    try {
      const response = await fetch(`${apiUrl}/api/suppliers/${selectedSupplier.id}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...purchaseData,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "تم بنجاح",
          description: "تمت إضافة المشتريات بنجاح",
        });
        setPurchaseData({
          type: "payment",
          amount: 0,
          reference: "",
          notes: "",
          status: "completed",
        });
        setIsPurchaseFormOpen(false);
        fetchTransactions(selectedSupplier.id);
      } else {
        console.error("Error adding transaction:", await response.text());
        toast({
          title: "خطأ",
          description: "فشل في إضافة المشتريات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePurchaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPurchaseData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // تأكد من وجود حقول ضرورية وفقاً للتحقق في الخادم
      const supplierData = {
        ...formData,
        contactPerson: formData.contactPerson || formData.name, // استخدام الاسم إذا لم يتم إدخال الشخص المسؤول
        categories: formData.categories ? formData.categories.split(',').map(cat => cat.trim()) : ["عام"], // تعيين الفئة الافتراضية
      };

      if (selectedSupplier) {
        // تحديث مورد موجود
        const response = await fetch(`${apiUrl}/api/suppliers/${selectedSupplier.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierData),
        });

        if (response.ok) {
          toast({
            title: "تم بنجاح",
            description: "تم تحديث بيانات المورد بنجاح",
          });
          setIsFormOpen(false);
          fetchSuppliers();
        } else {
          const errorData = await response.json();
          toast({
            title: "خطأ",
            description: errorData.message || "فشل في تحديث بيانات المورد",
            variant: "destructive",
          });
        }
      } else {
        // إضافة مورد جديد
        const response = await fetch(`${apiUrl}/api/suppliers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierData),
        });

        if (response.ok) {
          toast({
            title: "تم بنجاح",
            description: "تمت إضافة المورد بنجاح",
          });
          setIsFormOpen(false);
          fetchSuppliers();
        } else {
          const errorData = await response.json();
          toast({
            title: "خطأ",
            description: errorData.message || "فشل في إضافة المورد",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    }
  };

  // إذا كان هناك تحميل
  if (isLoadingSuppliers) {
    return (
      <SidebarProvider>
        <div className="flex h-screen">
          <div className="w-64 h-full">
            <Sidebar />
          </div>
          <main className="flex-1 p-8">
            <div className="h-[400px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // تصفية الموردين حسب البحث
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // إعادة تعيين نموذج
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      taxNumber: "",
      companyType: "",
      contactPerson: "",
      bankAccount: "",
      notes: "",
      categories: "",
    });
    setSelectedSupplier(null);
  };

  // فتح نموذج التعديل
  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      taxNumber: supplier.taxNumber,
      companyType: supplier.companyType,
      contactPerson: supplier.contactPerson,
      bankAccount: supplier.bankAccount,
      notes: supplier.notes,
      categories: supplier.categories?.join(",") || "",
    });
    setIsFormOpen(true);
  };

  // حذف مورد
  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا المورد؟")) {
      try {
        const response = await fetch(`${apiUrl}/api/suppliers/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
          toast({
            title: "تم الحذف",
            description: "تم حذف المورد بنجاح",
          });
        } else {
          toast({
            title: "خطأ",
            description: "فشل في حذف المورد",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء الاتصال بالخادم",
          variant: "destructive",
        });
      }
    }
  };


  // عرض الصفحة الرئيسية
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <div className="w-64 h-full">
          <Sidebar />
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">إدارة الموردين</h1>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" /> إضافة مورد جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedSupplier ? "تعديل بيانات المورد" : "إضافة مورد جديد"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedSupplier
                        ? "قم بتعديل بيانات المورد ثم اضغط حفظ"
                        : "أدخل بيانات المورد الجديد ثم اضغط حفظ"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          اسم المورد
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          رقم الهاتف
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          البريد الإلكتروني
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium">
                          العنوان
                        </label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="taxNumber" className="text-sm font-medium">
                          الرقم الضريبي
                        </label>
                        <Input
                          id="taxNumber"
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="companyType" className="text-sm font-medium">
                          نوع الشركة
                        </label>
                        <Input
                          id="companyType"
                          name="companyType"
                          value={formData.companyType}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contactPerson" className="text-sm font-medium">
                          الشخص المسؤول
                        </label>
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="bankAccount" className="text-sm font-medium">
                          الحساب البنكي
                        </label>
                        <Input
                          id="bankAccount"
                          name="bankAccount"
                          value={formData.bankAccount}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label htmlFor="notes" className="text-sm font-medium">
                          ملاحظات
                        </label>
                        <Input
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label htmlFor="categories" className="text-sm font-medium">
                          الفئات (فاصلة بين كل فئة)
                        </label>
                        <Input
                          id="categories"
                          name="categories"
                          value={formData.categories}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {selectedSupplier ? "حفظ التغييرات" : "إضافة المورد"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex justify-between items-center">
              <div className="w-1/3">
                <Input
                  placeholder="بحث عن مورد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>إجمالي الموردين: {suppliers.length}</div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>قائمة الموردين</CardTitle>
                <CardDescription>
                  عرض جميع الموردين المسجلين في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>قائمة بجميع الموردين المسجلين</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">م</TableHead>
                      <TableHead>اسم المورد</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead className="w-[150px]">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          لا توجد بيانات للعرض
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSuppliers.map((supplier, index) => (
                        <TableRow key={supplier.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Package className="mr-2 h-4 w-4 text-gray-400" />
                              {supplier.name}
                              <Button variant="ghost" size="icon" onClick={() => handleViewTransactions(supplier)} className="ml-2">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="mr-2 h-4 w-4 text-gray-400" />
                              {supplier.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-gray-400" />
                              {supplier.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                              {supplier.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(supplier)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(supplier.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between"></CardFooter>
            </Card>
          </div>

          {/* نافذة عرض المشتريات وإضافة مشتريات جديدة */}
          <Dialog open={viewingTransactions} onOpenChange={setViewingTransactions}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>
                  سجل المشتريات - {selectedSupplier?.name}
                </DialogTitle>
                <DialogDescription>
                  عرض وإدارة المشتريات والمعاملات مع المورد
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end mb-4">
                <Button onClick={() => setIsPurchaseFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> إضافة مشتريات جديدة
                </Button>
              </div>

              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p>لا توجد مشتريات مسجلة لهذا المورد</p>
                  <p className="text-sm text-gray-500">قم بإضافة معاملات جديدة باستخدام الزر أعلاه</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>ملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString("ar-IQ")}</TableCell>
                          <TableCell>
                            {transaction.type === "payment" ? "دفع" :
                              transaction.type === "refund" ? "استرداد" :
                                transaction.type === "advance" ? "دفعة مقدمة" : "أخرى"}
                          </TableCell>
                          <TableCell>{transaction.amount.toLocaleString()} د.ع</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === "completed" ? "default" :
                                transaction.status === "pending" ? "outline" : "destructive"
                            }>
                              {transaction.status === "completed" ? "مكتمل" :
                                transaction.status === "pending" ? "معلق" : "ملغي"}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* نموذج إضافة مشتريات جديدة */}
          <Dialog open={isPurchaseFormOpen} onOpenChange={setIsPurchaseFormOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إضافة مشتريات جديدة</DialogTitle>
                <DialogDescription>
                  إضافة معاملة جديدة مع المورد {selectedSupplier?.name}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={addTransaction}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">نوع المعاملة</Label>
                      <Select name="type" value={purchaseData.type} onValueChange={(value) => setPurchaseData({ ...purchaseData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="payment">دفع</SelectItem>
                          <SelectItem value="refund">استرداد</SelectItem>
                          <SelectItem value="advance">دفعة مقدمة</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">الحالة</Label>
                      <Select name="status" value={purchaseData.status} onValueChange={(value) => setPurchaseData({ ...purchaseData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">مكتمل</SelectItem>
                          <SelectItem value="pending">معلق</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">المبلغ (دينار عراقي)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={purchaseData.amount}
                      onChange={handlePurchaseChange}
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">الرقم المرجعي / رقم الفاتورة</Label>
                    <Input
                      id="reference"
                      name="reference"
                      value={purchaseData.reference}
                      onChange={handlePurchaseChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={purchaseData.notes}
                      onChange={handlePurchaseChange}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="submit">
                    إضافة المشتريات
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
}