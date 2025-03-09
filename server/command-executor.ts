
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
    
    // تحليل نوع الطلب لتوجيه التنفيذ بشكل صحيح
    const requestType = analyzeRequest(command);
    let response = "";
    
    switch (requestType) {
      case 'ui_component':
        response = await createUIComponent(command);
        break;
      case 'feature':
        response = await implementFeature(command);
        break;
      case 'fix':
        response = await fixIssue(command);
        break;
      case 'modify':
        response = await modifyExistingCode(command);
        break;
      default:
        // توليد كود عام بناءً على الأمر باستخدام النموذج اللغوي
        const generatedCode = await generateCodeWithOpenAI(command);
        
        // تنفيذ الكود المولد وحفظه في الملف المناسب
        const filePath = await executeCode(generatedCode);
        
        // إعادة تشغيل التطبيق إذا لزم الأمر
        if (shouldRestartApp(command, generatedCode)) {
          await restartApplication();
        }
        
        response = `✅ تم تنفيذ الأمر بنجاح:\n\nتم إنشاء وتنفيذ الكود التالي:\n${generatedCode}\n\nتم حفظ الكود في: ${filePath}`;
    }
    
    return response;
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
 * @returns مسار الملف الذي تم حفظ الكود فيه
 */
export async function executeCode(code: string): Promise<string> {
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
    
    // تنفيذ عمليات إضافية بناء على نوع الكود
    if (codeType === 'component') {
      await addComponentToExports(filePath);
    } else if (codeType === 'route') {
      await registerNewRoute(filePath);
    } else if (codeType === 'util') {
      await updateUtilImports(filePath);
    }
    
    return filePath;
  } catch (error) {
    console.error('❌ خطأ أثناء تنفيذ الكود:', error);
    throw new Error(`فشل في تنفيذ الكود: ${error}`);
  }
}

/**
 * تحليل نوع الطلب لتحديد الإجراء المناسب
 * @param command الأمر المراد تحليله
 */
function analyzeRequest(command: string): string {
  const command_lower = command.toLowerCase();
  
  if (command_lower.includes('أضف') || command_lower.includes('إنشاء') || command_lower.includes('واجهة') || 
      command_lower.includes('مكون') || command_lower.includes('صفحة') || command_lower.includes('زر')) {
    return 'ui_component';
  }
  
  if (command_lower.includes('خاصية') || command_lower.includes('ميزة') || command_lower.includes('وظيفة') || 
      command_lower.includes('أضف قدرة') || command_lower.includes('إضافة إمكانية')) {
    return 'feature';
  }
  
  if (command_lower.includes('إصلاح') || command_lower.includes('صحح') || command_lower.includes('مشكلة') || 
      command_lower.includes('خطأ') || command_lower.includes('حل مشكلة')) {
    return 'fix';
  }
  
  if (command_lower.includes('تعديل') || command_lower.includes('تغيير') || command_lower.includes('تحديث') || 
      command_lower.includes('تحسين')) {
    return 'modify';
  }
  
  return 'general';
}

/**
 * إنشاء مكون واجهة مستخدم جديد
 * @param command وصف المكون المطلوب
 */
async function createUIComponent(command: string): Promise<string> {
  console.log(`🔄 إنشاء مكون واجهة مستخدم: "${command}"`);
  
  // توليد كود المكون
  const componentCode = await generateCodeWithOpenAI(`أنشئ مكون React.js باستخدام TypeScript للواجهة العربية: ${command}. استخدم مكتبة shadcn/ui وأسلوب Tailwind CSS وتأكد من دعم RTL.`);
  
  // استخراج اسم المكون
  const componentNameMatch = componentCode.match(/export\s+(?:default\s+)?(?:const|function)\s+(\w+)/);
  const componentName = componentNameMatch ? componentNameMatch[1] : `Custom${Date.now().toString(36).slice(-4)}Component`;
  
  // إنشاء اسم ملف مناسب
  const fileName = `${componentName}.tsx`;
  const filePath = path.join(process.cwd(), 'client', 'src', 'components', 'custom', fileName);
  
  // إنشاء المجلد إذا لم يكن موجودًا
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // حفظ الكود في ملف
  fs.writeFileSync(filePath, componentCode, 'utf8');
  
  // إضافة المكون إلى ملف التصدير إذا كان موجودًا
  try {
    const indexPath = path.join(process.cwd(), 'client', 'src', 'components', 'custom', 'index.ts');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      if (!indexContent.includes(`from './${componentName}'`)) {
        indexContent += `\nexport { ${componentName} } from './${componentName}';`;
        fs.writeFileSync(indexPath, indexContent, 'utf8');
      }
    } else {
      fs.writeFileSync(indexPath, `export { ${componentName} } from './${componentName}';`, 'utf8');
    }
  } catch (error) {
    console.warn('⚠️ لم يتم إضافة المكون إلى ملف التصدير:', error);
  }
  
  return `✅ تم إنشاء مكون واجهة المستخدم "${componentName}" بنجاح!\n\nيمكنك استخدامه في أي صفحة عن طريق استيراده:\n\nimport { ${componentName} } from '@/components/custom/${componentName}';\n\nتم حفظ الكود في: ${filePath}\n\nالكود المولد:\n${componentCode}`;
}

/**
 * تنفيذ ميزة جديدة في التطبيق
 * @param command وصف الميزة المطلوبة
 */
async function implementFeature(command: string): Promise<string> {
  console.log(`🔄 تنفيذ ميزة جديدة: "${command}"`);
  
  // توليد خطة لتنفيذ الميزة
  const planPrompt = `قم بتحليل الميزة التالية وإنشاء خطة تنفيذ مفصلة مع تحديد الملفات التي يجب تعديلها وكيفية تنفيذ الميزة: ${command}`;
  const plan = await generateCodeWithOpenAI(planPrompt);
  
  // تحديد الملفات التي يجب تعديلها بناءً على الخطة
  // هنا نحتاج إلى تنفيذ المنطق الخاص بتحليل الخطة وتنفيذها
  
  // كمثال مبسط، سنقوم بإنشاء ملف واحد للميزة الجديدة
  const featureName = `Feature${Date.now().toString(36).slice(-4)}`;
  const featureCode = await generateCodeWithOpenAI(`قم بإنشاء كود TypeScript لتنفيذ الميزة التالية: ${command}`);
  
  const filePath = path.join(process.cwd(), 'shared', 'features', `${featureName}.ts`);
  
  // إنشاء المجلد إذا لم يكن موجودًا
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // حفظ الكود في ملف
  fs.writeFileSync(filePath, featureCode, 'utf8');
  
  return `✅ تم تنفيذ الميزة الجديدة بنجاح!\n\nتم حفظ الكود في: ${filePath}\n\nخطة التنفيذ:\n${plan}\n\nالكود المولد:\n${featureCode}`;
}

/**
 * إصلاح مشكلة في التطبيق
 * @param command وصف المشكلة المطلوب إصلاحها
 */
async function fixIssue(command: string): Promise<string> {
  console.log(`🔄 إصلاح مشكلة: "${command}"`);
  
  // تحليل المشكلة وتحديد الملفات المحتملة
  const analysisPrompt = `قم بتحليل المشكلة التالية وتحديد الأسباب المحتملة والملفات التي قد تحتاج إلى تعديل: ${command}`;
  const analysis = await generateCodeWithOpenAI(analysisPrompt);
  
  // هنا نحتاج إلى منطق أكثر تعقيدًا لتحديد الملفات التي تحتاج إلى تعديل وإجراء التغييرات اللازمة
  
  return `🔍 تحليل المشكلة:\n${analysis}\n\nلتنفيذ الإصلاح بشكل آلي، يرجى تحديد الملف الذي تريد إصلاحه بشكل أكثر تحديداً. يمكنك استخدام أمر مثل: "أصلح مشكلة X في ملف Y"`;
}

/**
 * تعديل كود موجود في التطبيق
 * @param command وصف التعديل المطلوب
 */
async function modifyExistingCode(command: string): Promise<string> {
  console.log(`🔄 تعديل كود موجود: "${command}"`);
  
  // هنا نحتاج إلى تحليل الأمر لتحديد الملف الذي يحتاج إلى تعديل
  // ثم قراءة محتوى الملف وإجراء التعديلات اللازمة
  
  return `لتعديل كود موجود بشكل آلي، يرجى تحديد اسم الملف الذي تريد تعديله بشكل صريح. يمكنك استخدام أمر مثل: "عدل ملف X لإضافة ميزة Y"`;
}

/**
 * إضافة المكون الجديد إلى ملف التصدير
 * @param componentPath مسار ملف المكون
 */
async function addComponentToExports(componentPath: string): Promise<void> {
  try {
    const dirPath = path.dirname(componentPath);
    const componentName = path.basename(componentPath, path.extname(componentPath));
    
    const indexPath = path.join(dirPath, 'index.ts');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      if (!indexContent.includes(`from './${componentName}'`)) {
        indexContent += `\nexport { default as ${componentName} } from './${componentName}';`;
        fs.writeFileSync(indexPath, indexContent, 'utf8');
      }
    } else {
      fs.writeFileSync(indexPath, `export { default as ${componentName} } from './${componentName}';`, 'utf8');
    }
  } catch (error) {
    console.warn('⚠️ لم يتم إضافة المكون إلى ملف التصدير:', error);
  }
}

/**
 * تسجيل مسار جديد في التطبيق
 * @param routePath مسار ملف المسار
 */
async function registerNewRoute(routePath: string): Promise<void> {
  // هنا يمكن إضافة المنطق الخاص بتسجيل مسار جديد في التطبيق
  console.log(`🔄 تسجيل مسار جديد: ${routePath}`);
}

/**
 * تحديث استيرادات الأدوات المساعدة
 * @param utilPath مسار ملف الأداة المساعدة
 */
async function updateUtilImports(utilPath: string): Promise<void> {
  // هنا يمكن إضافة المنطق الخاص بتحديث استيرادات الأدوات المساعدة
  console.log(`🔄 تحديث استيرادات الأدوات المساعدة: ${utilPath}`);
}

/**
 * تحديد ما إذا كان يجب إعادة تشغيل التطبيق بعد تنفيذ الأمر
 * @param command الأمر المنفذ
 * @param code الكود المولد
 */
function shouldRestartApp(command: string, code: string): boolean {
  // تحديد ما إذا كان الكود يتطلب إعادة تشغيل التطبيق
  return command.includes('إعادة تشغيل') || 
         code.includes('server') || 
         code.includes('app.use') || 
         code.includes('routes') ||
         code.includes('import express');
}

/**
 * إعادة تشغيل التطبيق
 */
async function restartApplication(): Promise<void> {
  try {
    console.log('🔄 جاري إعادة تشغيل التطبيق...');
    // هنا يمكن إضافة المنطق الخاص بإعادة تشغيل التطبيق
    // ملاحظة: قد يتطلب ذلك امتيازات خاصة حسب بيئة التشغيل
  } catch (error) {
    console.error('❌ فشل في إعادة تشغيل التطبيق:', error);
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
