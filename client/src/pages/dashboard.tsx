import Sidebar from '@/components/layout/sidebar';
import StatsCards from '@/components/dashboard/stats-cards';
import {
  SalesTrendsChart,
  ProductPerformanceChart,
  CustomerGrowthChart,
} from '@/components/dashboard/analytics-charts';
import ExchangeRateCard from '@/components/dashboard/exchange-rate';

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      <div className="h-full w-64">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>

          {/* إحصائيات سريعة */}
          <StatsCards />

          {/* الرسوم البيانية التفاعلية */}
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <ExchangeRateCard />
              <div className="md:col-span-3">
                <SalesTrendsChart />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ProductPerformanceChart />
              <CustomerGrowthChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
