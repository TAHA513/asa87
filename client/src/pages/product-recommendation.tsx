import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/sidebar";
import { ProductRecommendations } from "@/components/ai/product-recommendations";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function ProductRecommendation() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const isLoading = productsLoading || customersLoading;

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">توصيات المنتجات</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>اختيار المنتج أو العميل</CardTitle>
              <CardDescription>
                حدد منتجًا لرؤية المنتجات ذات الصلة، أو حدد عميلًا لرؤية التوصيات المخصصة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium">اختر منتجًا:</label>
                    <Select
                      onValueChange={(value) => {
                        setSelectedProductId(Number(value));
                        setSelectedCustomerId(null);
                      }}
                      value={selectedProductId?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر منتجًا" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-center md:pt-8">
                    <span className="px-4">أو</span>
                  </div>
                  
                  <div className="w-full md:w-1/2 space-y-2">
                    <label className="text-sm font-medium">اختر عميلًا:</label>
                    <Select
                      onValueChange={(value) => {
                        setSelectedCustomerId(Number(value));
                        setSelectedProductId(null);
                      }}
                      value={selectedCustomerId?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر عميلًا" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <ProductRecommendations 
            customerId={selectedCustomerId || undefined} 
            currentProductId={selectedProductId || undefined}
          />
        </div>
      </main>
    </div>
  );
}