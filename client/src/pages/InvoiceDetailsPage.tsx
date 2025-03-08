import { useQuery } from "@tanstack/react-query";
import { Invoice, InvoiceHistory, InvoiceItem } from "@shared/schema";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileEdit, Printer, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { InvoiceHistoryList } from "@/components/invoices/InvoiceHistoryList";

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: invoice, isLoading: isLoadingInvoice } = useQuery<Invoice>({
    queryKey: ["/api/invoices", id],
  });

  const { data: items, isLoading: isLoadingItems } = useQuery<InvoiceItem[]>({
    queryKey: ["/api/invoices", id, "items"],
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery<InvoiceHistory[]>({
    queryKey: ["/api/invoices", id, "history"],
  });

  if (isLoadingInvoice || isLoadingItems || isLoadingHistory) {
    return <div>جاري التحميل...</div>;
  }

  if (!invoice) {
    return <div>الفاتورة غير موجودة</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost">
              <ArrowRight className="ml-2 h-4 w-4" />
              عودة للفواتير
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            فاتورة رقم {invoice.invoiceNumber}
          </h1>
          <Badge
            variant={
              invoice.status === "active"
                ? "default"
                : invoice.status === "modified"
                ? "warning"
                : "destructive"
            }
          >
            {invoice.status === "active"
              ? "نشط"
              : invoice.status === "modified"
              ? "معدل"
              : "ملغي"}
          </Badge>
        </div>
        <div className="flex gap-2">
          {invoice.status === "active" && (
            <>
              <Button variant="outline" asChild>
                <Link to={`/invoices/${id}/edit`}>
                  <FileEdit className="ml-2 h-4 w-4" />
                  تعديل
                </Link>
              </Button>
              <Button variant="destructive">
                <XCircle className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            </>
          )}
          <Button>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt>رقم الفاتورة</dt>
                <dd>{invoice.invoiceNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt>اسم العميل</dt>
                <dd>{invoice.customerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt>تاريخ الإنشاء</dt>
                <dd>{new Date(invoice.createdAt).toLocaleDateString("ar-IQ")}</dd>
              </div>
              <div className="flex justify-between">
                <dt>طريقة الدفع</dt>
                <dd>
                  {invoice.paymentMethod === "cash"
                    ? "نقدي"
                    : invoice.paymentMethod === "card"
                    ? "بطاقة"
                    : "تحويل"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المبالغ</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt>المبلغ الإجمالي</dt>
                <dd>
                  {new Intl.NumberFormat("ar-IQ", {
                    style: "currency",
                    currency: "IQD",
                  }).format(parseFloat(invoice.totalAmount))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>الخصم</dt>
                <dd>
                  {new Intl.NumberFormat("ar-IQ", {
                    style: "currency",
                    currency: "IQD",
                  }).format(parseFloat(invoice.discountAmount))}
                </dd>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <dt>المبلغ النهائي</dt>
                <dd>
                  {new Intl.NumberFormat("ar-IQ", {
                    style: "currency",
                    currency: "IQD",
                  }).format(parseFloat(invoice.finalAmount))}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-2">المنتج</th>
                <th className="text-right py-2">الكمية</th>
                <th className="text-right py-2">السعر</th>
                <th className="text-right py-2">الخصم</th>
                <th className="text-right py-2">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{item.productId}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">
                    {new Intl.NumberFormat("ar-IQ", {
                      style: "currency",
                      currency: "IQD",
                    }).format(parseFloat(item.unitPrice))}
                  </td>
                  <td className="py-2">
                    {new Intl.NumberFormat("ar-IQ", {
                      style: "currency",
                      currency: "IQD",
                    }).format(parseFloat(item.discount))}
                  </td>
                  <td className="py-2">
                    {new Intl.NumberFormat("ar-IQ", {
                      style: "currency",
                      currency: "IQD",
                    }).format(parseFloat(item.totalPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {history && history.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>سجل التغييرات</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceHistoryList history={history} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
