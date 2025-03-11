import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AppointmentPrintTemplateProps {
  appointment: any;
  customer?: any;
  isPrinting?: boolean;
}

export function AppointmentPrintTemplate({
  appointment,
  customer,
  isPrinting = false
}: AppointmentPrintTemplateProps) {
  if (!appointment) return null;

  // جلب إعدادات المتجر
  const { data: storeSettings, isLoading } = useQuery({
    queryKey: ["/api/store-settings"],
    queryFn: async () => {
      return await apiRequest("GET", "/api/store-settings");
    },
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'مجدول';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow max-w-3xl mx-auto ${isPrinting ? 'print:shadow-none print:p-0' : ''}`}>
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">تأكيد الموعد</h1>
          <p className="text-gray-600">رقم المرجع: {appointment.id}</p>
        </div>
        <div className="text-left">
          {storeSettings?.enableLogo && storeSettings?.logoUrl && (
            <img 
              src={storeSettings.logoUrl} 
              alt="شعار المتجر" 
              className="h-16 mb-2 object-contain" 
            />
          )}
          <h2 className="text-xl font-bold">{storeSettings?.storeName || "نظام SAS للإدارة"}</h2>
          {storeSettings?.storeAddress && (
            <p className="text-gray-600">{storeSettings.storeAddress}</p>
          )}
          {storeSettings?.storePhone && (
            <p className="text-gray-600">هاتف: {storeSettings.storePhone}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b pb-1">تفاصيل الموعد</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">العنوان:</span>
              <span>{appointment.title}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">التاريخ:</span>
              <span dir="ltr">{formatDate(new Date(appointment.date))}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">الوقت:</span>
              <span dir="ltr">{formatTime(appointment.date)}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">المدة:</span>
              <span>{appointment.duration} دقيقة</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">الحالة:</span>
              <span className={getStatusClass(appointment.status)}>
                {getStatusText(appointment.status)}
              </span>
            </div>
          </div>

          {appointment.description && (
            <div className="mt-4">
              <h4 className="font-medium">الوصف:</h4>
              <p className="text-gray-700 mt-1 whitespace-pre-line">{appointment.description}</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 border-b pb-1">معلومات العميل</h3>

          {customer ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">الاسم:</span>
                <span>{customer.name}</span>
              </div>

              {customer.phone && (
                <div className="flex justify-between">
                  <span className="font-medium">الهاتف:</span>
                  <span dir="ltr">{customer.phone}</span>
                </div>
              )}

              {customer.email && (
                <div className="flex justify-between">
                  <span className="font-medium">البريد الإلكتروني:</span>
                  <span>{customer.email}</span>
                </div>
              )}

              {customer.address && (
                <div className="flex justify-between">
                  <span className="font-medium">العنوان:</span>
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">لا توجد معلومات للعميل</p>
          )}

          {appointment.notes && (
            <div className="mt-4">
              <h4 className="font-medium">ملاحظات:</h4>
              <p className="text-gray-700 mt-1 whitespace-pre-line">{appointment.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 border-t pt-4 text-center text-gray-500">
        <p className="text-sm">يرجى الحضور قبل الموعد بـ 10 دقائق</p>
        {storeSettings?.storePhone && (
          <p className="text-sm mt-1">لإلغاء أو تغيير الموعد، يرجى الاتصال بنا على الرقم {storeSettings.storePhone}</p>
        )}
        <p className="text-sm mt-3">{storeSettings?.receiptNotes || `شكراً لكم - ${storeSettings?.storeName || 'نظام SAS للإدارة'}`}</p>
      </div>

      {isPrinting && (
        <div className="mt-6 text-xs text-gray-400 text-center">
          <p>تم إصدار هذا المستند في {new Date().toLocaleString('ar-IQ')}</p>
        </div>
      )}
    </div>
  );
}