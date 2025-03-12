
// اختبار دوال storage
const { storage } = require('./storage');

async function testFunctions() {
  try {
    console.log('=== اختبار دوال التخزين ===');
    
    console.log('\nاختبار دالة getSales:');
    const sales = await storage.getSales();
    console.log(`- تم استرجاع ${sales.length} عملية بيع.`);
    
    console.log('\nاختبار دالة getInstallments:');
    const installments = await storage.getInstallments();
    console.log(`- تم استرجاع ${installments.length} عملية تقسيط.`);
    
    console.log('\nاختبار دالة getCampaigns:');
    const campaigns = await storage.getCampaigns();
    console.log(`- تم استرجاع ${campaigns.length} حملة.`);
    
    console.log('\n=== تم الاختبار بنجاح ===');
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار الدوال:', error);
  }
}

testFunctions();
