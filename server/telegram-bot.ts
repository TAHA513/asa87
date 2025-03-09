
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
    
    // تحقق ما إذا كان المستخدم مسموحًا له باستخدام البوت
    if (ALLOWED_USER_ID && userId !== ALLOWED_USER_ID) {
      console.log(`⛔ وصول مرفوض: المستخدم ${userId} ليس مصرحًا له`);
      return ctx.reply('غير مصرح لك باستخدام هذا البوت.');
    }
    
    return next();
  });

  // معالجة أمر /start
  bot.start((ctx) => {
    ctx.reply(`مرحبًا ${ctx.from.first_name}! 👋\n\nأنا بوت مساعد لتطوير النظام الخاص بك. يمكنك إرسال أوامر برمجية وسأقوم بتنفيذها.\n\nأرسل /help للحصول على المساعدة.`);
  });

  // معالجة أمر /help
  bot.help((ctx) => {
    ctx.reply(`🔍 كيفية استخدام البوت:\n\n• أرسل أي أمر برمجي بلغة عربية مفهومة.\n• استخدم /execute [أمر] لتنفيذ أمر مباشرة.\n• استخدم /code [وصف] لتوليد كود بناءً على الوصف.\n• استخدم /status للتحقق من حالة النظام.`);
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
  bot.command('status', (ctx) => {
    ctx.reply('✅ النظام يعمل بشكل طبيعي. الخدمات متاحة.');
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
