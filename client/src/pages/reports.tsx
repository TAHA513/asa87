import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';
import { cn } from '@/lib/utils';
import type { InventoryTransaction } from '@shared/schema';

const EmptyState = () => (
  <Card>
    <CardHeader>
      <CardTitle>لا توجد بيانات</CardTitle>
      <CardDescription>
        لم يتم تسجيل أي حركات مخزون بعد. عندما تبدأ في استخدام النظام، ستظهر هنا تقارير وإحصائيات
        مفصلة.
      </CardDescription>
    </CardHeader>
  </Card>
);

const LoadingState = () => (
  <div className="flex h-[400px] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-border" />
  </div>
);

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'inventory' | 'sales' | 'marketing'>('inventory');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: inventoryTransactions = [], isLoading } = useQuery<InventoryTransaction[]>({
    queryKey: ['/api/inventory/transactions'],
  });

  return (
    <div className="flex h-screen">
      <div className="h-full w-64">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
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
                    variant={'outline'}
                    className={cn(
                      'w-[240px] justify-start text-right font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {date ? format(date, 'PPP', { locale: ar }) : <span>اختر تاريخ</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : !inventoryTransactions.length ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>حركة المخزون</CardTitle>
                  <CardDescription>تحليل حركة الدخول والخروج للمخزون</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={inventoryTransactions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={date => format(new Date(date), 'MM/dd')}
                        />
                        <YAxis />
                        <Tooltip labelFormatter={date => format(new Date(date), 'PP')} />
                        <Line type="monotone" dataKey="quantity" name="الكمية" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
