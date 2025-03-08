
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

/**
 * تنفيذ الكود المولد وحفظه في ملف مناسب
 * @param code الكود المراد تنفيذه
 */
export async function executeCode(code: string): Promise<void> {
  try {
    // تحليل نوع الكود ومكان حفظه
    const codeType = determineCodeType(code);
    const fileName = generateFileName(codeType);
    const filePath = getFilePath(fileName, codeType);
    
    // إنشاء المجلد إذا لم يكن موجودًا
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // حفظ الكود في ملف
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`✅ تم حفظ الكود في: ${filePath}`);
    
    // يمكن إضافة المزيد من الإجراءات هنا مثل:
    // - تحديث ملفات التصدير
    // - إعادة تشغيل الخدمات
    // - تحديث الـ routes
  } catch (error) {
    console.error('❌ خطأ أثناء تنفيذ الكود:', error);
    throw new Error(`فشل في تنفيذ الكود: ${error}`);
  }
}

/**
 * تحديد نوع الكود (React component, API route, util, etc.)
 */
function determineCodeType(code: string): string {
  if (code.includes('import React') || code.includes('from "react"') || code.includes("from 'react'")) {
    return 'component';
  } else if (code.includes('app.get(') || code.includes('app.post(') || code.includes('router.')) {
    return 'route';
  } else if (code.includes('export function') || code.includes('export const') || code.includes('module.exports')) {
    return 'util';
  }
  return 'misc';
}

/**
 * توليد اسم ملف فريد
 */
function generateFileName(codeType: string): string {
  const timestamp = Date.now();
  const uniqueId = nanoid(6);
  
  switch (codeType) {
    case 'component':
      return `Component-${timestamp}-${uniqueId}.tsx`;
    case 'route':
      return `Route-${timestamp}-${uniqueId}.ts`;
    case 'util':
      return `Util-${timestamp}-${uniqueId}.ts`;
    default:
      return `Generated-${timestamp}-${uniqueId}.js`;
  }
}

/**
 * تحديد مسار الملف بناءً على نوع الكود
 */
function getFilePath(fileName: string, codeType: string): string {
  const basePath = process.cwd();
  
  switch (codeType) {
    case 'component':
      return path.join(basePath, 'client', 'src', 'components', 'generated', fileName);
    case 'route':
      return path.join(basePath, 'server', 'generated-routes', fileName);
    case 'util':
      return path.join(basePath, 'shared', 'generated-utils', fileName);
    default:
      return path.join(basePath, 'generated-code', fileName);
  }
}
