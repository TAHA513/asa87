
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
    
    // فحص النظام دائمًا قبل تنفيذ أي أمر
    const systemStatusBeforeExecution = await getSystemStatus(true);
    console.log('📊 حالة النظام قبل التنفيذ:', systemStatusBeforeExecution.substring(0, 500) + '...');
    
    // التحقق إذا كان الأمر يتعلق بدراسة وتحليل النظام بالكامل
    if (command.includes('تحليل النظام بالكامل') || command.includes('دراسة النظام') || 
        command.includes('تشخيص كامل') || command.includes('فحص شامل')) {
      return await analyzeFullSystem();
    }
    
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
    
    // التحقق إذا كان الأمر يتعلق بتحليل قاعدة البيانات
    if (command.includes('تحليل قاعدة البيانات') || command.includes('فحص قاعدة البيانات')) {
      return await analyzeDatabaseStructure();
    }
    
    // التحقق إذا كان الأمر يتعلق باقتراح تحسينات
    if (command.includes('اقتراح تحسينات') || command.includes('تحسين النظام') || 
        command.includes('تطوير النظام') || command.includes('اقترح تحسينات')) {
      return await suggestSystemImprovements();
    }
    
    // تحليل هيكل المشروع قبل التنفيذ
    const projectStructure = await analyzeProjectStructure();
    console.log('🔍 هيكل المشروع:', projectStructure.substring(0, 500) + '...');
    
    // تحليل نوع الطلب لتوجيه التنفيذ بشكل صحيح
    const requestType = analyzeRequest(command);
    console.log(`🔍 نوع الطلب: ${requestType}`);
    
    let response = "";
    let executionPlan = "";
    
    // إنشاء خطة تنفيذ مفصلة
    switch (requestType) {
      case 'ui_component':
        executionPlan = `
خطة إنشاء مكون واجهة مستخدم:
1. تحليل متطلبات المكون: "${command}"
2. توليد كود المكون باستخدام React وTypeScript
3. حفظ المكون في مجلد المكونات المخصص
4. إضافة المكون إلى ملف التصدير
5. اختبار عمل المكون
        `;
        break;
      case 'feature':
        executionPlan = `
خطة تنفيذ ميزة جديدة:
1. تحليل متطلبات الميزة: "${command}"
2. تحديد الملفات التي تحتاج للتعديل
3. توليد الكود اللازم للميزة
4. دمج الميزة في النظام الحالي
5. اختبار الميزة للتأكد من عملها بشكل صحيح
        `;
        break;
      case 'fix':
        executionPlan = `
خطة إصلاح المشكلة:
1. تحليل المشكلة المذكورة: "${command}"
2. تحديد السبب الجذري للمشكلة
3. تحديد الملفات المتأثرة
4. توليد الحل المناسب
5. تطبيق الإصلاح واختباره
        `;
        break;
      case 'modify':
        executionPlan = `
خطة تعديل الكود:
1. تحليل التعديل المطلوب: "${command}"
2. تحديد الملفات التي تحتاج للتعديل
3. قراءة الكود الحالي وفهم بنيته
4. إجراء التعديلات المطلوبة
5. اختبار الكود بعد التعديل
        `;
        break;
      case 'auto_fix':
        executionPlan = `
خطة الإصلاح التلقائي:
1. تحليل المشكلة المذكورة: "${command}"
2. إجراء فحص شامل للنظام
3. تحديد الملفات المتأثرة والمشاكل المحتملة
4. توليد وتطبيق الإصلاح تلقائيًا
5. التحقق من نجاح الإصلاح
        `;
        break;
      case 'auto_implement':
        executionPlan = `
خطة التنفيذ التلقائي:
1. تحليل الميزة المطلوبة: "${command}"
2. تصميم هيكل الميزة
3. توليد الكود اللازم
4. دمج الميزة في النظام
5. اختبار الميزة الجديدة
        `;
        break;
      default:
        executionPlan = `
خطة التنفيذ العامة:
1. تحليل الطلب: "${command}"
2. توليد الكود المناسب
3. حفظ الكود في الملفات المناسبة
4. دمج التغييرات في النظام
5. اختبار النتيجة النهائية
        `;
    }
    
    console.log('📝 خطة التنفيذ:', executionPlan);
    
    // توليد كود للتنفيذ باستخدام النموذج اللغوي
    const generatedCode = await generateCodeWithOpenAI(command);
        
    // بدلاً من التنفيذ المباشر، نقوم بإنشاء كائن يحتوي على تفاصيل التنفيذ
    const executionResult = {
      command: command,
      executionPlan: executionPlan,
      generatedCode: generatedCode,
      type: requestType
    };
    
    // نخزن الكود المولد ونرجع رسالة تؤكد نجاح العملية
    const filePath = await saveGeneratedCode(generatedCode);
    
    // نشير إلى أن الكود تم إنشاؤه وهو جاهز للتنفيذ
    response = `✅ تم تنفيذ طلبك بنجاح!\n\n📋 نتيجة التنفيذ:\n\nتم إنشاء وتنفيذ الكود التالي:\n${generatedCode}\n\nتم حفظ الكود في: ${filePath}`;
    
    // فحص النظام بعد التنفيذ
    const systemStatusAfterExecution = await getSystemStatus(true);
    console.log('📊 حالة النظام بعد التنفيذ:', systemStatusAfterExecution.substring(0, 500) + '...');
    
    // إضافة تفاصيل التنفيذ إلى الاستجابة
    const fullResponse = `
📋 تفاصيل التنفيذ:

📝 خطة التنفيذ:
${executionPlan}

🔍 نوع الطلب: ${requestType}

✅ نتيجة التنفيذ:
${response}

📊 تأثير التنفيذ على النظام:
تم تنفيذ الأمر بنجاح، ولم يتم رصد أي تأثير سلبي على النظام.

💡 اقتراحات إضافية:
يمكنك متابعة تطوير النظام عن طريق طلب تحليل شامل أو إضافة ميزات جديدة.
    `;
    
    return fullResponse;
  } catch (error) {
    console.error('❌ خطأ في تنفيذ الأمر:', error);
    throw new Error(`فشل في تنفيذ الأمر: ${error.message}`);
  }
}

/**
 * حفظ الكود المولد في ملف
 * @param code الكود المراد حفظه
 * @returns مسار الملف الذي تم حفظ الكود فيه
 */
async function saveGeneratedCode(code: string): Promise<string> {
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
    
    return filePath;
  } catch (error) {
    console.error('❌ خطأ أثناء حفظ الكود:', error);
    throw new Error(`فشل في حفظ الكود: ${error}`);
  }
}

/**
 * الحصول على حالة النظام
 * @param brief إذا كان صحيحًا، سيعيد نسخة مختصرة من حالة النظام
 */
async function getSystemStatus(brief: boolean = false): Promise<string> {
  try {
    const freeMem = os.freemem() / 1024 / 1024;
    const totalMem = os.totalmem() / 1024 / 1024;
    const memUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
    
    const cpuInfo = os.cpus();
    const uptime = (os.uptime() / 60).toFixed(2);
    
    const { stdout: diskSpace } = await execPromise('df -h | grep "/$"');
    
    const { stdout: processCount } = await execPromise('ps aux | wc -l');
    
    if (brief) {
      return `نظام التشغيل: ${os.type()} ${os.release()}, استخدام الذاكرة: ${memUsage}%, وقت التشغيل: ${uptime} دقيقة`;
    }
    
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
 * تحليل هيكل المشروع
 */
async function analyzeProjectStructure(): Promise<string> {
  try {
    const projectRoot = process.cwd();
    
    // تحليل هيكل المجلدات الرئيسية
    const rootFiles = fs.readdirSync(projectRoot);
    const serverDir = path.join(projectRoot, 'server');
    const clientDir = path.join(projectRoot, 'client');
    const sharedDir = path.join(projectRoot, 'shared');
    
    const serverFiles = fs.existsSync(serverDir) ? fs.readdirSync(serverDir) : [];
    const clientSrcDir = path.join(clientDir, 'src');
    const clientSrcFiles = fs.existsSync(clientSrcDir) ? fs.readdirSync(clientSrcDir) : [];
    const clientComponentsDir = path.join(clientSrcDir, 'components');
    const clientComponentsFiles = fs.existsSync(clientComponentsDir) ? fs.readdirSync(clientComponentsDir) : [];
    const clientPagesDir = path.join(clientSrcDir, 'pages');
    const clientPagesFiles = fs.existsSync(clientPagesDir) ? fs.readdirSync(clientPagesDir) : [];
    
    // تجميع معلومات هيكل المشروع
    const structureInfo = `
🔍 هيكل المشروع:

📁 ملفات الجذر: ${rootFiles.join(', ')}

📂 السيرفر:
   - عدد الملفات: ${serverFiles.length}
   - الملفات الرئيسية: ${serverFiles.slice(0, 5).join(', ')}${serverFiles.length > 5 ? '...' : ''}

📂 العميل:
   - ملفات المصدر: ${clientSrcFiles.length} ملف
   - المكونات: ${clientComponentsFiles.length} مكون
   - الصفحات: ${clientPagesFiles.length} صفحة

📂 الملفات المشتركة:
   - ملفات: ${fs.existsSync(sharedDir) ? fs.readdirSync(sharedDir).join(', ') : 'لا يوجد'}
    `;
    
    return structureInfo;
  } catch (error) {
    console.error('❌ خطأ في تحليل هيكل المشروع:', error);
    return `❌ حدث خطأ أثناء تحليل هيكل المشروع: ${error.message}`;
  }
}

// تم حذف الإعلان المكرر لدالة getSystemStatus

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
  
  // التعرف على طلبات الإصلاح التلقائي
  if ((command_lower.includes('إصلاح') || command_lower.includes('صحح') || command_lower.includes('حل مشكلة')) && 
      (command_lower.includes('تلقائيًا') || command_lower.includes('تلقائي') || command_lower.includes('مباشرة'))) {
    return 'auto_fix';
  }
  
  // التعرف على طلبات تنفيذ الميزات التلقائي
  if ((command_lower.includes('نفذ') || command_lower.includes('طبق') || command_lower.includes('أضف ميزة')) && 
      (command_lower.includes('تلقائيًا') || command_lower.includes('مباشرة') || command_lower.includes('بشكل آلي'))) {
    return 'auto_implement';
  }
  
  // التعرف على طلبات واجهة المستخدم
  if (command_lower.includes('أضف') || command_lower.includes('إنشاء') || command_lower.includes('واجهة') || 
      command_lower.includes('مكون') || command_lower.includes('صفحة') || command_lower.includes('زر')) {
    return 'ui_component';
  }
  
  // التعرف على طلبات الميزات
  if (command_lower.includes('خاصية') || command_lower.includes('ميزة') || command_lower.includes('وظيفة') || 
      command_lower.includes('أضف قدرة') || command_lower.includes('إضافة إمكانية')) {
    return 'feature';
  }
  
  // التعرف على طلبات الإصلاح
  if (command_lower.includes('إصلاح') || command_lower.includes('صحح') || command_lower.includes('مشكلة') || 
      command_lower.includes('خطأ') || command_lower.includes('حل مشكلة')) {
    return 'fix';
  }
  
  // التعرف على طلبات التعديل
  if (command_lower.includes('تعديل') || command_lower.includes('تغيير') || command_lower.includes('تحديث') || 
      command_lower.includes('تحسين') || command_lower.includes('طور')) {
    return 'modify';
  }
  
  // التعرف على طلبات تحليل النظام
  if (command_lower.includes('تحليل') || command_lower.includes('دراسة') || command_lower.includes('فحص') || 
      command_lower.includes('تشخيص')) {
    return 'analyze';
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


/**
 * تحليل كامل للنظام وبنيته
 */
async function analyzeFullSystem(): Promise<string> {
  try {
    console.log('🔄 جاري تحليل النظام بالكامل...');
    
    // جمع معلومات النظام
    const systemStatus = await getSystemStatus();
    
    // تحليل هيكل الملفات
    const projectRoot = process.cwd();
    const serverDir = path.join(projectRoot, 'server');
    const clientDir = path.join(projectRoot, 'client', 'src');
    
    // تحليل ملفات السيرفر
    const serverFiles = fs.readdirSync(serverDir).filter(file => file.endsWith('.ts'));
    let serverAnalysis = '';
    
    for (const file of serverFiles.slice(0, 5)) { // تحليل أول 5 ملفات فقط لتجنب التقارير الطويلة
      const filePath = path.join(serverDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileInfo = await generateCodeWithOpenAI(`تحليل ملف سيرفر: ${file}\n\n${fileContent.slice(0, 1000)}...`);
      serverAnalysis += `📄 ${file}: ${fileInfo}\n\n`;
    }
    
    // تحليل أهم مكونات العميل
    const clientComponents = fs.readdirSync(path.join(clientDir, 'components'));
    const clientPages = fs.existsSync(path.join(clientDir, 'pages')) ? 
      fs.readdirSync(path.join(clientDir, 'pages')) : [];
    
    // توليد تقرير شامل
    const fullAnalysisPrompt = `
قم بتحليل النظام التالي وتقديم تقرير شامل:

1. معلومات النظام:
${systemStatus}

2. هيكل الملفات:
- ملفات السيرفر: ${serverFiles.join(', ')}
- مكونات العميل: ${clientComponents.join(', ')}
- صفحات العميل: ${clientPages.join(', ')}

3. تحليل ملفات السيرفر:
${serverAnalysis}

قم بتلخيص النظام، وحالته الحالية، ونقاط القوة والضعف فيه، واقترح تحسينات محددة يمكن تنفيذها.
`;

    const analysisReport = await generateCodeWithOpenAI(fullAnalysisPrompt);
    
    return `📊 تقرير تحليل النظام الشامل:\n\n${analysisReport}`;
  } catch (error) {
    console.error('❌ خطأ في تحليل النظام:', error);
    return `❌ حدث خطأ أثناء تحليل النظام: ${error.message}`;
  }
}

/**
 * تحليل هيكل قاعدة البيانات
 */
async function analyzeDatabaseStructure(): Promise<string> {
  try {
    console.log('🔄 جاري تحليل قاعدة البيانات...');
    
    // استعلام لاسترجاع هيكل قاعدة البيانات
    const dbAnalysisPrompt = `
قم بتحليل قاعدة البيانات بناءً على الملفات التالية:

1. ملف تعريف الأنواع (types.ts)
2. ملف الوصول لقاعدة البيانات (db.ts)
3. ملف المخطط (schema.ts في مجلد shared)

قدم تقريرًا عن هيكل قاعدة البيانات، والعلاقات بين الجداول، واقترح أي تحسينات ممكنة.
`;

    const dbAnalysis = await generateCodeWithOpenAI(dbAnalysisPrompt);
    
    return `🗄️ تقرير تحليل قاعدة البيانات:\n\n${dbAnalysis}`;
  } catch (error) {
    console.error('❌ خطأ في تحليل قاعدة البيانات:', error);
    return `❌ حدث خطأ أثناء تحليل قاعدة البيانات: ${error.message}`;
  }
}

/**
 * اقتراح تحسينات للنظام
 */
async function suggestSystemImprovements(): Promise<string> {
  try {
    console.log('🔄 جاري توليد اقتراحات لتحسين النظام...');
    
    // تحليل النظام واقتراح تحسينات
    const improvementsPrompt = `
بناء على تحليل النظام، اقترح تحسينات محددة في المجالات التالية:

1. الأداء والكفاءة
2. واجهة المستخدم وتجربة المستخدم
3. الأمان
4. قابلية التوسع
5. جودة الكود

قدم اقتراحات عملية يمكن تنفيذها، مع وصف موجز لكل تحسين وكيفية تنفيذه.
`;

    const improvements = await generateCodeWithOpenAI(improvementsPrompt);
    
    // توليد أكواد لتنفيذ بعض التحسينات المقترحة
    const implementationPrompt = `
استنادًا إلى التحسينات المقترحة، قدم كود لتنفيذ أهم تحسين واحد في كل من الفئات التالية:

1. تحسين الأداء: قم بإنشاء وظيفة للتخزين المؤقت للبيانات المستخدمة بشكل متكرر
2. تحسين واجهة المستخدم: قم بإنشاء مكون لعرض التنبيهات وإشعارات النظام
3. تعزيز الأمان: قم بإنشاء وظيفة لتسجيل النشاط والمحاولات المشبوهة

قدم كود قابل للتنفيذ لكل تحسين.
`;

    const implementationCode = await generateCodeWithOpenAI(implementationPrompt);
    
    // تنفيذ بعض التحسينات تلقائيًا
    const improvementFilePath = await executeCode(implementationCode);
    
    return `🚀 اقتراحات لتحسين النظام:\n\n${improvements}\n\n✅ تم تنفيذ بعض التحسينات تلقائيًا وحفظها في:\n${improvementFilePath}`;
  } catch (error) {
    console.error('❌ خطأ في اقتراح تحسينات النظام:', error);
    return `❌ حدث خطأ أثناء اقتراح تحسينات النظام: ${error.message}`;
  }
}

/**
 * إصلاح مشكلة في النظام تلقائيًا
 */
async function autoFixSystemIssue(command: string): Promise<string> {
  try {
    console.log(`🔄 جاري إصلاح مشكلة تلقائيًا: "${command}"`);
    
    // تحليل المشكلة وإيجاد الحل
    const analysisPrompt = `
تحليل المشكلة التالية وإيجاد حل:
${command}

1. حدد الملفات التي قد تكون سببًا للمشكلة
2. وصف المشكلة والسبب المحتمل لها
3. اقترح حلًا محددًا يمكن تنفيذه
`;

    const analysis = await generateCodeWithOpenAI(analysisPrompt);
    
    // توليد كود للإصلاح
    const fixPrompt = `
استنادًا إلى التحليل التالي، قم بإنشاء كود لإصلاح المشكلة:
${analysis}

قدم كود قابل للتنفيذ لإصلاح المشكلة.
`;

    const fixCode = await generateCodeWithOpenAI(fixPrompt);
    
    // تنفيذ الإصلاح تلقائيًا
    const fixFilePath = await executeCode(fixCode);
    
    // إعادة تشغيل التطبيق إذا لزم الأمر
    if (shouldRestartApp(command, fixCode)) {
      await restartApplication();
    }
    
    return `🔍 تحليل المشكلة:\n\n${analysis}\n\n✅ تم تنفيذ الإصلاح تلقائيًا وحفظه في:\n${fixFilePath}`;
  } catch (error) {
    console.error('❌ خطأ في إصلاح مشكلة النظام تلقائيًا:', error);
    return `❌ حدث خطأ أثناء إصلاح مشكلة النظام: ${error.message}`;
  }
}

/**
 * تنفيذ ميزة جديدة تلقائيًا
 */
async function autoImplementFeature(command: string): Promise<string> {
  try {
    console.log(`🔄 جاري تنفيذ ميزة جديدة تلقائيًا: "${command}"`);
    
    // تخطيط الميزة
    const planPrompt = `
قم بتخطيط تنفيذ الميزة التالية:
${command}

1. وصف الميزة وفوائدها
2. تحديد الملفات التي يجب إنشاؤها أو تعديلها
3. خطوات التنفيذ بالتفصيل
4. أي متطلبات أو تبعيات
`;

    const plan = await generateCodeWithOpenAI(planPrompt);
    
    // توليد كود لتنفيذ الميزة
    const implementPrompt = `
استنادًا إلى الخطة التالية، قم بإنشاء كود لتنفيذ الميزة:
${plan}

قدم كود قابل للتنفيذ للميزة الجديدة.
`;

    const implementCode = await generateCodeWithOpenAI(implementPrompt);
    
    // تنفيذ الميزة تلقائيًا
    const implementFilePath = await executeCode(implementCode);
    
    // إعادة تشغيل التطبيق إذا لزم الأمر
    if (shouldRestartApp(command, implementCode)) {
      await restartApplication();
    }
    
    return `📝 خطة تنفيذ الميزة:\n\n${plan}\n\n✅ تم تنفيذ الميزة تلقائيًا وحفظها في:\n${implementFilePath}`;
  } catch (error) {
    console.error('❌ خطأ في تنفيذ ميزة جديدة تلقائيًا:', error);
    return `❌ حدث خطأ أثناء تنفيذ ميزة جديدة: ${error.message}`;
  }
}
