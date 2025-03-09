import { Telegraf } from 'telegraf';
import { generateCodeWithOpenAI } from './code-generator';
import { executeCode } from './command-executor';
import dotenv from 'dotenv';

dotenv.config();

export const startTelegramBot = async () => {
  const BOT_ID = '7929618679';

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ لم يتم العثور على رمز بوت تلجرام');
    return null;
  }

  try {
    // إنشاء نسخة من البوت مع الإعدادات الصحيحة
    console.log('🔄 جاري تهيئة بوت التلجرام...');

    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN, {
      telegram: {
        apiRoot: 'https://api.telegram.org',
        webhookReply: false
      }
    });

    // تخزين الأكواد المقترحة بانتظار الموافقة
    const pendingCode: { [key: string]: string } = {};

    // التحقق من اتصال البوت
    try {
      const botInfo = await bot.telegram.getMe();
      console.log('✅ تم الاتصال بالبوت:', botInfo.username);
      if (botInfo.id.toString() !== BOT_ID) {
        console.warn('⚠️ معرف البوت مختلف عن المتوقع:', botInfo.id.toString());
      }
    } catch (error) {
      console.error('❌ فشل الاتصال بالبوت:', error);
      throw error;
    }

    bot.start((ctx) => {
      return ctx.reply(`👋 مرحباً ${ctx.from?.first_name || ""}! أنا مساعدك البرمجي.

🚀 *كيفية استخدام البوت:*
1️⃣ أرسل \`/generate\` متبوعًا بوصف ما تريد إنشاءه باللغة العربية
2️⃣ سأقوم بإنشاء الكود المناسب وعرضه عليك
3️⃣ يمكنك الموافقة على الكود باستخدام الأزرار المرفقة

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
        console.log('🔄 جاري إرسال الأمر إلى GROQ API:', command);

        const generatedCode = await generateCodeWithOpenAI(command);
        console.log('✅ تم استلام الكود من GROQ API');

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

    // معالجة الرسائل العادية
    bot.on('text', (ctx) => {
      if (!ctx.message.text.startsWith('/')) {
        return ctx.reply('🤖 مرحباً! يرجى استخدام الأمر /generate متبوعاً بوصف ما تريد إنشاءه.');
      }
    });

    // معالجة الأخطاء
    bot.catch((err) => {
      console.error('Telegram bot error:', err);
    });

    // بدء البوت مع تجاهل الرسائل القديمة
    console.log('🔄 جاري بدء بوت التلجرام...');
    await bot.launch({
      dropPendingUpdates: true
    });
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