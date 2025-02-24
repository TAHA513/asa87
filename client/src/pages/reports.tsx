import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import type { Report, InventoryTransaction } from "@shared/schema";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"inventory" | "sales" | "marketing">("inventory");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: reports = [] } = useQuery<Report[]>({
    queryKey: ["/api/reports", reportType],
  });

  const { data: inventoryTransactions = [] } = useQuery<InventoryTransaction[]>({
    queryKey: ["/api/inventory/transactions"],
  });

  // تحليل بيانات المخزون
  const inventoryData = inventoryTransactions.reduce((acc, transaction) => {
    const date = format(new Date(transaction.date), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = { in: 0, out: 0 };
    }
    if (transaction.type === "in") {
      acc[date].in += transaction.quantity;
    } else {
      acc[date].out += transaction.quantity;
    }
    return acc;
  }, {} as Record<string, { in: number; out: number }>);

  const inventoryChartData = Object.entries(inventoryData).map(([date, data]) => ({
    date,
    دخول: data.in,
    خروج: data.out,
  }));

  // تجميع البيانات حسب نوع الحركة
  const transactionsByType = inventoryTransactions.reduce((acc, transaction) => {
    if (!acc[transaction.reason]) {
      acc[transaction.reason] = 0;
    }
    acc[transaction.reason] += transaction.quantity;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(transactionsByType).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">التقارير</h1>
            <div className="flex items-center gap-4">
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">تقارير المخزون</SelectItem>
                  <SelectItem value="sales">تقارير المبيعات</SelectItem>
                  <SelectItem value="marketing">تقارير التسويق</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-right font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {date ? (
                      format(date, "PPP", { locale: ar })
                    ) : (
                      <span>اختر تاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>حركة المخزون</CardTitle>
                <CardDescription>تحليل حركة الدخول والخروج للمخزون</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={inventoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="دخول" stroke="#8884d8" />
                      <Line type="monotone" dataKey="خروج" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع حركات المخزون</CardTitle>
                  <CardDescription>تحليل أنواع الحركات في المخزون</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {pieChartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ملخص الحركات</CardTitle>
                  <CardDescription>إحصائيات سريعة عن حركة المخزون</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(transactionsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="font-medium">{type}</span>
                        <span className="text-2xl font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
