import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { storage } from './storage';
import crypto from 'crypto';

dotenv.config();

const execPromise = promisify(exec);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

/**
 * توليد كود بناء على وصف باستخدام OpenAI API أو محاكاة
 * @param description وصف الكود المطلوب
 * @returns الكود المولد
 */
export async function generateCodeWithOpenAI(description: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.log("استخدام محاكاة لتوليد الكود بدون OpenAI API");
    return simulateCodeGeneration(description);
  }

  try {
    // في حالة وجود مفتاح API، استخدم OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'أنت مساعد برمجي متخصص في توليد الكود بناءً على وصف المستخدم. قم بإنتاج كود عالي الجودة مع تعليقات وشرح مناسب باللغة العربية.' },
          { role: 'user', content: `قم بتوليد كود لـ: ${description}` }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const generatedCode = response.data.choices[0].message.content;
    await saveGeneratedCode(generatedCode, description);
    return generatedCode;
  } catch (error) {
    console.error('خطأ في توليد الكود باستخدام OpenAI:', error);
    console.log('استخدام المحاكاة كخطة بديلة...');
    return simulateCodeGeneration(description);
  }
}

async function simulateCodeGeneration(description: string): Promise<string> {
  // محاكاة التأخير للواقعية
  await new Promise(resolve => setTimeout(resolve, 800));

  const codeSamples = {
    'واجهة': `// واجهة React لـ ${description}
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}));

export default function ${description.replace(/[^\w\s]/gi, '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // جلب البيانات من الخادم
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div dir="rtl">
      <Typography variant="h4" gutterBottom>
        ${description}
      </Typography>

      <StyledBox>
        {loading ? (
          <Typography>جاري التحميل...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم</TableCell>
                  <TableCell>الوصف</TableCell>
                  <TableCell>السعر</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      <Button variant="contained" size="small" color="primary">
                        تعديل
                      </Button>
                      <Button variant="contained" size="small" color="error" sx={{ mr: 1 }}>
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledBox>

      <Button variant="contained" color="primary" onClick={fetchData}>
        تحديث البيانات
      </Button>
    </div>
  );
}`,
    'تحليل': `// تحليل البيانات لـ ${description}
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
  .catch(error => console.error("خطأ في التحليل:", error));`,
    'api': `// API للتعامل مع ${description}
import express from 'express';
import { storage } from '../storage';

const router = express.Router();

/**
 * الحصول على قائمة العناصر
 * @route GET /api/${description.toLowerCase().replace(/\s+/g, '-')}
 * @returns {Array} - قائمة العناصر
 */
router.get('/', async (req, res) => {
  try {
    const items = await storage.getItems();
    res.json(items);
  } catch (error) {
    console.error(\`خطأ في جلب العناصر: \${error.message}\`);
    res.status(500).json({ message: 'فشل في جلب العناصر' });
  }
});

/**
 * إضافة عنصر جديد
 * @route POST /api/${description.toLowerCase().replace(/\s+/g, '-')}
 * @param {Object} req.body - بيانات العنصر الجديد
 * @returns {Object} - العنصر المضاف
 */
router.post('/', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const newItem = await storage.createItem({
      ...req.body,
      userId: req.user.id,
      createdAt: new Date()
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error(\`خطأ في إنشاء عنصر جديد: \${error.message}\`);
    res.status(500).json({ message: 'فشل في إنشاء العنصر' });
  }
});

/**
 * تحديث عنصر موجود
 * @route PATCH /api/${description.toLowerCase().replace(/\s+/g, '-')}/:id
 * @param {number} req.params.id - معرف العنصر
 * @param {Object} req.body - بيانات التحديث
 * @returns {Object} - العنصر المحدث
 */
router.patch('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const itemId = Number(req.params.id);
    const item = await storage.getItem(itemId);

    if (!item) {
      return res.status(404).json({ message: 'العنصر غير موجود' });
    }

    const updatedItem = await storage.updateItem(itemId, {
      ...req.body,
      updatedAt: new Date()
    });

    res.json(updatedItem);
  } catch (error) {
    console.error(\`خطأ في تحديث العنصر: \${error.message}\`);
    res.status(500).json({ message: 'فشل في تحديث العنصر' });
  }
});

/**
 * حذف عنصر
 * @route DELETE /api/${description.toLowerCase().replace(/\s+/g, '-')}/:id
 * @param {number} req.params.id - معرف العنصر
 * @returns {Object} - تأكيد الحذف
 */
router.delete('/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const itemId = Number(req.params.id);
    await storage.deleteItem(itemId);

    res.json({ success: true });
  } catch (error) {
    console.error(\`خطأ في حذف العنصر: \${error.message}\`);
    res.status(500).json({ message: 'فشل في حذف العنصر' });
  }
});

export default router;`
  };

  // تحديد نوع الكود المطلوب بناءً على الوصف
  let codeType = 'واجهة';

  if (description.includes('تحليل') || description.includes('إحصائيات') || description.includes('تقرير')) {
    codeType = 'تحليل';
  } else if (description.includes('api') || description.includes('خدمة') || description.includes('واجهة برمجة')) {
    codeType = 'api';
  }

  const generatedCode = codeSamples[codeType];
  await saveGeneratedCode(generatedCode, description);

  return generatedCode;
}

async function saveGeneratedCode(code: string, description: string): Promise<string> {
  try {
    // إنشاء اسم ملف فريد
    const uniqueId = crypto.randomBytes(3).toString('hex');
    const timestamp = Date.now();
    const filename = `Generated-${timestamp}-${uniqueId}.js`;
    const filePath = path.join(process.cwd(), 'generated-code', filename);

    // حفظ الكود في ملف
    await fs.writeFile(filePath, `// ${description}\n\n${code}`);
    console.log(`✅ تم حفظ الكود المولد في: ${filePath}`);

    return filename;
  } catch (error) {
    console.error('خطأ في حفظ الكود المولد:', error);
    return '';
  }
}

/**
 * تحليل رمز المشروع وإنشاء تقرير شامل
 */
export async function analyzeProjectCode(): Promise<string> {
  try {
    // جمع معلومات عن المشروع
    const [filesCount, frontendFiles, backendFiles, databaseInfo, serverInfo] = await Promise.all([
      countProjectFiles(),
      analyzeFrontendFiles(),
      analyzeBackendFiles(),
      getDatabaseInfo(),
      getServerInfo()
    ]);

    // تجميع التقرير
    return `📊 تقرير تحليل المشروع:

📁 معلومات الملفات:
- إجمالي عدد الملفات: ${filesCount.total}
- ملفات JavaScript/TypeScript: ${filesCount.js}
- ملفات CSS/SCSS: ${filesCount.css}
- ملفات HTML: ${filesCount.html}
- ملفات أخرى: ${filesCount.other}

🖥️ الواجهة الأمامية:
${frontendFiles}

⚙️ الخلفية:
${backendFiles}

🗄️ قاعدة البيانات:
${databaseInfo}

🔌 معلومات الخادم:
${serverInfo}

🚀 الاقتراحات:
1. تحسين أداء قاعدة البيانات من خلال إضافة فهارس للاستعلامات المتكررة
2. تحسين استجابة واجهة المستخدم من خلال تطبيق تقنيات التخزين المؤقت
3. إضافة اختبارات آلية لضمان استقرار التطبيق
4. تحسين أمان النظام من خلال تنفيذ المزيد من تدابير الحماية
5. تحسين توثيق الكود لتسهيل الصيانة المستقبلية

يمكنني مساعدتك في تنفيذ أي من هذه الاقتراحات. ما الذي ترغب في العمل عليه أولاً؟`;
  } catch (error) {
    console.error('خطأ في تحليل المشروع:', error);
    return `حدث خطأ أثناء تحليل المشروع: ${error.message}`;
  }
}

async function countProjectFiles(): Promise<{ total: number, js: number, css: number, html: number, other: number }> {
  try {
    const { stdout } = await execPromise('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l');
    const { stdout: jsCount } = await execPromise('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | wc -l');
    const { stdout: cssCount } = await execPromise('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -name "*.css" -o -name "*.scss" -o -name "*.sass" | wc -l');
    const { stdout: htmlCount } = await execPromise('find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -name "*.html" -o -name "*.htm" | wc -l');

    const total = parseInt(stdout.trim());
    const js = parseInt(jsCount.trim());
    const css = parseInt(cssCount.trim());
    const html = parseInt(htmlCount.trim());

    return {
      total,
      js,
      css,
      html,
      other: total - (js + css + html)
    };
  } catch (error) {
    console.error('خطأ في حساب ملفات المشروع:', error);
    return { total: 0, js: 0, css: 0, html: 0, other: 0 };
  }
}

async function analyzeFrontendFiles(): Promise<string> {
  try {
    // تحليل ملفات الواجهة الأمامية
    const frontendComponents = await storage.getFrontendComponents();

    if (frontendComponents.length === 0) {
      return `- لم يتم العثور على مكونات واجهة المستخدم المحددة
- يمكن تطوير واجهة المستخدم باستخدام React و Material-UI`;
    }

    return `- تم العثور على ${frontendComponents.length} مكون للواجهة الأمامية
- تستخدم التطبيق مكتبة React مع Material-UI
- الصفحات الرئيسية: ${frontendComponents.slice(0, 3).join(', ')}`;
  } catch (error) {
    console.error('خطأ في تحليل ملفات الواجهة الأمامية:', error);
    return `- لم يتم العثور على معلومات كافية عن الواجهة الأمامية: ${error.message}`;
  }
}

async function analyzeBackendFiles(): Promise<string> {
  try {
    // تحليل ملفات الخلفية
    const { stdout: routesCount } = await execPromise('grep -r "app.\\(get\\|post\\|put\\|delete\\|patch\\)" server/ | wc -l');

    return `- تستخدم التطبيق Express.js للخلفية
- تم العثور على حوالي ${routesCount.trim()} مسار API
- تتضمن الوظائف الأساسية: إدارة المستخدمين، المنتجات، المبيعات، والتقارير`;
  } catch (error) {
    console.error('خطأ في تحليل ملفات الخلفية:', error);
    return `- لم يتم العثور على معلومات كافية عن الخلفية: ${error.message}`;
  }
}

async function getDatabaseInfo(): Promise<string> {
  try {
    // جمع معلومات قاعدة البيانات
    const products = await storage.getProducts();
    const customers = await storage.searchCustomers('');
    const sales = await storage.getSales();

    return `- نوع قاعدة البيانات: PostgreSQL
- عدد جداول البيانات الرئيسية: 8+
- إجمالي السجلات:
  * المنتجات: ${products.length}
  * العملاء: ${customers.length}
  * المبيعات: ${sales.length}`;
  } catch (error) {
    console.error('خطأ في جمع معلومات قاعدة البيانات:', error);
    return `- لم يتم العثور على معلومات كافية عن قاعدة البيانات: ${error.message}`;
  }
}

async function getServerInfo(): Promise<string> {
  try {
    const { stdout: memInfo } = await execPromise('free -h | grep "Mem:"');
    const { stdout: diskInfo } = await execPromise('df -h | grep "/$"');

    return `- يعمل الخادم على بيئة Node.js
- ذاكرة النظام: ${memInfo.trim()}
- مساحة القرص: ${diskInfo.trim()}`;
  } catch (error) {
    console.error('خطأ في جمع معلومات الخادم:', error);
    return `- لم يتم العثور على معلومات كافية عن الخادم: ${error.message}`;
  }
}

/**
 * فحص مشكلة محددة وتوليد حل
 * @param problem وصف المشكلة
 * @returns حل مقترح
 */
export async function analyzeProblemAndSuggestFix(problem: string): Promise<string> {
  try {
    console.log(`🔍 تحليل المشكلة: "${problem}"`);

    // محاكاة تحليل المشكلة
    await new Promise(resolve => setTimeout(resolve, 800));

    let solution = '';

    // تصنيف المشكلة بناءً على النص
    if (problem.includes('أداء') || problem.includes('بطيء') || problem.includes('تحسين السرعة')) {
      solution = `🚀 حلول لتحسين الأداء:

1. تحسين استعلامات قاعدة البيانات من خلال:
   - إضافة فهارس للأعمدة الأكثر استخدامًا في الاستعلامات
   - تحسين بنية الاستعلامات واستخدام الاستعلامات المجمعة

2. تحسين أداء الواجهة الأمامية:
   - تطبيق التخزين المؤقت للبيانات على جانب العميل
   - تحسين تحميل الموارد باستخدام التحميل الكسول للمكونات

3. تحسين الخلفية:
   - تنفيذ التخزين المؤقت للاستعلامات المتكررة
   - تطبيق نظام الذاكرة المؤقتة Redis لتسريع الاستجابة

يمكنني مساعدتك في تنفيذ أي من هذه الحلول. ما الذي تفضل البدء به؟`;
    } else if (problem.includes('واجهة') || problem.includes('تصميم') || problem.includes('UI') || problem.includes('UX')) {
      solution = `🎨 حلول لتحسين واجهة المستخدم:

1. تحديث تصميم الواجهة باستخدام:
   - نظام ألوان أكثر تناسقًا وجاذبية
   - تحسين التباعد والهوامش لتحقيق مظهر أكثر نظافة

2. تحسين تجربة المستخدم:
   - تبسيط تدفقات العمل الرئيسية
   - إضافة تلميحات وإرشادات للمستخدمين الجدد
   - تحسين سرعة استجابة الواجهة

3. إضافة ميزات جديدة:
   - لوحة معلومات مخصصة لكل مستخدم
   - رسوم بيانية تفاعلية لعرض البيانات
   - وضع الطباعة للتقارير والفواتير

يمكنني إنشاء تصميم أولي لأي من هذه التحسينات. ما رأيك؟`;
    } else if (problem.includes('تقارير') || problem.includes('تحليل') || problem.includes('إحصائيات')) {
      solution = `📊 حلول لتحسين التقارير والتحليلات:

1. إضافة تقارير جديدة:
   - تقرير المبيعات اليومية/الأسبوعية/الشهرية
   - تحليل اتجاهات المبيعات مع مرور الوقت
   - مقارنة أداء المنتجات المختلفة

2. تحسين طريقة عرض التقارير:
   - إضافة رسوم بيانية تفاعلية
   - خيارات تصفية وتخصيص التقارير
   - إمكانية تصدير التقارير بتنسيقات مختلفة (PDF، Excel)

3. إضافة لوحة معلومات تحليلية:
   - عرض المؤشرات الرئيسية في مكان واحد
   - تحديثات في الوقت الفعلي للبيانات المهمة
   - تنبيهات مخصصة بناءً على معايير محددة

هل تريدني أن أبدأ بتنفيذ أي من هذه الميزات؟`;
    } else if (problem.includes('خطأ') || problem.includes('مشكلة') || problem.includes('لا يعمل')) {
      solution = `🛠️ خطوات استكشاف المشكلة وإصلاحها:

1. تحديد المشكلة:
   - مراجعة سجلات الخطأ في الخادم
   - فحص استجابات API للأخطاء
   - تحليل سلوك المستخدم الذي يؤدي إلى المشكلة

2. الحلول المقترحة:
   - تحديث إصدارات المكتبات التي قد تكون قديمة
   - إصلاح مشكلات تزامن البيانات بين الواجهة والخلفية
   - تحسين معالجة الأخطاء وعرض رسائل أكثر وضوحًا للمستخدمين

3. إجراءات وقائية:
   - إضافة اختبارات آلية لمنع تكرار المشكلة
   - تحسين آليات المراقبة والإبلاغ عن الأخطاء
   - توثيق المشكلة والحل لمراجعته في المستقبل

هل يمكنك تقديم مزيد من التفاصيل حول المشكلة المحددة التي تواجهها؟`;
    } else {
      // حل عام للمشكلات الأخرى
      solution = `🔍 تحليل الطلب "${problem}":

بناءً على طلبك، يمكنني اقتراح الخطوات التالية:

1. فهم المتطلبات:
   - تحديد الأهداف الرئيسية للميزة أو التحسين المطلوب
   - تحديد المستخدمين المستهدفين والقيمة المضافة لهم

2. التنفيذ المقترح:
   - تطوير الميزة باستخدام تقنيات متوافقة مع النظام الحالي
   - دمج الحل بسلاسة مع واجهة المستخدم والخلفية الحالية

3. خطة التنفيذ:
   - تحديث قاعدة البيانات لدعم الميزة الجديدة
   - إضافة واجهات API اللازمة في الخلفية
   - تطوير مكونات واجهة المستخدم المطلوبة

هل ترغب في المضي قدمًا في تنفيذ هذا الحل؟ يمكنني البدء بإنشاء نموذج أولي للعرض.`;
    }

    return solution;
  } catch (error) {
    console.error('خطأ في تحليل المشكلة:', error);
    return `لم أتمكن من تحليل المشكلة بشكل كامل. الخطأ: ${error.message}`;
  }
}