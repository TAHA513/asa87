
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
