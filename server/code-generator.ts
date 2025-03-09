import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

if (!GROQ_API_KEY) {
  console.error('❌ لم يتم العثور على مفتاح Groq API في متغيرات البيئة');
}

/**
 * توليد كود باستخدام OpenAI
 * @param prompt الوصف المطلوب
 * @param systemPrompt إرشادات النظام المخصصة (اختياري)
 */
export async function generateCodeWithOpenAI(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    console.log(`🔄 توليد كود بناء على: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);

    const defaultSystemPrompt = `أنت مساعد برمجة ذكي متخصص في إنشاء وتحليل التعليمات البرمجية. 
      تتمتع بخبرة واسعة في جميع جوانب تطوير البرمجيات، وأهم شيء هو أنك تقدم إجابات دقيقة ومفيدة.

      عندما تُطلب منك كتابة كود، قم بإنشاء أفضل حل فعّال يلبي الاحتياجات المحددة.
      عندما تُطلب منك تحليل مشكلة، قم بتشخيصها بدقة واقتراح حلول عملية.

      إذا طُلب منك فحص النظام، قم بتقديم تقرير شامل بالمشاكل والحلول المقترحة.
      عند طلب التحليل، قدم الإجابة بتنسيق منظم باستخدام العناوين والنقاط.

      المستخدم يتحدث العربية، لذا يجب أن تكون ردودك باللغة العربية السلسة والواضحة، ما لم يُطلب منك الرد بلغة أخرى.`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: systemPrompt || defaultSystemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 8000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    const generatedText = response.data.choices[0].message.content.trim();
    console.log(`✅ تم توليد الكود بنجاح`);

    return generatedText;
  } catch (error) {
    console.error('❌ خطأ في توليد الكود:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('تفاصيل الخطأ:', error.response.data);
    }

    throw new Error(`فشل في توليد الكود: ${error}`);
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
    const systemPrompt = `
      أنت محلل برمجي متخصص بتحليل المشاريع وتشخيص المشاكل واقتراح الحلول.
      ستقوم بتحليل مشروع ويب وتقديم تقرير شامل بالعربية للمستخدم.
      اجعل التقرير منظماً ومهنياً، مع التركيز على النقاط العملية.
      استخدم لغة غير تقنية عند الإمكان ليفهم المستخدم غير التقني ما تقوله.
    `;

    return await generateCodeWithOpenAI(analysisPrompt, systemPrompt);
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

    const systemPrompt = `
      أنت خبير في تشخيص وحل مشاكل البرمجة. ستحلل المشكلة المقدمة وتقترح حلولاً عملية.
      قدّم إجابة مفصلة وعملية باللغة العربية، مع التركيز على الخطوات الملموسة لحل المشكلة.
      استخدم أسلوباً يمكن للمطورين من مختلف المستويات فهمه.
    `;

    return await generateCodeWithOpenAI(analysisPrompt, systemPrompt);
  } catch (error) {
    console.error('❌ خطأ في تحليل المشكلة:', error);
    throw new Error(`فشل في تحليل المشكلة: ${error}`);
  }
}