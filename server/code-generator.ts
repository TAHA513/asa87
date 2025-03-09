import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * توليد كود بناء على وصف باستخدام OpenAI API
 * @param prompt وصف الكود المطلوب
 * @param isAnalysisRequest هل هذا طلب تحليل
 * @returns الكود المولد
 */
export async function generateCodeWithOpenAI(prompt: string, isAnalysisRequest = false): Promise<string> {
  try {
    console.log(`🔄 توليد كود بناء على: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);

    // التحقق من وجود مفتاح API
    if (!GROQ_API_KEY) {
      throw new Error('مفتاح API غير موجود. يرجى إضافته إلى متغيرات البيئة.');
    }

    // تعديل النظام رسالة بناءً على نوع الطلب
    let systemMessage = 'أنت مساعد مبرمج خبير يقوم بإنشاء التعليمات البرمجية وتحليل وإصلاح المشاكل في نظام إدارة المخزون والمبيعات. استخدم لغة عربية واضحة ومفهومة في شرح وتوليد الكود.';

    if (isAnalysisRequest) {
      systemMessage = 'أنت مساعد ذكي يقوم بتحليل أنظمة البرمجة وتقديم تقارير مفصلة. قدم دائمًا تحليلك باللغة العربية بشكل مفهوم وواضح. لا تقم بإنشاء أكواد برمجية كاملة في ردودك، بل قدم تحليلًا وتوصيات واضحة.';
    }

    // إعداد طلب الـ API
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-8b-8192', // يمكن تغييره إلى نموذج آخر مثل 'mixtral-8x7b-32768' إذا لزم الأمر
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // استخراج الكود المولد من الرد
    const generatedContent = response.data.choices[0].message.content;

    console.log('✅ تم توليد الكود بنجاح');
    return generatedContent;
  } catch (error) {
    console.error('❌ خطأ في توليد الكود:', error);

    if (axios.isAxiosError(error) && error.response) {
      console.error('استجابة الخطأ:', error.response.data);
      throw new Error(`فشل في توليد الكود: ${error.response.data.error?.message || 'خطأ غير معروف من API'}`);
    }

    throw new Error(`فشل في توليد الكود: ${error.message}`);
  }
}

/**
 * تحليل رمز المشروع وإنشاء تقرير شامل
 * @param directoryPath مسار المجلد المراد تحليله
 * @param maxFilesToAnalyze الحد الأقصى لعدد الملفات للتحليل
 */
export async function analyzeProjectCode(directoryPath: string = process.cwd(), maxFilesToAnalyze: number = 10): Promise<string> {
  try {
    console.log(`🔍 تحليل رمز المشروع في: ${directoryPath}`);

    // قراءة هيكل الملفات
    const fileStructure = await scanDirectory(directoryPath, [], 3);

    // تحديد الملفات الأكثر أهمية للتحليل
    const importantFiles = identifyImportantFiles(fileStructure, maxFilesToAnalyze);

    // قراءة محتوى الملفات المهمة
    const filesContent: {[key: string]: string} = {};
    for (const filePath of importantFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        filesContent[filePath] = content.substring(0, 3000); // تقييد طول المحتوى
      } catch (error) {
        console.warn(`⚠️ تعذر قراءة الملف: ${filePath}`, error);
      }
    }

    // إنشاء نص التحليل
    const analysisPrompt = `
      أنا أعمل على مشروع ويب وأحتاج إلى تحليل شامل له. فيما يلي هيكل الملفات:

      # هيكل الملفات
      ${JSON.stringify(fileStructure, null, 2)}

      # محتوى الملفات المهمة
      ${Object.entries(filesContent).map(([path, content]) => `## ${path}\n\`\`\`\n${content}\n\`\`\``).join('\n\n')}

      قم بتحليل هذا المشروع وتقديم تقرير شامل باللغة العربية يتضمن:

      1. ملخص عام عن هيكل المشروع والتقنيات المستخدمة
      2. نقاط القوة في المشروع
      3. المشاكل المحتملة وفرص التحسين
      4. اقتراحات محددة للتحسين مع أمثلة على التغييرات المقترحة
      5. توصيات ذات أولوية عالية يجب تنفيذها أولاً

      نسّق التقرير بشكل مرتب باستخدام العناوين والنقاط والأقسام.
    `;

    // توليد التحليل باستخدام Groq
    return await generateCodeWithOpenAI(analysisPrompt, true);
  } catch (error) {
    console.error('❌ خطأ في تحليل رمز المشروع:', error);
    throw new Error(`فشل في تحليل رمز المشروع: ${error}`);
  }
}

/**
 * مسح المجلدات وإنشاء هيكل الملفات
 */
async function scanDirectory(dirPath: string, ignoreDirs: string[] = [], maxDepth: number = 3, currentDepth: number = 0): Promise<any[]> {
  if (currentDepth > maxDepth) return [];

  try {
    const ignoreList = [...ignoreDirs, 'node_modules', '.git', 'dist', 'build', '.cache'];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const result: any[] = [];

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (ignoreList.includes(entry.name)) continue;

        const children = await scanDirectory(entryPath, ignoreList, maxDepth, currentDepth + 1);
        if (children.length > 0) {
          result.push({
            type: 'directory',
            name: entry.name,
            path: entryPath,
            children
          });
        }
      } else {
        // فلترة للملفات المهمة فقط
        const ext = path.extname(entry.name).toLowerCase();
        if (['.ts', '.js', '.tsx', '.jsx', '.json', '.css', '.scss', '.html'].includes(ext)) {
          result.push({
            type: 'file',
            name: entry.name,
            path: entryPath,
            extension: ext
          });
        }
      }
    }

    return result;
  } catch (error) {
    console.warn(`⚠️ خطأ في قراءة المجلد ${dirPath}:`, error);
    return [];
  }
}

/**
 * تحديد الملفات المهمة للتحليل
 */
function identifyImportantFiles(fileStructure: any[], maxFiles: number): string[] {
  const allFiles: {path: string, priority: number}[] = [];

  function extractFiles(structure: any[], basePriority: number = 0) {
    for (const item of structure) {
      if (item.type === 'file') {
        let priority = basePriority;

        // زيادة أهمية الملفات حسب اسمها وامتدادها
        if (item.name.includes('index')) priority += 10;
        if (item.name.includes('main')) priority += 8;
        if (item.name.includes('app')) priority += 7;
        if (item.name.includes('config')) priority += 6;
        if (item.name.includes('router')) priority += 5;
        if (['.ts', '.tsx'].includes(item.extension)) priority += 3;
        if (['.js', '.jsx'].includes(item.extension)) priority += 2;

        allFiles.push({path: item.path, priority});
      } else if (item.type === 'directory') {
        // زيادة أهمية الملفات في مجلدات معينة
        let dirPriority = basePriority;
        if (['server', 'api', 'src', 'core'].includes(item.name)) dirPriority += 10;
        if (['components', 'pages', 'routes'].includes(item.name)) dirPriority += 8;
        if (['utils', 'helpers', 'lib'].includes(item.name)) dirPriority += 6;

        extractFiles(item.children, dirPriority);
      }
    }
  }

  extractFiles(fileStructure);

  // ترتيب الملفات حسب الأهمية واختيار أهمها
  return allFiles
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxFiles)
    .map(file => file.path);
}

/**
 * فحص مشكلة محددة وتوليد حل
 * @param problemDescription وصف المشكلة
 * @param relevantFiles ملفات ذات صلة بالمشكلة (اختياري)
 */
export async function analyzeProblemAndSuggestFix(problemDescription: string, relevantFiles?: string[]): Promise<string> {
  try {
    console.log(`🔍 تحليل مشكلة: "${problemDescription}"`);

    // إذا تم تحديد ملفات ذات صلة، قم بتضمين محتواها
    let filesContent = '';
    if (relevantFiles && relevantFiles.length > 0) {
      filesContent = '\n# محتوى الملفات ذات الصلة\n';

      for (const filePath of relevantFiles) {
        try {
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            filesContent += `## ${filePath}\n\`\`\`\n${content.substring(0, 3000)}\n\`\`\`\n\n`;
          }
        } catch (error) {
          console.warn(`⚠️ تعذر قراءة الملف: ${filePath}`, error);
        }
      }
    }

    const analysisPrompt = `
      أحتاج إلى مساعدتك في تحليل وحل المشكلة التالية:

      # وصف المشكلة
      ${problemDescription}

      ${filesContent}

      قم بتحليل المشكلة وقدم:
      1. تشخيص دقيق للمشكلة وأسبابها المحتملة
      2. حلول مقترحة مع شرح خطوات التنفيذ
      3. كود مقترح للتعديل (إذا كان ذلك مناسباً)
      4. نصائح لتجنب هذه المشكلة في المستقبل
    `;

    return await generateCodeWithOpenAI(analysisPrompt);
  } catch (error) {
    console.error('❌ خطأ في تحليل المشكلة:', error);
    throw new Error(`فشل في تحليل المشكلة: ${error}`);
  }
}