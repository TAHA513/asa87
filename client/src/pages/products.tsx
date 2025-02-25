import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdDelete } from "react-icons/md";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function Products() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { toast } = useToast();

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

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-right">
              <thead className="text-sm bg-muted">
                <tr>
                  <th className="p-4">اسم المنتج</th>
                  <th className="p-4">الوصف</th>
                  <th className="p-4">السعر (د.ع)</th>
                  <th className="p-4">المخزون</th>
                  <th className="p-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-gray-600">{product.description}</td>
                    <td className="p-4">{product.priceIqd}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      <Button 
                        variant="destructive"
                        size="lg"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <MdDelete className="h-6 w-6" />
                        <span>حذف</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}