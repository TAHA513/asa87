import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; 
import { Loader2 } from "lucide-react"; 


interface InvoiceItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: InvoiceItem[];
}

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  taxNumber: string;
  logoUrl: string;
  receiptNotes: string;
  enableLogo: boolean;
}

export const InvoiceTemplate = ({ invoice, onPrint }: { invoice: Invoice, onPrint?: () => void }) => {

  const { data: storeSettings, isLoading } = useQuery({
    queryKey: ["/api/store-settings"],
    queryFn: async () => {
      return await apiRequest("GET", "/api/store-settings");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  const formattedDate = format(new Date(invoice.createdAt), 'PPP', { locale: ar });

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-md print:shadow-none print:p-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{storeSettings?.storeName || "اسم المتجر"}</h1>
          {storeSettings?.storeAddress && (
            <p className="text-gray-500">{storeSettings.storeAddress}</p>
          )}
          {storeSettings?.storePhone && (
            <p className="text-gray-500">هاتف: {storeSettings.storePhone}</p>
          )}
          {storeSettings?.storeEmail && (
            <p className="text-gray-500">{storeSettings.storeEmail}</p>
          )}
        </div>

        {storeSettings?.enableLogo && storeSettings?.logoUrl && (
          <div>
            <img
              src={storeSettings.logoUrl}
              alt="شعار المتجر"
              className="h-20 object-contain"
            />
          </div>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded-md mb-6 flex flex-wrap justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-2">فاتورة #{invoice.invoiceNumber}</h2>
          <p className="text-gray-600">التاريخ: {formattedDate}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">العميل</h2>
          <p className="text-gray-600">{invoice.customerName}</p>
        </div>
        {storeSettings?.taxNumber && (
          <div>
            <h2 className="text-lg font-semibold mb-2">الرقم الضريبي</h2>
            <p className="text-gray-600">{storeSettings.taxNumber}</p>
          </div>
        )}
      </div>

      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-right">#</th>
            <th className="p-2 text-right">المنتج</th>
            <th className="p-2 text-right">الكمية</th>
            <th className="p-2 text-right">سعر الوحدة</th>
            <th className="p-2 text-right">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="p-2 border-b">{index + 1}</td>
              <td className="p-2 border-b">{item.productName}</td>
              <td className="p-2 border-b">{item.quantity}</td>
              <td className="p-2 border-b">{item.unitPrice.toLocaleString()} د.ع</td>
              <td className="p-2 border-b">{item.totalPrice.toLocaleString()} د.ع</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={4} className="p-2 text-left">الإجمالي</td>
            <td className="p-2">{invoice.totalAmount.toLocaleString()} د.ع</td>
          </tr>
        </tfoot>
      </table>

      {storeSettings?.receiptNotes && (
        <div className="border-t pt-4 mb-6">
          <h3 className="font-semibold mb-2">ملاحظات:</h3>
          <p className="text-gray-600">{storeSettings.receiptNotes}</p>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        <div className="border-t border-gray-300 pt-2 w-40 text-center">
          <p className="text-sm text-gray-600">توقيع المستلم</p>
        </div>
        <div className="border-t border-gray-300 pt-2 w-40 text-center">
          <p className="text-sm text-gray-600">توقيع البائع</p>
        </div>
      </div>

      {onPrint && (
        <div className="mt-8 text-center print:hidden">
          <button
            onClick={onPrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            طباعة الفاتورة
          </button>
        </div>
      )}
    </div>
  );
};