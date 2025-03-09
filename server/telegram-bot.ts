
import { Telegraf } from 'telegraf';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { executeCommand } from './command-executor';
import * as dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// تهيئة البوت
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// تخزين الأوامر المعلقة
const pendingCommands: Record<string, any> = {};

// التحقق من المستخدم المصرح له
const isAuthorizedUser = (userId: number): boolean => {
  if (!TELEGRAM_USER_ID) {
    return true; // السماح لجميع المستخدمين إذا لم يتم تحديد معرف
  }
  return userId.toString() === TELEGRAM_USER_ID;
};

// تحليل النظام والحصول على معلومات عنه
const analyzeSystem = async () => {
  try {
    const files = await listFiles('./');
    return {
      files: files.slice(0, 20), // إظهار أول 20 ملف
      directories: await listDirectories('./'),
      environment: process.env.NODE_ENV || 'development'
    };
  } catch (error) {
    console.error('خطأ في تحليل النظام:', error);
    return { error: 'فشل في تحليل النظام' };
  }
};

// استدعاء Groq API
const callGroqAPI = async (prompt: string) => {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد ذكي متخصص في تحليل وتطوير البرمجيات. مهمتك:
1. تحليل طلبات المستخدم وفهمها.
2. إنشاء أكواد برمجية دقيقة حسب الطلب.
3. اقتراح تحسينات وإصلاحات للأكواد الموجودة.
4. عندما تقترح تعديلات، قم بإنشاء كود كامل وواضح.
5. تقدم شرحًا موجزًا مع كل اقتراح.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('خطأ في استدعاء Groq API:', error);
    return 'حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.';
  }
};

// حفظ الكود المنشأ
const saveGeneratedCode = async (code: string): Promise<string> => {
  const dir = './generated-code';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const filename = `Generated-${timestamp}-${randomString}.js`;
  const filePath = path.join(dir, filename);

  fs.writeFileSync(filePath, code);
  return filePath;
};

// استعراض الملفات
const listFiles = async (directory: string): Promise<string[]> => {
  try {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    return files
      .filter(file => file.isFile())
      .map(file => path.join(directory, file.name));
  } catch (error) {
    console.error(`خطأ في استعراض الملفات في ${directory}:`, error);
    return [];
  }
};

// استعراض المجلدات
const listDirectories = async (directory: string): Promise<string[]> => {
  try {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    return files
      .filter(file => file.isDirectory() && !file.name.startsWith('.'))
      .map(file => path.join(directory, file.name));
  } catch (error) {
    console.error(`خطأ في استعراض المجلدات في ${directory}:`, error);
    return [];
  }
};

// قراءة محتوى ملف
const readFileContent = (filePath: string): string => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`خطأ في قراءة الملف ${filePath}:`, error);
    return `فشل في قراءة الملف ${filePath}.`;
  }
};

// تنفيذ أمر وإرسال النتيجة
const executeAndSendResult = async (ctx: any, command: string) => {
  try {
    const result = await executeCommand(command);
    await ctx.reply(`تم تنفيذ الأمر:\n${command}\n\nالنتيجة:\n${result.output || 'لا توجد نتيجة'}`);
  } catch (error) {
    await ctx.reply(`فشل في تنفيذ الأمر: ${error.message}`);
  }
};

// تعديل ملف
const modifyFile = (filePath: string, newContent: string): boolean => {
  try {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`خطأ في تعديل الملف ${filePath}:`, error);
    return false;
  }
};

// استقبال الرسائل من المستخدم
bot.on('text', async (ctx) => {
  const userId = ctx.message.from.id;
  
  // التحقق من صلاحية المستخدم
  if (!isAuthorizedUser(userId)) {
    return ctx.reply('غير مصرح لك باستخدام هذا البوت.');
  }

  const userMessage = ctx.message.text;

  // معالجة الأوامر الخاصة
  if (userMessage.startsWith('/')) {
    const commandParts = userMessage.split(' ');
    const command = commandParts[0].substring(1);
    
    switch (command) {
      case 'analyze':
        const systemInfo = await analyzeSystem();
        return ctx.reply(`معلومات النظام:\n${JSON.stringify(systemInfo, null, 2)}`);
        
      case 'files':
        const directory = commandParts[1] || './';
        const files = await listFiles(directory);
        return ctx.reply(`قائمة الملفات في ${directory}:\n${files.join('\n')}`);
        
      case 'cat':
        if (!commandParts[1]) {
          return ctx.reply('يرجى تحديد مسار الملف: /cat [مسار_الملف]');
        }
        const fileContent = readFileContent(commandParts[1]);
        return ctx.reply(`محتوى الملف ${commandParts[1]}:\n\n${fileContent}`);
        
      case 'exec':
        if (!commandParts[1]) {
          return ctx.reply('يرجى تحديد الأمر للتنفيذ: /exec [الأمر]');
        }
        const execCommand = userMessage.substring(6);
        return executeAndSendResult(ctx, execCommand);

      case 'help':
        return ctx.reply(
          'الأوامر المتاحة:\n' +
          '/analyze - تحليل النظام والحصول على معلومات\n' +
          '/files [مسار] - عرض قائمة الملفات في المسار\n' +
          '/cat [مسار_الملف] - عرض محتوى ملف\n' +
          '/exec [أمر] - تنفيذ أمر في النظام\n' +
          '/help - عرض هذه المساعدة\n\n' +
          'أي رسالة أخرى سيتم معالجتها بواسطة Groq API لتحليلها وإنشاء الكود المطلوب.'
        );
        
      default:
        return ctx.reply('أمر غير معروف. استخدم /help للحصول على قائمة الأوامر المتاحة.');
    }
  }

  // معالجة الطلبات العادية مع Groq API
  await ctx.reply('جاري تحليل طلبك...');
  
  const systemInfo = await analyzeSystem();
  const prompt = `طلب المستخدم: ${userMessage}\n\nمعلومات النظام: ${JSON.stringify(systemInfo, null, 2)}`;
  
  // استدعاء Groq API
  const response = await callGroqAPI(prompt);
  
  // استخراج الكود من الإجابة إذا وجد
  const codeRegex = /```(?:javascript|typescript|js|ts)?\s*([\s\S]*?)\s*```/g;
  let match;
  let codeFound = false;
  
  while ((match = codeRegex.exec(response)) !== null) {
    codeFound = true;
    const code = match[1];
    
    // حفظ الكود المنشأ
    const filePath = await saveGeneratedCode(code);
    
    // إضافة الكود إلى الأوامر المعلقة
    const commandId = Date.now().toString();
    pendingCommands[commandId] = {
      code,
      filePath
    };
    
    await ctx.reply(
      `تم تحليل طلبك وإنشاء كود:\n\n${code.substring(0, 200)}${code.length > 200 ? '...' : ''}\n\n` +
      `تم حفظ الكود في: ${filePath}\n\n` +
      `هل ترغب في تنفيذ هذا الكود؟\n` +
      `أرسل /apply_${commandId} للموافقة`
    );
  }
  
  // إذا لم يتم العثور على كود، أرسل الإجابة كاملة
  if (!codeFound) {
    const chunks = chunkString(response, 4000);
    for (const chunk of chunks) {
      await ctx.reply(chunk);
    }
  }
});

// معالجة أوامر تطبيق الكود
bot.hears(/\/apply_(\d+)/, async (ctx) => {
  const userId = ctx.message.from.id;
  
  // التحقق من صلاحية المستخدم
  if (!isAuthorizedUser(userId)) {
    return ctx.reply('غير مصرح لك باستخدام هذا البوت.');
  }

  const commandId = ctx.match[1];
  const pendingCommand = pendingCommands[commandId];
  
  if (!pendingCommand) {
    return ctx.reply('الأمر غير موجود أو منتهي الصلاحية.');
  }
  
  await ctx.reply(`جاري تنفيذ الكود...`);
  
  try {
    // تنفيذ الكود
    const result = await executeCommand(`node "${pendingCommand.filePath}"`);
    
    // حذف الأمر من قائمة الانتظار
    delete pendingCommands[commandId];
    
    await ctx.reply(`تم تنفيذ الكود بنجاح!\n\nالنتيجة:\n${result.output || 'لا توجد نتيجة'}`);
  } catch (error) {
    await ctx.reply(`فشل في تنفيذ الكود: ${error.message}`);
  }
});

// تقسيم النص الطويل
function chunkString(str: string, size: number): string[] {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

// تصدير دالة بدء تشغيل البوت
export function startTelegramBot() {
  bot.launch()
    .then(() => {
      console.log('بوت تلجرام قيد التشغيل...');
    })
    .catch(err => {
      console.error('فشل في تشغيل بوت تلجرام:', err);
    });

  // إيقاف التشغيل بأمان عند الإغلاق
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// إنشاء نسخة جديدة من البوت لتجنب المشاكل
export const telegramBot = bot;
