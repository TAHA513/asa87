
const fs = require('fs');
const path = require('path');

// قراءة ملف storage.ts
const storageFilePath = path.join(__dirname, 'storage.ts');
const storageContent = fs.readFileSync(storageFilePath, 'utf8');

// التحقق من وجود الدوال المطلوبة
const requiredFunctions = [
  'getSales',
  'getInstallments',
  'getCampaigns'
];

console.log('التحقق من وجود الدوال في ملف storage.ts:');

let missingFunctions = [];

requiredFunctions.forEach(func => {
  if (!storageContent.includes(`async ${func}`)) {
    missingFunctions.push(func);
    console.log(`❌ الدالة '${func}' غير موجودة`);
  } else {
    console.log(`✅ الدالة '${func}' موجودة`);
  }
});

if (missingFunctions.length > 0) {
  console.log('\n⚠️ يجب إضافة الدوال التالية إلى ملف storage.ts:');
  missingFunctions.forEach(func => {
    console.log(`\nasync ${func}() {
  // التنفيذ هنا
}`);
  });
} else {
  console.log('\n✅ جميع الدوال المطلوبة موجودة بالفعل');
}
