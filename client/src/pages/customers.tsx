import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserRound, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Customer, type Sale } from "@shared/schema";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/customers?${params.toString()}`);
      return res.json();
    },
  });

  const { data: customerSales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/customers", selectedCustomer?.id, "sales"],
    enabled: !!selectedCustomer,
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <UserRound className="h-6 w-6" />
          <h1 className="text-2xl font-bold">العملاء</h1>
        </div>

        <div className="relative w-64">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن العملاء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* قائمة العملاء */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء</CardTitle>
            <CardDescription>
              {customers.length} عميل
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div>
                    <h3 className="font-medium">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* تفاصيل العميل والمشتريات */}
        {selectedCustomer && (
          <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>تفاصيل العميل - {selectedCustomer.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* معلومات العميل */}
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">رقم الهاتف:</span>
                        <span>{selectedCustomer.phone || "غير متوفر"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">البريد الإلكتروني:</span>
                        <span>{selectedCustomer.email || "غير متوفر"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">العنوان:</span>
                        <span>{selectedCustomer.address || "غير متوفر"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* المشتريات */}
                <Card>
                  <CardHeader>
                    <CardTitle>سجل المشتريات</CardTitle>
                    <CardDescription>
                      {customerSales.length} عملية شراء
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {sale.productId} {/* سيتم استبدالها باسم المنتج */}
                            </span>
                            <span>
                              {Number(sale.priceIqd).toLocaleString()} د.ع
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>الكمية: {sale.quantity}</span>
                            <span>
                              {new Date(sale.date).toLocaleDateString("ar-IQ")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
