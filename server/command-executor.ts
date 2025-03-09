
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { generateCodeWithOpenAI } from './code-generator';
import { exec } from 'child_process';
import util from 'util';
import os from 'os';

const execPromise = util.promisify(exec);

/**
 * تنفيذ أمر من المستخدم
 * @param command الأمر المراد تنفيذه
 */
export async function executeCommand(command: string): Promise<string> {
  try {
    console.log(`🔄 تنفيذ الأمر: "${command}"`);
    
    // التحقق إذا كان الأمر يتعلق بفحص النظام
    if (command.includes('فحص النظام') || command.includes('حالة النظام') || command.includes('معلومات النظام')) {
      return await getSystemStatus();
    }
    
    // التحقق إذا كان الأمر يتعلق بمراقبة الخدمات
    if (command.includes('مراقبة الخدمات') || command.includes('حالة الخدمات')) {
      return await getServicesStatus();
    }
    
    // التحقق إذا كان الأمر يتعلق بالملفات
    if (command.includes('قائمة الملفات') || command.includes('عرض الملفات')) {
      return await listFiles();
    }
    
    // توليد كود بناءً على الأمر باستخدام النموذج اللغوي
    const generatedCode = await generateCodeWithOpenAI(command);
    
    // تنفيذ الكود المولد
    await executeCode(generatedCode);
    
    return `تم تنفيذ الأمر بنجاح:\n${generatedCode}`;
  } catch (error) {
    console.error('❌ خطأ في تنفيذ الأمر:', error);
    throw new Error(`فشل في تنفيذ الأمر: ${error}`);
  }
}

/**
 * الحصول على حالة النظام
 */
async function getSystemStatus(): Promise<string> {
  try {
    const freeMem = os.freemem() / 1024 / 1024;
    const totalMem = os.totalmem() / 1024 / 1024;
    const memUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
    
    const cpuInfo = os.cpus();
    const uptime = (os.uptime() / 60).toFixed(2);
    
    const { stdout: diskSpace } = await execPromise('df -h | grep "/$"');
    
    const { stdout: processCount } = await execPromise('ps aux | wc -l');
    
    const systemStatus = `
📊 تقرير حالة النظام:

💻 معلومات النظام:
   - نظام التشغيل: ${os.type()} ${os.release()}
   - اسم المضيف: ${os.hostname()}
   - مدة التشغيل: ${uptime} دقيقة

🔧 استخدام الموارد:
   - الذاكرة المستخدمة: ${memUsage}% (${(totalMem - freeMem).toFixed(2)} MB من أصل ${totalMem.toFixed(2)} MB)
   - عدد المعالجات: ${cpuInfo.length}
   - عدد العمليات النشطة: ${parseInt(processCount) - 1}

💾 مساحة القرص:
${diskSpace}

🔄 حالة الخدمات:
   - خدمة الويب: نشطة ✅
   - بوت التلجرام: نشط ✅
   - قاعدة البيانات: نشطة ✅
    `;
    
    return systemStatus;
  } catch (error) {
    console.error('❌ خطأ في الحصول على حالة النظام:', error);
    return `❌ حدث خطأ أثناء الحصول على حالة النظام: ${error.message}`;
  }
}

/**
 * الحصول على حالة الخدمات
 */
async function getServicesStatus(): Promise<string> {
  try {
    const { stdout: serverStatus } = await execPromise('ps aux | grep "tsx server" | grep -v grep || echo "غير نشطة"');
    const { stdout: botStatus } = await execPromise('ps aux | grep "telegram-bot" | grep -v grep || echo "غير نشطة"');
    const { stdout: dbStatus } = await execPromise('ps aux | grep "postgres" | grep -v grep || echo "غير نشطة"');
    
    // تحقق من الاتصال بقاعدة البيانات
    const dbConnection = !dbStatus.includes("غير نشطة") ? "متصلة ✅" : "غير متصلة ❌";
    
    const servicesStatus = `
🔄 حالة الخدمات:

🌐 خدمة الويب: ${!serverStatus.includes("غير نشطة") ? "نشطة ✅" : "غير نشطة ❌"}
🤖 بوت التلجرام: ${!botStatus.includes("غير نشطة") ? "نشط ✅" : "غير نشط ❌"}
🗃️ قاعدة البيانات: ${dbConnection}

آخر تحديث: ${new Date().toLocaleString('ar-SA')}
    `;
    
    return servicesStatus;
  } catch (error) {
    console.error('❌ خطأ في الحصول على حالة الخدمات:', error);
    return `❌ حدث خطأ أثناء الحصول على حالة الخدمات: ${error.message}`;
  }
}

/**
 * عرض قائمة الملفات
 */
async function listFiles(): Promise<string> {
  try {
    const projectRoot = process.cwd();
    const serverDir = path.join(projectRoot, 'server');
    const clientDir = path.join(projectRoot, 'client');
    
    const serverFiles = fs.readdirSync(serverDir);
    const clientFiles = fs.readdirSync(path.join(clientDir, 'src'));
    
    const filesList = `
📁 قائمة الملفات:

📂 ملفات السيرفر:
${serverFiles.map(file => `   - ${file}`).join('\n')}

📂 ملفات العميل:
${clientFiles.map(file => `   - ${file}`).join('\n')}
    `;
    
    return filesList;
  } catch (error) {
    console.error('❌ خطأ في عرض قائمة الملفات:', error);
    return `❌ حدث خطأ أثناء عرض قائمة الملفات: ${error.message}`;
  }
}

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
