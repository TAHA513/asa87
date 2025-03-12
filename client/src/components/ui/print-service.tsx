
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import { Button } from './button';
import { Printer } from 'lucide-react';

interface PrintableContentProps {
  children: React.ReactNode;
  buttonText?: string;
  className?: string;
  contentClassName?: string;
}

export const PrintableContent: React.FC<PrintableContentProps> = ({
  children,
  buttonText = "طباعة",
  className = "",
  contentClassName = ""
}) => {
  const printComponentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={className}>
      <div className="print:block" style={{ display: 'none' }}>
        مطبوع من نظام SAS للإدارة
      </div>
      
      <ReactToPrint
        trigger={() => (
          <Button variant="default" className="mb-4 gap-2">
            <Printer className="h-4 w-4" />
            {buttonText}
          </Button>
        )}
        content={() => printComponentRef.current}
        pageStyle={`
          @page {
            size: auto;
            margin: 10mm;
          }
          @media print {
            body {
              font-family: 'Cairo', sans-serif;
              direction: rtl;
            }
          }
        `}
      />
      
      <div ref={printComponentRef} className={`print-content ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

interface PrintInvoiceProps {
  invoice: any;
  storeSettings: any;
}

export const PrintInvoice: React.FC<PrintInvoiceProps> = ({ invoice, storeSettings }) => {
  const printComponentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <Button variant="default" className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة الفاتورة
          </Button>
        )}
        content={() => printComponentRef.current}
        pageStyle={`
          @page {
            size: 80mm 120mm;
            margin: 0;
          }
          @media print {
            body {
              font-family: 'Cairo', sans-serif;
              direction: rtl;
            }
          }
        `}
      />
      
      <div style={{ display: 'none' }}>
        <div ref={printComponentRef} className="p-4 max-w-[300px] mx-auto bg-white text-black">
          {/* رأس الفاتورة */}
          <div className="text-center mb-4">
            {storeSettings?.enableLogo && storeSettings?.logoUrl && (
              <img src={storeSettings.logoUrl} alt="شعار المتجر" className="mx-auto h-16 mb-2" />
            )}
            <h1 className="text-xl font-bold">{storeSettings?.storeName || 'نظام SAS للإدارة'}</h1>
            <p className="text-sm">{storeSettings?.storeAddress}</p>
            <p className="text-sm">{storeSettings?.storePhone}</p>
            {storeSettings?.taxNumber && (
              <p className="text-sm">الرقم الضريبي: {storeSettings.taxNumber}</p>
            )}
          </div>
          
          {/* معلومات الفاتورة */}
          <div className="border-t border-b border-dashed border-gray-400 py-2 mb-4">
            <div className="flex justify-between">
              <span>رقم الفاتورة:</span>
              <span>{invoice?.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>التاريخ:</span>
              <span>{new Date(invoice?.createdAt).toLocaleDateString('ar-IQ')}</span>
            </div>
            <div className="flex justify-between">
              <span>اسم العميل:</span>
              <span>{invoice?.customerName}</span>
            </div>
          </div>
          
          {/* جدول المشتريات */}
          <table className="w-full mb-4 text-sm">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="text-right">المنتج</th>
                <th className="text-center">الكمية</th>
                <th className="text-left">السعر</th>
                <th className="text-left">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {invoice?.items?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="text-right py-1">{item.productName}</td>
                  <td className="text-center py-1">{item.quantity}</td>
                  <td className="text-left py-1">{item.unitPrice.toLocaleString()}</td>
                  <td className="text-left py-1">{item.totalPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* ملخص الفاتورة */}
          <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
            <div className="flex justify-between">
              <span>المجموع:</span>
              <span>{invoice?.totalAmount.toLocaleString()} د.ع</span>
            </div>
            {invoice?.discountAmount > 0 && (
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span>{invoice?.discountAmount.toLocaleString()} د.ع</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>الإجمالي:</span>
              <span>{invoice?.finalAmount.toLocaleString()} د.ع</span>
            </div>
          </div>
          
          {/* تذييل الفاتورة */}
          <div className="text-center text-sm">
            <p>{storeSettings?.receiptNotes || 'شكراً لتعاملكم معنا'}</p>
            <p className="mt-2">نظام SAS للإدارة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrintReport: React.FC<{ reportData: any; title: string }> = ({ 
  reportData, 
  title 
}) => {
  const printComponentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <Button variant="default" className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة التقرير
          </Button>
        )}
        content={() => printComponentRef.current}
        pageStyle={`
          @page {
            size: A4;
            margin: 15mm;
          }
          @media print {
            body {
              font-family: 'Cairo', sans-serif;
              direction: rtl;
            }
          }
        `}
      />
      
      <div style={{ display: 'none' }}>
        <div ref={printComponentRef} className="p-8 bg-white text-black">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm">تاريخ الإنشاء: {new Date().toLocaleDateString('ar-IQ')}</p>
          </div>
          
          {reportData?.table && (
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-100">
                  {reportData.headers?.map((header: string, index: number) => (
                    <th key={index} className="border border-gray-300 p-2 text-right">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.table?.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? '' : 'bg-gray-50'}>
                    {Object.values(row).map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="border border-gray-300 p-2 text-right">
                        {typeof cell === 'number' ? cell.toLocaleString() : cell?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {reportData?.summary && (
            <div className="border-t border-gray-300 pt-4">
              <h2 className="text-xl font-bold mb-2">ملخص التقرير</h2>
              {Object.entries(reportData.summary).map(([key, value]: [string, any], index: number) => (
                <div key={index} className="flex justify-between mb-1">
                  <span>{key}:</span>
                  <span>{typeof value === 'number' ? value.toLocaleString() : value?.toString()}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center text-xs mt-8 pt-4 border-t border-gray-300">
            <p>تم إنشاء هذا التقرير بواسطة نظام SAS للإدارة</p>
          </div>
        </div>
      </div>
    </div>
  );
};
