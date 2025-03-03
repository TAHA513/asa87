import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdDelete } from "react-icons/md";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { ProductGallery } from "@/components/products/product-gallery";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import type { z } from "zod";

type ProductFormData = z.infer<typeof insertProductSchema>;

export default function Products() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      productType: "piece",
      quantity: 0,
      minQuantity: 0,
      costPrice: 0,
      priceIqd: 0,
      isWeightBased: false,
      enableDirectWeighing: false,
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("فشل حذف المنتج");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "تم حذف المنتج بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "فشل حذف المنتج",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();

      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append image if exists
      if (productImage) {
        formData.append("image", productImage);
      }

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setProductImage(null);
      form.reset();
      toast({
        title: "تم إنشاء المنتج بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "فشل إنشاء المنتج",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">المنتجات</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>إضافة منتج جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>إضافة منتج جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج</Label>
                  <Input {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode">الباركود</Label>
                  <Input {...form.register("barcode")} />
                  {form.formState.errors.barcode && (
                    <p className="text-sm text-destructive">{form.formState.errors.barcode.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">نوع المنتج</Label>
                  <Select
                    value={form.watch("productType")}
                    onValueChange={(value) => form.setValue("productType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="قطعة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">قطعة</SelectItem>
                      <SelectItem value="weight">وزن</SelectItem>
                      <SelectItem value="length">طول</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    type="number"
                    {...form.register("quantity", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">الحد الأدنى</Label>
                  <Input
                    type="number"
                    {...form.register("minQuantity", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productionDate">تاريخ الإنتاج</Label>
                  <DatePicker
                    date={form.watch("productionDate")}
                    onSelect={(date) => form.setValue("productionDate", date)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
                  <DatePicker
                    date={form.watch("expiryDate")}
                    onSelect={(date) => form.setValue("expiryDate", date)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPrice">سعر التكلفة</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("costPrice", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceIqd">سعر البيع</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("priceIqd", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">المجموعة</Label>
                  <Select
                    value={form.watch("categoryId")?.toString()}
                    onValueChange={(value) => {
                      if (value === "new") {
                        setShowNewCategoryInput(true);
                      } else {
                        setShowNewCategoryInput(false);
                        form.setValue("categoryId", parseInt(value));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مجموعة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">إنشاء مجموعة جديدة</SelectItem>
                      {/* Add existing categories here */}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showNewCategoryInput && (
                <div className="space-y-2">
                  <Label htmlFor="newCategory">اسم المجموعة الجديدة</Label>
                  <Input {...form.register("newCategory")} />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isWeightBased"
                    checked={form.watch("isWeightBased")}
                    onCheckedChange={(checked) => form.setValue("isWeightBased", checked)}
                  />
                  <Label htmlFor="isWeightBased" className="mr-2">منتج وزني</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableDirectWeighing"
                    checked={form.watch("enableDirectWeighing")}
                    onCheckedChange={(checked) => form.setValue("enableDirectWeighing", checked)}
                  />
                  <Label htmlFor="enableDirectWeighing" className="mr-2">
                    تفعيل القراءة المباشرة للوزن عند المسح
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>صورة المنتج (اختياري)</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  يمكنك رفع صورة للمنتج. الصورة اختيارية ويمكن إضافتها لاحقاً.
                </div>
                <FileUpload
                  onFileSelect={(file) => setProductImage(file)}
                  maxSize={2}
                  accept="image/*"
                  label="اضغط لإضافة صورة"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء المنتج"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ProductGallery />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      <p className="text-gray-600 mt-1">{product.description}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{product.priceIqd} د.ع</p>
                        <p className="text-sm text-gray-500">المخزون: {product.stock}</p>
                      </div>
                      <Button 
                        variant="destructive"
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <MdDelete className="h-8 w-8 ml-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}