
import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">لوحة التحكم</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="font-semibold">المبيعات</h3>
          <p className="text-2xl font-bold">١٢٣٤٥ ريال</p>
        </div>
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="font-semibold">العملاء</h3>
          <p className="text-2xl font-bold">٤٥</p>
        </div>
        <div className="rounded-lg border p-4 shadow-sm">
          <h3 className="font-semibold">المنتجات</h3>
          <p className="text-2xl font-bold">٨٩</p>
        </div>
      </div>
    </div>
  );
}
