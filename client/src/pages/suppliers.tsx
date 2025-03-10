
import React, { useState, useEffect } from "react";
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
  });

  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    // جلب بيانات الموردين
    const fetchSuppliers = async () => {
      setIsLoadingSuppliers(true);
      try {
        const response = await fetch(`${apiUrl}/api/suppliers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data);
        } else {
          toast({
            title: "خطأ",
            description: "فشل في جلب بيانات الموردين",
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

    fetchSuppliers();
  }, [toast, apiUrl]);

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

  // تغيير قيم النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = selectedSupplier
        ? `${apiUrl}/api/suppliers/${selectedSupplier.id}`
        : `${apiUrl}/api/suppliers`;
      
      const method = selectedSupplier ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (selectedSupplier) {
          setSuppliers(
            suppliers.map((supplier) =>
              supplier.id === selectedSupplier.id ? data : supplier
            )
          );
          toast({
            title: "تم التحديث",
            description: "تم تحديث بيانات المورد بنجاح",
          });
        } else {
          setSuppliers([...suppliers, data]);
          toast({
            title: "تمت الإضافة",
            description: "تمت إضافة المورد الجديد بنجاح",
          });
        }
        
        resetForm();
        setIsFormOpen(false);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في حفظ بيانات المورد",
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
        </main>
      </div>
    </SidebarProvider>
  );
}
