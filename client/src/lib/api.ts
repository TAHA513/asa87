
// وظائف API الافتراضية
export const api = {
  // وظيفة للحصول على المنتجات
  getProducts: async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('فشل في جلب المنتجات');
      }
      return await response.json();
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
      return [];
    }
  },
  
  // وظيفة للحصول على العملاء
  getCustomers: async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('فشل في جلب العملاء');
      }
      return await response.json();
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error);
      return [];
    }
  }
};
// وظائف واجهة برمجة التطبيقات

export const apiUrl = process.env.NODE_ENV === 'production' ? '' : '';

export async function generateBarcode(text: string) {
  try {
    // استدعاء واجهة برمجة التطبيقات للحصول على الباركود
    // هذه دالة وهمية، يجب استبدالها باستدعاء فعلي للخادم
    // في الوقت الحالي سنعيد النص كما هو
    return text;
  } catch (error) {
    console.error("خطأ في إنشاء الباركود:", error);
    throw error;
  }
}

export async function printBarcode(elementToPrint: HTMLElement) {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error("لم يتم فتح نافذة الطباعة");
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>طباعة الباركود</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .barcode-container { text-align: center; margin: 20px; }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            ${elementToPrint.innerHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // انتظر تحميل المحتوى قبل الطباعة
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    return true;
  } catch (error) {
    console.error("خطأ في طباعة الباركود:", error);
    throw error;
  }
}
