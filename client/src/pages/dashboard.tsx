import Sidebar from "@/components/layout/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import SalesChart from "@/components/dashboard/sales-chart";
import ExchangeRateCard from "@/components/dashboard/exchange-rate";

export default function Dashboard() {
  return (
    <div className="flex h-screen">
      <div className="w-64 h-full">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>
          <StatsCards />
          <div className="grid gap-4 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ExchangeRateCard />
              <div className="col-span-3">
                <SalesChart />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}