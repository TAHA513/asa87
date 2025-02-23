import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertSaleSchema } from "@shared/schema";
import type { Product, ExchangeRate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function NewSale() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: exchangeRate } = useQuery<ExchangeRate>({
    queryKey: ["/api/exchange-rate"],
  });

  const form = useForm({
    resolver: zodResolver(insertSaleSchema),
    defaultValues: {
      productId: 0,
      quantity: 1,
    },
  });

  const selectedProduct = products.find(
    (p) => p.id === Number(form.watch("productId"))
  );

  const watchQuantity = form.watch("quantity");

  const priceUsd = selectedProduct ? Number(selectedProduct.priceUsd) * watchQuantity : 0;
  const priceIqd = exchangeRate ? priceUsd * Number(exchangeRate.usdToIqd) : 0;

  async function onSubmit(data: any) {
    await apiRequest("POST", "/api/sales", {
      ...data,
      priceUsd,
      priceIqd // Added priceIqd to the submitted data
    });

    queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المنتج</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر منتج" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الكمية</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedProduct && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span>السعر بالدولار:</span>
              <span className="font-bold">
                ${priceUsd.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>السعر بالدينار:</span>
              <span className="font-bold">
                {priceIqd.toLocaleString()} د.ع
              </span>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">
          إتمام البيع
        </Button>
      </form>
    </Form>
  );
}