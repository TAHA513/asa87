import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdDelete } from "react-icons/md";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { ProductGallery } from "@/components/products/product-gallery";

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