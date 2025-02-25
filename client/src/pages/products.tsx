import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <p className="text-sm">السعر: {product.priceIqd} د.ع</p>
                  <p className="text-sm">المخزون: {product.stock}</p>
                </div>
                <Button 
                  variant="destructive" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                      deleteMutation.mutate(product.id);
                    }
                  }}
                >
                  <MdDelete className="h-5 w-5" />
                  <span>حذف</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}