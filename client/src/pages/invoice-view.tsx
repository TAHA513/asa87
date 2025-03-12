
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { PrintInvoice } from "@/components/ui/print-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ExportToPDF } from "@/components/ui/export-service";

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [storeSettings, setStoreSettings] = useState<any>(null);

  // جلب بيانات الفاتورة
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: [`/api/invoices/${id}`],
    queryFn: async () => {
      return await apiRequest("GET", `/api/invoices/${id}`);
    },
    enabled: !!id,
  });

  // جلب إعدادات المتجر
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const settings = await apiRequest("GET", `/api/store-settings`);
        setStoreSettings(settings);
      } catch (error) {
        console.error("خطأ في جلب إعدادات المتجر:", error);
      }
    };

    fetchStoreSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-bold mb-4">فشل في تحميل الفاتورة</h1>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "حدث خطأ أثناء تحميل بيانات الفاتورة"}
        </p>
        <Button onClick={() => navigate("/invoices")}>
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى الفواتير
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">تفاصيل الفاتورة</h1>
          <p className="text-muted-foreground">رقم الفاتورة: {invoice.invoiceNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/invoices")}>
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة
          </Button>
          <PrintInvoice invoice={invoice} storeSettings={storeSettings} />
          <ExportToPDF 
            data={[
              { 
                المنتج: invoice.items?.[0]?.productName || `منتج #${invoice.items?.[0]?.productId}`,
                الكمية: invoice.items?.[0]?.quantity,
                السعر: invoice.items?.[0]?.unitPrice,
                الإجمالي: invoice.items?.[0]?.totalPrice
              }
            ]}
            headers={["المنتج", "الكمية", "السعر", "الإجمالي"]}
            title={`فاتورة رقم ${invoice.invoiceNumber}`}
            filename={`فاتورة-${invoice.invoiceNumber}`}
            buttonText="تحميل PDF"
          />
          <Button variant="outline">
            <Share2 className="ml-2 h-4 w-4" />
            مشاركة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>تفاصيل المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3">المنتج</th>
                    <th scope="col" className="px-6 py-3">الكمية</th>
                    <th scope="col" className="px-6 py-3">سعر الوحدة</th>
                    <th scope="col" className="px-6 py-3">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, index: number) => (
                    <tr key={index} className="bg-card border-b">
                      <td className="px-6 py-4 font-medium">{item.productName || `منتج #${item.productId}`}</td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">{item.unitPrice.toLocaleString()} د.ع</td>
                      <td className="px-6 py-4">{item.totalPrice.toLocaleString()} د.ع</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع:</span>
                <span>{invoice.totalAmount.toLocaleString()} د.ع</span>
              </div>
              
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الخصم:</span>
                  <span>- {invoice.discountAmount.toLocaleString()} د.ع</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>الإجمالي:</span>
                <span>{invoice.finalAmount.toLocaleString()} د.ع</span>
              </div>
              
              <div className="flex justify-between text-sm mt-6">
                <span className="text-muted-foreground">تاريخ الإصدار:</span>
                <span>{new Date(invoice.createdAt).toLocaleDateString('ar-IQ')}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">طريقة الدفع:</span>
                <span>
                  {invoice.paymentMethod === 'cash' ? 'نقدي' : 
                   invoice.paymentMethod === 'card' ? 'بطاقة ائتمان' : 
                   invoice.paymentMethod === 'transfer' ? 'تحويل بنكي' : 
                   invoice.paymentMethod}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الحالة:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  invoice.status === 'active' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status === 'active' ? 'نشط' :
                   invoice.status === 'cancelled' ? 'ملغي' :
                   invoice.status === 'modified' ? 'معدل' : invoice.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>معلومات العميل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">بيانات العميل</h3>
              <p className="text-sm">الاسم: {invoice.customerName}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">ملاحظات</h3>
              <p className="text-sm">{invoice.notes || 'لا توجد ملاحظات'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
