
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { PrintReport } from "@/components/ui/print-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ExportToPDF, ExportToExcel } from "@/components/ui/export-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PrintReportPage() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reportData, setReportData] = useState<any>(null);
  const [title, setTitle] = useState<string>("");

  // جلب بيانات التقرير
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/reports/${type}`, id],
    queryFn: async () => {
      if (type === 'sales') {
        return await apiRequest("GET", `/api/reports/sales?startDate=${encodeURIComponent(id!.split(',')[0])}&endDate=${encodeURIComponent(id!.split(',')[1])}`);
      } else if (type === 'inventory') {
        return await apiRequest("GET", `/api/reports/inventory?startDate=${encodeURIComponent(id!.split(',')[0])}&endDate=${encodeURIComponent(id!.split(',')[1])}`);
      } else if (type === 'financial') {
        return await apiRequest("GET", `/api/reports/financial?startDate=${encodeURIComponent(id!.split(',')[0])}&endDate=${encodeURIComponent(id!.split(',')[1])}`);
      } else if (type === 'appointments') {
        return await apiRequest("GET", `/api/reports/appointments?startDate=${encodeURIComponent(id!.split(',')[0])}&endDate=${encodeURIComponent(id!.split(',')[1])}`);
      } else {
        return await apiRequest("GET", `/api/reports/${id}`);
      }
    },
    enabled: !!id && !!type,
  });

  useEffect(() => {
    if (data) {
      // تنسيق بيانات التقرير بناءً على نوع التقرير
      let formattedData: any = { headers: [], table: [], summary: {} };
      let reportTitle = "";

      switch (type) {
        case 'sales':
          reportTitle = "تقرير المبيعات";
          formattedData.headers = ["#", "التاريخ", "اسم المنتج", "السعر", "الكمية", "الإجمالي"];
          formattedData.table = data.sales?.map((sale: any, index: number) => ({
            id: index + 1,
            date: new Date(sale.date).toLocaleDateString('ar-IQ'),
            productName: sale.productName || `منتج #${sale.productId}`,
            price: sale.priceIqd,
            quantity: sale.quantity,
            total: sale.finalPriceIqd
          }));
          formattedData.summary = {
            "إجمالي المبيعات": data.totalSales,
            "عدد المبيعات": data.sales?.length || 0,
            "متوسط قيمة البيع": data.averageSale
          };
          break;

        case 'inventory':
          reportTitle = "تقرير المخزون";
          formattedData.headers = ["#", "اسم المنتج", "الكمية المتاحة", "الحد الأدنى", "الحالة"];
          formattedData.table = data.products?.map((product: any, index: number) => ({
            id: index + 1,
            name: product.name,
            stock: product.stock,
            minQuantity: product.minQuantity,
            status: product.stock <= product.minQuantity ? "منخفض" : "متوفر"
          }));
          formattedData.summary = {
            "إجمالي المنتجات": data.products?.length || 0,
            "المنتجات منخفضة المخزون": data.lowStockCount || 0
          };
          break;

        case 'financial':
          reportTitle = "التقرير المالي";
          formattedData.headers = ["البند", "القيمة (د.ع)"];
          formattedData.table = [
            { item: "إجمالي المبيعات", value: data.totalSales },
            { item: "إجمالي المصروفات", value: data.totalExpenses },
            { item: "صافي الربح", value: data.netProfit }
          ];
          formattedData.summary = {
            "الفترة": `${new Date(id!.split(',')[0]).toLocaleDateString('ar-IQ')} إلى ${new Date(id!.split(',')[1]).toLocaleDateString('ar-IQ')}`,
            "نسبة الربح": `${data.profitMargin}%`
          };
          break;

        case 'appointments':
          reportTitle = "تقرير المواعيد";
          formattedData.headers = ["#", "العنوان", "العميل", "التاريخ", "المدة", "الحالة"];
          formattedData.table = data.appointments?.map((appointment: any, index: number) => ({
            id: index + 1,
            title: appointment.title,
            customer: appointment.customerName || "غير محدد",
            date: new Date(appointment.date).toLocaleDateString('ar-IQ'),
            duration: `${appointment.duration} دقيقة`,
            status: appointment.status === 'scheduled' ? 'مجدول' :
                    appointment.status === 'completed' ? 'مكتمل' :
                    appointment.status === 'cancelled' ? 'ملغي' : appointment.status
          }));
          formattedData.summary = {
            "إجمالي المواعيد": data.total || 0,
            "المواعيد المكتملة": data.completed || 0,
            "المواعيد الملغاة": data.cancelled || 0
          };
          break;

        default:
          reportTitle = data.name || "تقرير";
          if (data.headers) {
            formattedData.headers = data.headers;
          }
          if (data.data) {
            formattedData.table = data.data;
          }
          if (data.summary) {
            formattedData.summary = data.summary;
          }
      }

      setReportData(formattedData);
      setTitle(reportTitle);
    }
  }, [data, type, id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-bold mb-4">فشل في تحميل التقرير</h1>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "حدث خطأ أثناء تحميل بيانات التقرير"}
        </p>
        <Button onClick={() => navigate("/reports")}>
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى التقارير
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            {type === 'sales' || type === 'inventory' || type === 'financial' || type === 'appointments' ? 
              `الفترة: ${new Date(id!.split(',')[0]).toLocaleDateString('ar-IQ')} إلى ${new Date(id!.split(',')[1]).toLocaleDateString('ar-IQ')}` :
              `تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/reports")}>
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة
          </Button>
          {reportData && <PrintReport reportData={reportData} title={title} />}
          <ExportToPDF 
            data={reportData?.table || []}
            headers={reportData?.headers || []}
            title={title}
            filename={title.replace(/\s+/g, '-')}
            buttonText="تحميل PDF"
          />
          <ExportToExcel 
            data={reportData?.table || []}
            filename={title.replace(/\s+/g, '-')}
            buttonText="تحميل Excel"
          />
          <Button variant="outline">
            <Share2 className="ml-2 h-4 w-4" />
            مشاركة
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>محتوى التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData?.table && reportData.table.length > 0 && (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {reportData.headers?.map((header: string, index: number) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.table?.map((row: any, rowIndex: number) => (
                    <TableRow key={rowIndex}>
                      {Object.values(row).map((cell: any, cellIndex: number) => (
                        <TableCell key={cellIndex}>
                          {typeof cell === 'number' ? cell.toLocaleString() : cell?.toString()}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {reportData?.summary && Object.keys(reportData.summary).length > 0 && (
            <div className="mt-6 p-4 border rounded">
              <h2 className="text-xl font-bold mb-4">ملخص التقرير</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(reportData.summary).map(([key, value]: [string, any], index: number) => (
                  <div key={index} className="flex justify-between p-2 border-b">
                    <span className="font-medium">{key}:</span>
                    <span>{typeof value === 'number' ? value.toLocaleString() : value?.toString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
