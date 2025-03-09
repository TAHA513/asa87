import { Telegraf } from 'telegraf';
import { generateCodeWithOpenAI } from './code-generator';
import { executeCode } from './command-executor';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء بوت تلجرام مع خيارات لتجنب التعارض
export const startTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ لم يتم العثور على رمز بوت تلجرام');
    return null;
  }

  try {
    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    // تخزين الأكواد المقترحة بانتظار الموافقة
    const pendingCode: { [key: string]: string } = {};

    bot.start((ctx) => {
      ctx.reply(`👋 مرحباً ${ctx.from?.first_name || ""}! أنا مساعدك البرمجي.

🚀 *كيفية استخدام البوت:*
1️⃣ أرسل \`/generate\` متبوعًا بوصف ما تريد إنشاءه باللغة العربية
2️⃣ سأقوم بإنشاء الكود المناسب وعرضه عليك
3️⃣ يمكنك الموافقة على الكود باستخدام الزر المرفق

*مثال:* \`/generate إنشاء صفحة تسجيل دخول بسيطة مع حقل البريد الإلكتروني وكلمة المرور وزر تسجيل الدخول\``, 
        { parse_mode: 'Markdown' });
    });

    bot.command('generate', async (ctx) => {
      const command = ctx.message.text.replace('/generate ', '');
      if (!command) {
        return ctx.reply('❌ يرجى إدخال الأمر البرمجي المطلوب.');
      }

      try {
        await ctx.reply('🔄 جاري تحليل الأمر وإنشاء الكود...');
        const generatedCode = await generateCodeWithOpenAI(command);
        const chatId = ctx.chat.id.toString();
        pendingCode[chatId] = generatedCode;

        await ctx.reply('🔹 *الكود المقترح:*\n```\n' + generatedCode + '\n```', { 
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ موافق", callback_data: "approve:" + chatId },
                { text: "❌ رفض", callback_data: "reject:" + chatId }
              ]
            ]
          }
        });
      } catch (error) {
        console.error('Error generating code:', error);
        ctx.reply('❌ حدث خطأ أثناء إنشاء الكود. يرجى المحاولة مرة أخرى.');
      }
    });

    bot.action(/approve:(.+)/, async (ctx) => {
      const chatId = ctx.match![1];
      if (!pendingCode[chatId]) {
        return ctx.reply('❌ لا يوجد كود بانتظار الموافقة.');
      }

      try {
        await ctx.reply('🔄 جاري تنفيذ التعديلات...');
        const filePath = await executeCode(pendingCode[chatId]);

        await ctx.reply(`✅ تم تنفيذ التعديلات بنجاح!\n\n📝 تم إنشاء/تعديل الملف: ${filePath}`);
        delete pendingCode[chatId];
      } catch (error) {
        console.error('Error executing code:', error);
        ctx.reply(`❌ حدث خطأ أثناء تنفيذ الكود: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    });

    bot.action(/reject:(.+)/, (ctx) => {
      const chatId = ctx.match![1];
      if (!pendingCode[chatId]) {
        return ctx.reply('❌ لا يوجد كود بانتظار الرفض.');
      }

      ctx.reply('❌ تم إلغاء التعديلات.');
      delete pendingCode[chatId];
    });


    return bot.launch()
      .then(() => {
        console.log('✅ بوت تلجرام يعمل الآن!');
        return bot;
      })
      .catch((error) => {
        console.error('❌ حدث خطأ أثناء تشغيل بوت تلجرام:', error);
        throw error;
      });

  } catch (error) {
    console.error('❌ حدث خطأ أثناء إنشاء بوت تلجرام:', error);
    throw error;
  }
};