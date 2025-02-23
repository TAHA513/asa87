import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertSaleSchema } from "@shared/schema";
import type { Product } from "@shared/schema";
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

  const form = useForm({
    resolver: zodResolver(insertSaleSchema),
    defaultValues: {
      productId: 0,
      quantity: 1,
      currency: "USD",
      priceUsd: 0,
      priceIqd: 0,
    },
  });

  const selectedProduct = products.find(
    (p) => p.id === Number(form.watch("productId"))
  );

  const watchQuantity = form.watch("quantity");
  const watchCurrency = form.watch("currency");

  // Update prices when product, quantity or currency changes
  if (selectedProduct) {
    form.setValue("priceUsd", Number(selectedProduct.priceUsd) * watchQuantity);
    form.setValue("priceIqd", Number(selectedProduct.priceIqd) * watchQuantity);
  }

  async function onSubmit(data: any) {
    await apiRequest("POST", "/api/sales", data);
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
              <FormLabel>Product</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
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
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="IQD">IQD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedProduct && (
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Total ({watchCurrency}):</span>
              <span className="font-bold">
                {watchCurrency === "USD"
                  ? `$${Number(form.watch("priceUsd")).toFixed(2)}`
                  : `${Number(form.watch("priceIqd")).toFixed(2)} IQD`}
              </span>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full">
          Complete Sale
        </Button>
      </form>
    </Form>
  );
}
