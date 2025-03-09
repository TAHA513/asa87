
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { executeCommand } from './command-executor';
import { generateCodeWithOpenAI } from './code-generator';

dotenv.config();

// استخراج رمز البوت من متغيرات البيئة
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ALLOWED_USER_ID = process.env.TELEGRAM_USER_ID || '';

// إنشاء مثيل من بوت التلجرام
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

/**
 * بدء تشغيل بوت التلجرام
 */
export function startTelegramBot() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ لم يتم العثور على رمز بوت التلجرام. تخطي تشغيل البوت.');
    return;
  }

  console.log('🤖 بدء تشغيل بوت التلجرام...');

  // التحقق من هوية المستخدم
  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id.toString();
    
    // للتطوير فقط: طباعة معرف المستخدم للتشخيص
    console.log(`👤 محاولة استخدام البوت من قبل المستخدم: ${userId}`);
    
    // إذا كان معرف المستخدم المسموح به غير محدد، السماح لجميع المستخدمين
    if (!ALLOWED_USER_ID || ALLOWED_USER_ID === '') {
      return next();
    }
    
    // تحقق ما إذا كان المستخدم مسموحًا له باستخدام البوت
    if (userId !== ALLOWED_USER_ID) {
      console.log(`⛔ وصول مرفوض: المستخدم ${userId} ليس مصرحًا له، المستخدم المسموح به هو ${ALLOWED_USER_ID}`);
      return ctx.reply('غير مصرح لك باستخدام هذا البوت.');
    }
    
    return next();
  });

  // معالجة أمر /start
  bot.start((ctx) => {
    ctx.reply(`مرحبًا ${ctx.from.first_name}! 👋\n\nأنا بوت مساعد لمراقبة وإدارة النظام الخاص بك. يمكنك إرسال أوامر بالعربية وسأقوم بتنفيذها وتحليل النظام وحل المشاكل.\n\nأرسل /help للحصول على قائمة الأوامر المتاحة.`);
  });

  // معالجة أمر /help
  bot.help((ctx) => {
    ctx.reply(`🔍 الأوامر المتاحة:

• /status - عرض حالة النظام ومعلومات عن الموارد المستخدمة
• /services - مراقبة حالة الخدمات المختلفة
• /files - عرض قائمة بالملفات الموجودة في النظام
• /debug [المكون] - محاولة تصحيح مشكلة في مكون محدد
• /execute [أمر] - تنفيذ أمر مباشرة
• /code [وصف] - توليد كود بناءً على وصف معين

يمكنك أيضًا إرسال أي استفسار أو طلب بالعربية وسأحاول مساعدتك.`);
  });

  // معالجة أمر /execute
  bot.command('execute', async (ctx) => {
    const command = ctx.message.text.substring('/execute'.length).trim();
    
    if (!command) {
      return ctx.reply('⚠️ يرجى تحديد الأمر الذي تريد تنفيذه. مثال: /execute إضافة زر جديد');
    }

    try {
      ctx.reply(`🔄 جاري تنفيذ الأمر: "${command}"`);
      
      const result = await executeCommand(command);
      ctx.reply(`✅ تم تنفيذ الأمر بنجاح:\n\n${result}`);
    } catch (error) {
      console.error('❌ خطأ في تنفيذ الأمر:', error);
      ctx.reply(`❌ حدث خطأ أثناء تنفيذ الأمر: ${error.message}`);
    }
  });

  // معالجة أمر /code
  bot.command('code', async (ctx) => {
    const description = ctx.message.text.substring('/code'.length).trim();
    
    if (!description) {
      return ctx.reply('⚠️ يرجى تحديد وصف للكود الذي تريد توليده. مثال: /code إنشاء صفحة تسجيل الدخول');
    }

    try {
      ctx.reply(`🔄 جاري توليد الكود بناءً على: "${description}"`);
      
      const generatedCode = await generateCodeWithOpenAI(description);
      ctx.reply(`✅ تم توليد الكود بنجاح:\n\n\`\`\`\n${generatedCode}\n\`\`\``);
    } catch (error) {
      console.error('❌ خطأ في توليد الكود:', error);
      ctx.reply(`❌ حدث خطأ أثناء توليد الكود: ${error.message}`);
    }
  });

  // معالجة أمر /status
  bot.command('status', async (ctx) => {
    try {
      ctx.reply('🔄 جاري فحص حالة النظام...');
      
      const result = await executeCommand('فحص النظام');
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في فحص حالة النظام:', error);
      ctx.reply(`❌ حدث خطأ أثناء فحص حالة النظام: ${error.message}`);
    }
  });
  
  // معالجة أمر /services
  bot.command('services', async (ctx) => {
    try {
      ctx.reply('🔄 جاري فحص حالة الخدمات...');
      
      const result = await executeCommand('مراقبة الخدمات');
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في فحص حالة الخدمات:', error);
      ctx.reply(`❌ حدث خطأ أثناء فحص حالة الخدمات: ${error.message}`);
    }
  });
  
  // معالجة أمر /files
  bot.command('files', async (ctx) => {
    try {
      ctx.reply('🔄 جاري عرض قائمة الملفات...');
      
      const result = await executeCommand('قائمة الملفات');
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في عرض قائمة الملفات:', error);
      ctx.reply(`❌ حدث خطأ أثناء عرض قائمة الملفات: ${error.message}`);
    }
  });
  
  // معالجة أمر /debug
  bot.command('debug', async (ctx) => {
    try {
      const message = ctx.message.text.substring('/debug'.length).trim();
      
      if (!message) {
        return ctx.reply('⚠️ يرجى تحديد اسم الخدمة أو المكون الذي تريد تصحيحه. مثال: /debug بوت التلجرام');
      }
      
      ctx.reply(`🔍 جاري تصحيح: "${message}"`);
      
      // هنا يمكن إضافة منطق أكثر تفصيلاً لتصحيح مكونات محددة
      const result = await executeCommand(`تصحيح ${message}`);
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في تصحيح المكون:', error);
      ctx.reply(`❌ حدث خطأ أثناء تصحيح المكون: ${error.message}`);
    }
  });

  // معالجة الرسائل العادية
  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (text.startsWith('/')) {
      return; // تجاهل الأوامر غير المعروفة
    }

    try {
      ctx.reply(`🔄 جاري معالجة طلبك: "${text}"`);
      
      // معالجة الرسالة كأمر للتنفيذ
      const result = await executeCommand(text);
      ctx.reply(`✅ تم تنفيذ طلبك بنجاح:\n\n${result}`);
    } catch (error) {
      console.error('❌ خطأ في معالجة الرسالة:', error);
      ctx.reply(`❌ حدث خطأ أثناء معالجة طلبك: ${error.message}`);
    }
  });

  // معالجة الأخطاء
  bot.catch((error) => {
    console.error('❌ خطأ في بوت التلجرام:', error);
  });

  // بدء الاستماع للتحديثات
  bot.launch()
    .then(() => {
      console.log('✅ تم تشغيل بوت التلجرام بنجاح');
    })
    .catch((error) => {
      console.error('❌ فشل في تشغيل بوت التلجرام:', error);
    });

  // إيقاف البوت بشكل نظيف عند إيقاف البرنامج
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
