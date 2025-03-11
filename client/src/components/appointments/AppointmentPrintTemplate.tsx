
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Appointment {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: number;
  status: string;
  customerName?: string;
}

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  logoUrl: string;
  enableLogo: boolean;
}

export const AppointmentPrintTemplate = ({ 
  appointment, 
  onPrint 
}: { 
  appointment: Appointment, 
  onPrint?: () => void 
}) => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "",
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
    logoUrl: "",
    enableLogo: true
  });

  useEffect(() => {
    // جلب إعدادات المتجر
    const fetchStoreSettings = async () => {
      try {
        const response = await fetch('/api/store-settings');
        if (response.ok) {
          const data = await response.json();
          setStoreSettings(data);
        }
      } catch (error) {
        console.error("Error fetching store settings:", error);
      }
    };

    fetchStoreSettings();
  }, []);

  // تنسيق التاريخ والوقت بالعربية
  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, 'PPP', { locale: ar });
  const formattedTime = format(appointmentDate, 'p', { locale: ar });

  return (
    <div className="bg-white p-8 max-w-md mx-auto shadow-md print:shadow-none print:p-1">
      {/* رأس الصفحة مع شعار المتجر */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{storeSettings.storeName}</h1>
          {storeSettings.storeAddress && (
            <p className="text-gray-500 text-sm">{storeSettings.storeAddress}</p>
          )}
          {storeSettings.storePhone && (
            <p className="text-gray-500 text-sm">هاتف: {storeSettings.storePhone}</p>
          )}
        </div>

        {storeSettings.enableLogo && storeSettings.logoUrl && (
          <div>
            <img 
              src={storeSettings.logoUrl} 
              alt="شعار المتجر" 
              className="h-16 object-contain"
            />
          </div>
        )}
      </div>

      {/* تأكيد الموعد */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold">تأكيد الموعد</h2>
        <p className="text-gray-600 text-sm">رقم الموعد: {appointment.id}</p>
      </div>

      {/* بطاقة معلومات الموعد */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-3 text-center border-b pb-2">{appointment.title}</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold">التاريخ:</span>
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">الوقت:</span>
            <span>{formattedTime}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">المدة:</span>
            <span>{appointment.duration} دقيقة</span>
          </div>
          
          {appointment.customerName && (
            <div className="flex justify-between">
              <span className="font-semibold">العميل:</span>
              <span>{appointment.customerName}</span>
            </div>
          )}
          
          {appointment.description && (
            <div className="mt-3">
              <p className="font-semibold">الوصف:</p>
              <p className="text-gray-700 text-sm mt-1">{appointment.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ملاحظات */}
      <div className="text-sm text-gray-600 mb-6">
        <p>* يرجى الحضور قبل الموعد بـ 10 دقائق</p>
        <p>* في حالة الرغبة بإلغاء الموعد، يرجى إبلاغنا قبل الموعد بيوم على الأقل</p>
      </div>

      {/* معلومات الاتصال */}
      <div className="border-t pt-4 text-center text-sm text-gray-600">
        {storeSettings.storePhone && <p>للاستفسار: {storeSettings.storePhone}</p>}
        {storeSettings.storeEmail && <p>{storeSettings.storeEmail}</p>}
      </div>

      {/* زر الطباعة (يظهر فقط على الشاشة وليس عند الطباعة) */}
      {onPrint && (
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={onPrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            طباعة الموعد
          </button>
        </div>
      )}
    </div>
  );
};
