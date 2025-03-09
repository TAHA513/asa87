import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { generateCodeWithOpenAI } from './code-generator';
import { executeCode } from './command-executor';

// تحميل متغيرات البيئة
dotenv.config();

//const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// إضافة خيارات لتجنب التعارض
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
    telegram: {
      // تعطيل webhooks لتجنب التعارض
      webhookReply: false
    }
  });


// تخزين الأكواد المقترحة بانتظار الموافقة
interface PendingCodeType {
  [key: string]: string;
}

let pendingCode: PendingCodeType = {};

bot.start((ctx) => {
  ctx.reply('👋 مرحباً! يمكنك إرسال أوامر تطوير النظام باللغة العربية.');
});

bot.command('generate', async (ctx) => {
  const command = ctx.message.text.replace('/generate ', '');
  if (!command) {
    return ctx.reply('❌ يرجى إدخال الأمر البرمجي المطلوب.');
  }

  try {
    ctx.reply('🔄 جاري تحليل الأمر وإنشاء الكود...');
    const generatedCode = await generateCodeWithOpenAI(command);
    const chatId = ctx.chat.id.toString();
    pendingCode[chatId] = generatedCode;

    //تقصير الرسالة لتجنب تجاوز الحد المسموح به
    const shortenedCode = generatedCode.length > 4096 ? generatedCode.substring(0, 4096) + "..." : generatedCode;

    await ctx.reply(`🔹 **الكود المقترح:**\n\`\`\`\n${shortenedCode}\n\`\`\`\n\n✔️ **للموافقة، أرسل**: /approve\n❌ **للرفض، أرسل**: /reject`, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error generating code:', error);
    ctx.reply('❌ حدث خطأ أثناء إنشاء الكود. يرجى المحاولة مرة أخرى.');
  }
});

bot.command('approve', async (ctx) => {
  const chatId = ctx.chat.id.toString();
  if (!pendingCode[chatId]) {
    return ctx.reply('❌ لا يوجد كود بانتظار الموافقة.');
  }

  try {
    await executeCode(pendingCode[chatId]);
    ctx.reply('✅ تم تنفيذ التعديلات بنجاح.');
    delete pendingCode[chatId];
  } catch (error) {
    console.error('Error executing code:', error);
    ctx.reply('❌ حدث خطأ أثناء تنفيذ الكود. يرجى المحاولة مرة أخرى.');
  }
});

bot.command('reject', (ctx) => {
  const chatId = ctx.chat.id.toString();
  if (!pendingCode[chatId]) {
    return ctx.reply('❌ لا يوجد كود بانتظار الرفض.');
  }

  ctx.reply('❌ تم إلغاء التعديلات.');
  delete pendingCode[chatId];
});

export const startTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ لم يتم العثور على رمز بوت تلجرام');
    return null;
  }

  bot.launch()
    .then(() => {
      console.log('✅ بوت تلجرام يعمل الآن!');
    })
    .catch((error) => {
      console.error('❌ حدث خطأ أثناء تشغيل بوت تلجرام:', error);
    });

  // إيقاف البوت بشكل آمن عند إغلاق التطبيق
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};