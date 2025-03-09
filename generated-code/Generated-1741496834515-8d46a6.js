// 
        قم بتحليل سريع لهذا الطلب: "احتاج ان اطور واجهية النضام افحثها وقدم لي اشاء متطور" 
        واكتب رداً قصيراً يوضح فهمك للطلب وكيف ستساعد.
        الرد يجب أن يكون ودوداً وتفاعلياً ومباشراً، بأسلوب محادثة طبيعي.
      

// تحليل البيانات لـ 
        قم بتحليل سريع لهذا الطلب: "احتاج ان اطور واجهية النضام افحثها وقدم لي اشاء متطور" 
        واكتب رداً قصيراً يوضح فهمك للطلب وكيف ستساعد.
        الرد يجب أن يكون ودوداً وتفاعلياً ومباشراً، بأسلوب محادثة طبيعي.
      
/**
 * وظيفة لتحليل البيانات وإنشاء تقرير شامل
 * @param {Array} data - مصفوفة من البيانات للتحليل
 * @param {Object} options - خيارات التحليل
 * @returns {Object} - تقرير التحليل
 */
export async function analyzeData(data, options = {}) {
  console.log("بدء تحليل البيانات:", data.length, "سجل");

  // التحقق من صحة البيانات
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("البيانات غير صالحة أو فارغة");
  }

  // تجميع الإحصائيات الأساسية
  const stats = {
    count: data.length,
    categories: {},
    timeSeries: {},
    topItems: [],
    summary: {}
  };

  // تحليل الفئات
  data.forEach(item => {
    if (item.category) {
      stats.categories[item.category] = (stats.categories[item.category] || 0) + 1;
    }

    // تحليل السلسلة الزمنية إذا كان هناك تاريخ
    if (item.date) {
      const date = new Date(item.date).toISOString().split('T')[0];
      stats.timeSeries[date] = (stats.timeSeries[date] || 0) + 1;
    }

    // حساب المجاميع
    if (item.value && typeof item.value === 'number') {
      stats.summary.total = (stats.summary.total || 0) + item.value;
      stats.summary.count = (stats.summary.count || 0) + 1;
    }
  });

  // حساب المتوسط
  if (stats.summary.count > 0) {
    stats.summary.average = stats.summary.total / stats.summary.count;
  }

  // ترتيب العناصر حسب القيمة
  stats.topItems = [...data]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 5);

  console.log("اكتمل التحليل بنجاح");
  return stats;
}

// تنفيذ تحليل البيانات
analyzeData(sampleData)
  .then(report => console.log("تقرير التحليل:", report))
  .catch(error => console.error("خطأ في التحليل:", error));