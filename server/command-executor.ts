import fs from 'fs/promises';
import path from 'path';

/**
 * تنفيذ الكود المولد
 * @param code الكود المراد تنفيذه
 */
export async function executeCode(code: string): Promise<void> {
  try {
    console.log('🔄 جاري تنفيذ الكود...');

    // تحليل نوع الكود وإنشاء ملف بناءً على ذلك
    let fileExtension = 'js';
    let targetDirectory = 'generated-code';

    // تحديد نوع الملف ومكان الحفظ
    if (code.includes('import React') || code.includes('useState') || code.includes('useEffect')) {
      // إذا كان الكود يتضمن مكونات React
      fileExtension = 'tsx';
      if (code.includes('export default function')) {
        // ملف صفحة كاملة
        targetDirectory = 'client/src/pages';
      } else {
        // مكون فرعي
        targetDirectory = 'client/src/components/generated';
      }
    } else if (code.includes('app.get') || code.includes('app.post') || code.includes('app.put')) {
      // إذا كان الكود يتضمن مسارات API
      fileExtension = 'ts';
      targetDirectory = 'server/generated-routes';
    } else if (code.includes('class') || code.includes('interface') || code.includes('type ')) {
      // إذا كان الكود يتضمن تعريفات نوع TypeScript
      fileExtension = 'ts';
      targetDirectory = 'shared/generated-utils';
    }

    // إنشاء اسم الملف
    const timestamp = Date.now();
    const name = code.includes('export default function') ? 
                code.match(/export default function ([a-zA-Z0-9_]+)/)?.[1] || `Generated${timestamp}` :
                `generated-code-${timestamp}`;

    const filename = `${name}.${fileExtension}`;
    const filePath = path.join(process.cwd(), targetDirectory, filename);

    // إنشاء المجلد إذا لم يكن موجودًا
    const dirPath = path.dirname(filePath);
    await fs.mkdir(dirPath, { recursive: true });

    // كتابة الكود إلى الملف
    await fs.writeFile(filePath, code, 'utf-8');
    console.log(`✅ تم حفظ الكود في: ${filePath}`);

    console.log('✅ تم تنفيذ الكود بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في تنفيذ الكود:', error);
    throw new Error(`فشل في تنفيذ الكود: ${error}`);
  }
}