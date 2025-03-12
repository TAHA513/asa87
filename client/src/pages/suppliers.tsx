
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Plus, Phone, Mail, MapPin, Tag, Building, User, Landmark, FileText, Trash, Edit, Package } from "lucide-react";
import { Sidebar, SidebarContent, SidebarMenu, SidebarProvider } from "@/components/ui/sidebar";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// تعريف أنواع البيانات
type Supplier = {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  companyType: string;
  paymentTerms: string;
  bankAccount: string;
  notes: string;
  status: string;
  categories: string[];
};

type Transaction = {
  id: number;
  supplierId: number;
  type: string;
  amount: number;
  date: string;
  reference: string;
  notes: string;
  status: "completed" | "pending" | "cancelled";
};

type PurchaseData = {
  type: "payment" | "refund" | "advance" | "purchase" | "other";
  amount: number;
  reference: string;
  notes: string;
  status: "completed" | "pending" | "cancelled";
  supplierId?: number;
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
    type: "purchase",
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
          description: "فشل في جلب المعاملات",
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

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المورد؟")) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/suppliers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "تم الحذف",
          description: "تم حذف المورد بنجاح",
        });
        fetchSuppliers();
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ",
          description: errorData.message || "فشل في حذف المورد",
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
  };

  const handleViewTransactions = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewingTransactions(true);
    await fetchTransactions(supplier.id);
  };

  const handleSaveSupplier = async () => {
    try {
      const url = selectedSupplier
        ? `${apiUrl}/api/suppliers/${selectedSupplier.id}`
        : `${apiUrl}/api/suppliers`;
      const method = selectedSupplier ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categories: formData.categories.split(",").map(cat => cat.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        toast({
          title: "تم بنجاح",
          description: selectedSupplier
            ? "تم تحديث بيانات المورد بنجاح"
            : "تمت إضافة المورد بنجاح",
        });
        setIsFormOpen(false);
        fetchSuppliers();
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ",
          description: errorData.message || "فشل في حفظ بيانات المورد",
          variant: "destructive",
        });
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

  const handleSaveTransaction = async () => {
    try {
      if (!selectedSupplier) {
        toast({
          title: "خطأ",
          description: "يجب اختيار مورد أولاً",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${apiUrl}/api/suppliers/${selectedSupplier.id}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      });

      if (response.ok) {
        toast({
          title: "تم بنجاح",
          description: "تمت إضافة المعاملة بنجاح",
        });
        setIsPurchaseFormOpen(false);
        await fetchTransactions(selectedSupplier.id);
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ",
          description: errorData.message || "فشل في إضافة المعاملة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
      taxNumber: supplier.taxNumber || "",
      companyType: supplier.companyType || "",
      contactPerson: supplier.contactPerson || "",
      bankAccount: supplier.bankAccount || "",
      notes: supplier.notes || "",
      categories: supplier.categories?.join(", ") || "",
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedSupplier(null);
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
    setIsFormOpen(true);
  };

  const handleAddPurchase = () => {
    setIsPurchaseFormOpen(true);
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.includes(searchTerm) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // إذا كان هناك تحميل
  if (isLoadingSuppliers) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid grid-cols-[220px_1fr] h-screen">
        <Sidebar className="border-l border-border h-screen">
          <SidebarMenu />
        </Sidebar>
        <SidebarContent>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">الموردين</h1>
              <div className="flex space-x-2">
                <Button
                  onClick={handleAddNew}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة مورد</span>
                </Button>
                
                <Button
                  onClick={handleAddPurchase}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  <span>إضافة مشتريات</span>
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>قائمة الموردين</CardTitle>
                <CardDescription>إدارة الموردين والمشتريات</CardDescription>
                <div className="mt-4">
                  <Input
                    placeholder="البحث عن طريق اسم المورد أو رقم الهاتف"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>جهة الاتصال</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الملاحظات</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          لا توجد بيانات
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.contactPerson}</TableCell>
                          <TableCell>{supplier.phone}</TableCell>
                          <TableCell>{supplier.address}</TableCell>
                          <TableCell>{supplier.notes}</TableCell>
                          <TableCell className="flex space-x-2">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTransactions(supplier)}
                            >
                              عرض المعاملات
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </SidebarContent>
      </div>

      {/* نافذة إضافة/تعديل مورد */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? "تعديل بيانات المورد" : "إضافة مورد جديد"}
            </DialogTitle>
            <DialogDescription>
              ادخل بيانات المورد للحفظ في النظام
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المورد</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">الشخص المسؤول</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxNumber">رقم الضريبة</Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, taxNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">الحساب البنكي</Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categories">التصنيفات (مفصولة بفواصل)</Label>
              <Input
                id="categories"
                value={formData.categories}
                onChange={(e) =>
                  setFormData({ ...formData, categories: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveSupplier}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة إضافة مشتريات */}
      <Dialog open={isPurchaseFormOpen} onOpenChange={setIsPurchaseFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة معاملة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات المعاملة مع المورد
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">المورد</Label>
              <Select
                onValueChange={(value) =>
                  setSelectedSupplier(
                    suppliers.find((s) => s.id === Number(value)) || null
                  )
                }
                value={selectedSupplier?.id?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transactionType">نوع المعاملة</Label>
              <Select
                onValueChange={(value) =>
                  setPurchaseData({
                    ...purchaseData,
                    type: value as PurchaseData["type"],
                  })
                }
                value={purchaseData.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المعاملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">مشتريات</SelectItem>
                  <SelectItem value="payment">دفعة</SelectItem>
                  <SelectItem value="refund">استرجاع</SelectItem>
                  <SelectItem value="advance">دفعة مقدمة</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                value={purchaseData.amount}
                onChange={(e) =>
                  setPurchaseData({
                    ...purchaseData,
                    amount: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">المرجع/الرقم</Label>
              <Input
                id="reference"
                value={purchaseData.reference}
                onChange={(e) =>
                  setPurchaseData({
                    ...purchaseData,
                    reference: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={purchaseData.notes}
                onChange={(e) =>
                  setPurchaseData({
                    ...purchaseData,
                    notes: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                onValueChange={(value) =>
                  setPurchaseData({
                    ...purchaseData,
                    status: value as PurchaseData["status"],
                  })
                }
                value={purchaseData.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPurchaseFormOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveTransaction}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة عرض المعاملات */}
      <Dialog open={viewingTransactions} onOpenChange={setViewingTransactions}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>معاملات المورد: {selectedSupplier?.name}</DialogTitle>
            <DialogDescription>
              سجل جميع المعاملات مع هذا المورد
            </DialogDescription>
          </DialogHeader>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="mr-2">جاري تحميل المعاملات...</span>
            </div>
          ) : (
            <div className="overflow-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المرجع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        لا توجد معاملات
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {(() => {
                            switch (transaction.type) {
                              case "purchase":
                                return "مشتريات";
                              case "payment":
                                return "دفعة";
                              case "refund":
                                return "استرجاع";
                              case "advance":
                                return "دفعة مقدمة";
                              default:
                                return transaction.type;
                            }
                          })()}
                        </TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString("ar-IQ")}
                        </TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell>
                          {(() => {
                            switch (transaction.status) {
                              case "completed":
                                return "مكتملة";
                              case "pending":
                                return "قيد الانتظار";
                              case "cancelled":
                                return "ملغية";
                              default:
                                return transaction.status;
                            }
                          })()}
                        </TableCell>
                        <TableCell>{transaction.notes}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setIsPurchaseFormOpen(true);
                setViewingTransactions(false);
              }}
            >
              إضافة معاملة جديدة
            </Button>
            <Button variant="outline" onClick={() => setViewingTransactions(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
