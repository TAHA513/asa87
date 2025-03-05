import Sidebar from '@/components/layout/sidebar';
import InventoryTable from '@/components/inventory/inventory-table';

export default function Inventory() {
  return (
    <div className="flex h-screen">
      <div className="h-full w-64">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl">
          <InventoryTable />
        </div>
      </main>
    </div>
  );
}
