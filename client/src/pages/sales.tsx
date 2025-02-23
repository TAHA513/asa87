import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import NewSale from "@/components/sales/new-sale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Sale, Product } from "@shared/schema";

export default function Sales() {
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  A list of all sales transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => {
                      const product = products.find((p) => p.id === sale.productId);
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>{product?.name}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>
                            {sale.currency === "USD"
                              ? `$${Number(sale.priceUsd).toFixed(2)}`
                              : `${Number(sale.priceIqd).toFixed(2)} IQD`}
                          </TableCell>
                          <TableCell>
                            {new Date(sale.date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>New Sale</CardTitle>
              <CardDescription>Create a new sales transaction.</CardDescription>
            </CardHeader>
            <CardContent>
              <NewSale />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
