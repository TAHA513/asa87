import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Addition of missing components from original code.
const DialogDescription = ({ children, className }) => (
  <div className={`text-sm text-muted-foreground ${className || ''}`}>{children}</div>
);

const DialogFooter = ({ children, className }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}>{children}</div>
);


export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  //Customer data structure from original code
  interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    createdAt: string;
  }

  //Maintaining original error handling and loading states.
  const { data: customers = [], isLoading, error } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    refetchInterval: 30000, 
    queryFn: async () => {
      try {
        const res = await fetch(`/api/customers`);
        if (!res.ok) {
          throw new Error("فشل في جلب قائمة العملاء");
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("خطأ في جلب بيانات العملاء:", error);
        throw error;
      }
    },
  });

  //Retaining original mutation structure for better error handling and notifications.
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      return apiRequest("POST", "/api/customers", customerData);
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إضافة العميل بنجاح",
      });
      setNewCustomer({ name: "", phone: "", email: "", address: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: `فشل إضافة العميل: ${error instanceof Error ? error.message : "حدث خطأ غير متوقع"}`,
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (customerData) => {
      return apiRequest("PUT", `/api/customers/${customerData.id}`, customerData);
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث بيانات العميل بنجاح",
      });
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: `فشل تحديث العميل: ${error instanceof Error ? error.message : "حدث خطأ غير متوقع"}`,
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId) => {
      return apiRequest("DELETE", `/api/customers/${customerId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم حذف العميل بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: `فشل حذف العميل: ${error instanceof Error ? error.message : "حدث خطأ غير متوقع"}`,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    addCustomerMutation.mutate(newCustomer);
  };

  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    updateCustomerMutation.mutate(selectedCustomer);
  };

  const handleDeleteCustomer = (customerId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      deleteCustomerMutation.mutate(customerId);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">إدارة العملاء</h2>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">جميع العملاء</TabsTrigger>
          <TabsTrigger value="add">إضافة عميل</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة العملاء</CardTitle>
              <CardDescription>
                يمكنك البحث وإدارة جميع العملاء من هنا
              </CardDescription>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  placeholder="البحث عن عميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-2"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : error ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
                    <p className="mt-2">حدث خطأ أثناء تحميل البيانات</p>
                  </div>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-4">لا يوجد عملاء</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedCustomer(customer)}
                                >
                                  تعديل
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>تعديل بيانات العميل</DialogTitle>
                                  <DialogDescription>
                                    قم بتعديل بيانات العميل ثم اضغط حفظ
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdateCustomer}>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-name" className="text-right">
                                        الاسم
                                      </Label>
                                      <Input
                                        id="edit-name"
                                        name="name"
                                        value={selectedCustomer?.name || ""}
                                        onChange={(e) =>
                                          setSelectedCustomer((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                          }))
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-phone" className="text-right">
                                        رقم الهاتف
                                      </Label>
                                      <Input
                                        id="edit-phone"
                                        name="phone"
                                        value={selectedCustomer?.phone || ""}
                                        onChange={(e) =>
                                          setSelectedCustomer((prev) => ({
                                            ...prev,
                                            phone: e.target.value,
                                          }))
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-email" className="text-right">
                                        البريد الإلكتروني
                                      </Label>
                                      <Input
                                        id="edit-email"
                                        name="email"
                                        value={selectedCustomer?.email || ""}
                                        onChange={(e) =>
                                          setSelectedCustomer((prev) => ({
                                            ...prev,
                                            email: e.target.value,
                                          }))
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="edit-address" className="text-right">
                                        العنوان
                                      </Label>
                                      <Input
                                        id="edit-address"
                                        name="address"
                                        value={selectedCustomer?.address || ""}
                                        onChange={(e) =>
                                          setSelectedCustomer((prev) => ({
                                            ...prev,
                                            address: e.target.value,
                                          }))
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit">حفظ التغييرات</Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              حذف
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>إضافة عميل جديد</CardTitle>
              <CardDescription>أدخل بيانات العميل الجديد</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="اسم العميل"
                      value={newCustomer.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="رقم الهاتف"
                      value={newCustomer.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={newCustomer.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="العنوان"
                      value={newCustomer.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-4">
                  إضافة العميل
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}