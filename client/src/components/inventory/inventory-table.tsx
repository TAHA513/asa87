import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Plus, Trash2, Edit } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import type { Product, ExchangeRate } from "@shared/schema";
import { insertProductSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function InventoryTable() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: exchangeRate } = useQuery<ExchangeRate>({
    queryKey: ["/api/exchange-rate"],
    staleTime: 0,
    refetchInterval: 5000,
  });

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      priceIqd: "",
      stock: 0,
      productCode: "",
      barcode: "",
      expiryDate: null, // Added expiryDate to defaultValues
    },
  });

  // إضافة mutation للحذف
  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("DELETE", `/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("فشل في حذف المنتج");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المنتج بنجاح",
      });
    },
    onError: (error) => {
      console.error("خطأ في حذف المنتج:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتج. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // تحديث mutation للتعديل
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Product> }) => {
      const response = await apiRequest("PATCH", `/api/products/${data.id}`, data.updates);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "فشل في تحديث المنتج");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث المخزون بنجاح",
      });
    },
    onError: (error) => {
      console.error("خطأ في تحديث المخزون:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في تحديث المخزون. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStock = async (product: Product) => {
    const newStock = window.prompt(`أدخل الكمية الجديدة للمخزون (الكمية الحالية: ${product.stock}):`, product.stock.toString());

    if (newStock === null) return; // إلغاء العملية

    const stockNumber = Number(newStock);
    if (isNaN(stockNumber)) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم صحيح",
        variant: "destructive",
      });
      return;
    }

    if (stockNumber < 0) {
      toast({
        title: "خطأ",
        description: "لا يمكن أن تكون الكمية سالبة",
        variant: "destructive",
      });
      return;
    }

    const confirmUpdate = window.confirm(
      `هل أنت متأكد من تحديث المخزون من ${product.stock} إلى ${stockNumber}؟`
    );

    if (confirmUpdate) {
      try {
        await updateMutation.mutateAsync({
          id: product.id,
          updates: { stock: stockNumber }
        });
      } catch (error) {
        // تم معالجة الخطأ في onError
      }
    }
  };

  const watchPriceIqd = form.watch("priceIqd");
  const priceUsd = exchangeRate && watchPriceIqd ? Number(watchPriceIqd) / Number(exchangeRate.usdToIqd) : 0;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/products", {
        name: data.name,
        description: data.description || "",
        priceIqd: data.priceIqd.toString(),
        stock: Number(data.stock),
        productCode: data.productCode,
        barcode: data.barcode || null,
        expiryDate: data.expiryDate, // Added expiryDate to the request
      });

      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      form.reset();

      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة المنتج. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Package className="h-6 w-6" />
          <h2 className="text-2xl font-bold">المخزون</h2>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="بحث عن المنتجات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المنتج</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رمز المنتج</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الباركود</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="priceIqd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعر بالدينار العراقي</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          ما يعادل: ${priceUsd.toFixed(2)} دولار
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المخزون</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الانتهاء</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : '')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    إضافة المنتج
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم المنتج</TableHead>
              <TableHead>رمز المنتج</TableHead>
              <TableHead>الباركود</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>المخزون</TableHead>
              <TableHead>تاريخ انتهاء الصلاحية</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const priceUsd = exchangeRate
                ? Number(product.priceIqd) / Number(exchangeRate.usdToIqd)
                : 0;

              return (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.productCode}</TableCell>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>
                    {Number(product.priceIqd).toLocaleString()} د.ع
                    <br />
                    <span className="text-sm text-muted-foreground">
                      ${priceUsd.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={product.stock < 10 ? "text-red-500" : ""}>
                        {product.stock}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStock(product)}
                      >
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل المخزون
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.expiryDate ? (
                      <div>
                        {new Date(product.expiryDate).toLocaleDateString('ar-IQ')}
                      </div>
                    ) : (
                      <div>-</div>
                    )}
                  </TableCell> {/* Added expiry date display */}
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}