import { Telegraf } from 'telegraf';
import { generateCodeWithOpenAI } from './code-generator';
import { executeCode } from './command-executor';
import dotenv from 'dotenv';

dotenv.config();

export const startTelegramBot = async () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ لم يتم العثور على رمز بوت تلجرام');
    return null;
  }

  try {
    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    // تخزين الأكواد المقترحة بانتظار الموافقة
    const pendingCode: { [key: string]: string } = {};

    bot.start((ctx) => {
      return ctx.reply(`👋 مرحباً ${ctx.from?.first_name || ""}! أنا مساعدك البرمجي.

🚀 *كيفية استخدام البوت:*
1️⃣ أرسل \`/generate\` متبوعًا بوصف ما تريد إنشاءه باللغة العربية
2️⃣ سأقوم بإنشاء الكود المناسب وعرضه عليك
3️⃣ يمكنك الموافقة على الكود باستخدام الزر المرفق

*مثال:* \`/generate إنشاء صفحة تسجيل دخول بسيطة\``, 
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

        // تقسيم الكود إلى أجزاء إذا كان طويلاً
        const MAX_LENGTH = 4000;
        if (generatedCode.length > MAX_LENGTH) {
          const parts = [];
          for (let i = 0; i < generatedCode.length; i += MAX_LENGTH) {
            parts.push(generatedCode.slice(i, i + MAX_LENGTH));
          }

          for (let i = 0; i < parts.length; i++) {
            await ctx.reply(`جزء ${i + 1}/${parts.length}:\n\`\`\`\n${parts[i]}\n\`\`\``, {
              parse_mode: 'Markdown'
            });
          }
        } else {
          await ctx.reply(`\`\`\`\n${generatedCode}\n\`\`\``, {
            parse_mode: 'Markdown'
          });
        }

        await ctx.reply('هل تريد تنفيذ هذا الكود؟', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ نعم', callback_data: `approve_${chatId}` },
                { text: '❌ لا', callback_data: `reject_${chatId}` }
              ]
            ]
          }
        });
      } catch (error) {
        console.error('Error generating code:', error);
        ctx.reply('❌ حدث خطأ أثناء إنشاء الكود. يرجى المحاولة مرة أخرى.');
      }
    });

    bot.action(/approve_(.+)/, async (ctx) => {
      const chatId = ctx.match[1];
      if (!pendingCode[chatId]) {
        return ctx.reply('❌ لا يوجد كود بانتظار الموافقة.');
      }

      try {
        await ctx.reply('🔄 جاري تنفيذ الكود...');
        const filePath = await executeCode(pendingCode[chatId]);
        await ctx.reply(`✅ تم تنفيذ الكود بنجاح!\nالملف: ${filePath}`);
        delete pendingCode[chatId];
      } catch (error) {
        console.error('Error executing code:', error);
        ctx.reply(`❌ حدث خطأ أثناء التنفيذ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    });

    bot.action(/reject_(.+)/, async (ctx) => {
      const chatId = ctx.match[1];
      if (!pendingCode[chatId]) {
        return ctx.reply('❌ لا يوجد كود بانتظار الرفض.');
      }
      await ctx.reply('تم إلغاء تنفيذ الكود.');
      delete pendingCode[chatId];
    });

    // معالجة الأخطاء العامة
    bot.catch((err) => {
      console.error('Telegram bot error:', err);
    });

    await bot.launch();
    console.log('✅ تم تشغيل بوت التلجرام بنجاح!');

    // إيقاف البوت بشكل آمن عند إغلاق التطبيق
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    return bot;
  } catch (error) {
    console.error('❌ حدث خطأ أثناء بدء بوت التلجرام:', error);
    throw error;
  }
};