import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { generateCodeWithOpenAI } from './code-generator';
import { executeCode } from './command-executor';

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء بوت تلجرام مع خيارات لتجنب التعارض
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '', {
  telegram: {
    webhookReply: false  // تعطيل webhooks لتجنب تعارض التحديثات
  }
});


// تخزين الأكواد المقترحة بانتظار الموافقة
interface PendingCodeType {
  [key: string]: string;
}

let pendingCode: PendingCodeType = {};

bot.start((ctx) => {
  ctx.reply(`👋 مرحباً ${ctx.from?.first_name || ""}! أنا مساعدك البرمجي.

🚀 *كيفية استخدام البوت:*
1️⃣ أرسل \`/generate\` متبوعًا بوصف ما تريد إنشاءه باللغة العربية
2️⃣ سأقوم بإنشاء الكود المناسب وعرضه عليك
3️⃣ يمكنك الموافقة على الكود باستخدام \`/approve\` أو رفضه باستخدام \`/reject\`

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

    // تقسيم الكود إلى أجزاء صغيرة للتعامل مع حدود تلجرام
    const MAX_MESSAGE_LENGTH = 2000;
    
    // إرسال رسالة مقدمة
    await ctx.reply('🔹 *الكود المقترح:*', { parse_mode: 'Markdown' });
    
    // تقسيم الكود الطويل إلى أجزاء
    if (generatedCode.length > MAX_MESSAGE_LENGTH) {
      // تقسيم الكود إلى أجزاء وإرسالها
      let codeChunks = [];
      for (let i = 0; i < generatedCode.length; i += MAX_MESSAGE_LENGTH) {
        codeChunks.push(generatedCode.substring(i, i + MAX_MESSAGE_LENGTH));
      }
      
      // إرسال الأجزاء واحدًا تلو الآخر
      for (let i = 0; i < codeChunks.length; i++) {
        await ctx.reply(`*الجزء ${i+1}/${codeChunks.length}:*\n\`\`\`\n${codeChunks[i]}\n\`\`\``, { parse_mode: 'Markdown' })
          .catch(async (err) => {
            // في حالة الفشل، جرب بدون تنسيق Markdown
            console.log('خطأ في إرسال الكود بتنسيق Markdown:', err);
            await ctx.reply(`الجزء ${i+1}/${codeChunks.length}:\n${codeChunks[i]}`);
          });
      }
    } else {
      // إرسال الكود كاملًا في رسالة واحدة
      await ctx.reply(`\`\`\`\n${generatedCode}\n\`\`\``, { parse_mode: 'Markdown' })
        .catch(async (err) => {
          // في حالة الفشل، جرب بدون تنسيق
          console.log('خطأ في إرسال الكود بتنسيق Markdown:', err);
          await ctx.reply(generatedCode);
        });
    }
    
    // إرسال رسالة تأكيد
    await ctx.reply('✅ *هل توافق على هذا الكود؟*\n✔️ للموافقة، أرسل: `/approve`\n❌ للرفض، أرسل: `/reject`', { parse_mode: 'Markdown' });
    
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
    await ctx.reply('🔄 جاري تنفيذ التعديلات...');
    const filePath = await executeCode(pendingCode[chatId]);
    
    await ctx.reply(`✅ تم تنفيذ التعديلات بنجاح!
    
📝 *تفاصيل التنفيذ:*
- تم إنشاء/تعديل الملف: \`${filePath}\`
- حجم الكود: ${pendingCode[chatId].length} حرف
    
🚀 يمكنك الآن استخدام الكود في مشروعك.`, { parse_mode: 'Markdown' });
    
    delete pendingCode[chatId];
  } catch (error) {
    console.error('Error executing code:', error);
    ctx.reply(`❌ حدث خطأ أثناء تنفيذ الكود: ${error.message}\nيرجى المحاولة مرة أخرى.`);
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