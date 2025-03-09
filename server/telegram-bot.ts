
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

🖥️ أوامر النظام:
• /status - عرض حالة النظام ومعلومات عن الموارد المستخدمة
• /services - مراقبة حالة الخدمات المختلفة
• /files - عرض قائمة بالملفات الموجودة في النظام
• /analyze - إجراء تحليل شامل للنظام واقتراح تحسينات
• /database - تحليل هيكل قاعدة البيانات

🔧 أوامر التطوير:
• /execute [أمر] - تنفيذ أمر مباشرة
• /code [وصف] - توليد كود بناءً على وصف معين
• /implement [وصف] - تنفيذ ميزة جديدة تلقائيًا
• /fix [وصف] - إصلاح مشكلة تلقائيًا
• /debug [المكون] - محاولة تصحيح مشكلة في مكون محدد
• /suggest - اقتراح تحسينات للنظام

💬 يمكنك أيضًا إرسال أي استفسار أو طلب بالعربية مثل:
• "درس النظام وأعطني اقتراحات للتحسين"
• "أضف ميزة لتتبع المخزون"
• "أصلح مشكلة في تسجيل الدخول"
• "قم بتحليل النظام وتنفيذ التحسينات المطلوبة تلقائيًا"

سأقوم بتحليل طلبك وتنفيذه مباشرة في النظام.`);
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

  // معالجة أمر /analyze - تحليل النظام
  bot.command('analyze', async (ctx) => {
    try {
      ctx.reply('🔄 جاري إجراء تحليل شامل للنظام...');
      
      const result = await executeCommand('تحليل النظام بالكامل');
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في تحليل النظام:', error);
      ctx.reply(`❌ حدث خطأ أثناء تحليل النظام: ${error.message}`);
    }
  });
  
  // معالجة أمر /suggest - اقتراح تحسينات
  bot.command('suggest', async (ctx) => {
    try {
      ctx.reply('🔄 جاري توليد اقتراحات لتحسين النظام...');
      
      const result = await executeCommand('اقتراح تحسينات');
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في اقتراح تحسينات:', error);
      ctx.reply(`❌ حدث خطأ أثناء اقتراح تحسينات: ${error.message}`);
    }
  });
  
  // معالجة أمر /implement - تنفيذ ميزة تلقائيًا
  bot.command('implement', async (ctx) => {
    const description = ctx.message.text.substring('/implement'.length).trim();
    
    if (!description) {
      return ctx.reply('⚠️ يرجى تحديد وصف للميزة التي تريد تنفيذها. مثال: /implement إضافة نظام تنبيهات للمخزون المنخفض');
    }

    try {
      ctx.reply(`🔄 جاري تنفيذ الميزة تلقائيًا: "${description}"`);
      
      const result = await executeCommand(`نفذ تلقائيًا: ${description}`);
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في تنفيذ الميزة:', error);
      ctx.reply(`❌ حدث خطأ أثناء تنفيذ الميزة: ${error.message}`);
    }
  });
  
  // معالجة أمر /fix - إصلاح مشكلة تلقائيًا
  bot.command('fix', async (ctx) => {
    const description = ctx.message.text.substring('/fix'.length).trim();
    
    if (!description) {
      return ctx.reply('⚠️ يرجى تحديد وصف للمشكلة التي تريد إصلاحها. مثال: /fix مشكلة في تسجيل الدخول');
    }

    try {
      ctx.reply(`🔄 جاري إصلاح المشكلة تلقائيًا: "${description}"`);
      
      const result = await executeCommand(`أصلح تلقائيًا: ${description}`);
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في إصلاح المشكلة:', error);
      ctx.reply(`❌ حدث خطأ أثناء إصلاح المشكلة: ${error.message}`);
    }
  });
  
  // معالجة أمر /database - تحليل قاعدة البيانات
  bot.command('database', async (ctx) => {
    try {
      ctx.reply('🔄 جاري تحليل هيكل قاعدة البيانات...');
      
      const result = await executeCommand('تحليل قاعدة البيانات');
      ctx.reply(result);
    } catch (error) {
      console.error('❌ خطأ في تحليل قاعدة البيانات:', error);
      ctx.reply(`❌ حدث خطأ أثناء تحليل قاعدة البيانات: ${error.message}`);
    }
  });

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

  // تخزين الطلبات التي تنتظر الموافقة
  const pendingApprovals = new Map();
  
  // أوامر الموافقة والرفض
  bot.command('approve', async (ctx) => {
    const userId = ctx.from.id.toString();
    const pendingRequest = pendingApprovals.get(userId);
    
    if (!pendingRequest) {
      return ctx.reply('❌ لا يوجد أمر بانتظار الموافقة.');
    }
    
    await ctx.reply(`🚀 جاري تنفيذ الأمر: "${pendingRequest.command}"`);
    
    try {
      // تنفيذ الأمر المعلق
      const result = await executeCommand(pendingRequest.command);
      await ctx.reply(`✅ تم تنفيذ طلبك بنجاح!\n\n📋 نتيجة التنفيذ:\n\n${result.split('\n').slice(0, 15).join('\n')}\n...\n(تم اختصار التقرير)`);
      
      // إزالة الطلب من قائمة الانتظار
      pendingApprovals.delete(userId);
    } catch (error) {
      console.error('❌ خطأ في تنفيذ الأمر المعلق:', error);
      await ctx.reply(`❌ حدث خطأ أثناء تنفيذ الأمر: ${error.message}`);
    }
  });
  
  bot.command('reject', (ctx) => {
    const userId = ctx.from.id.toString();
    
    if (!pendingApprovals.has(userId)) {
      return ctx.reply('🚫 لا يوجد أمر بانتظار الموافقة.');
    }
    
    pendingApprovals.delete(userId);
    ctx.reply('⚠️ تم إلغاء تنفيذ الأمر. هل هناك شيء آخر تريد القيام به؟');
  });
  
  // معالجة الرسائل العادية
  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const userId = ctx.from.id.toString();
    
    if (text.startsWith('/')) {
      return; // تجاهل الأوامر غير المعروفة
    }
    
    // التحقق إذا كان الرد موافقة أو رفض
    if (['نعم', 'موافق', 'نفذ', 'أوافق', 'نوافق'].some(keyword => text.includes(keyword))) {
      // التحقق من وجود طلب ينتظر الموافقة
      const pendingRequest = pendingApprovals.get(userId);
      if (pendingRequest) {
        await ctx.reply(`🚀 جاري تنفيذ الأمر: "${pendingRequest.command}"`);
        
        try {
          // تنفيذ الأمر المعلق
          const result = await executeCommand(pendingRequest.command);
          await ctx.reply(`✅ تم تنفيذ الأمر بنجاح:\n\n${result.split('\n').slice(0, 15).join('\n')}\n...\n(تم اختصار التقرير)`);
          
          // إزالة الطلب من قائمة الانتظار
          pendingApprovals.delete(userId);
        } catch (error) {
          console.error('❌ خطأ في تنفيذ الأمر المعلق:', error);
          await ctx.reply(`❌ حدث خطأ أثناء تنفيذ الأمر: ${error.message}`);
        }
        return;
      }
    }
    
    // التحقق إذا كان الرد رفض
    if (['لا', 'رفض', 'إلغاء', 'لا أوافق'].some(keyword => text.includes(keyword))) {
      // التحقق من وجود طلب ينتظر الموافقة
      if (pendingApprovals.has(userId)) {
        await ctx.reply('⚠️ تم إلغاء تنفيذ الأمر. هل هناك شيء آخر تريد القيام به؟');
        pendingApprovals.delete(userId);
        return;
      }
    }

    try {
      // تنفيذ مباشر للأوامر البسيطة دون خطوات فحص وتحليل وانتظار موافقة
      if (text.length < 30 || 
          text.includes('مرحبا') || 
          text.includes('أهلا') || 
          text.includes('كيف') || 
          text.includes('?') || 
          text.includes('؟')) {
        
        // معالجة الرسائل البسيطة والاستفسارات بشكل مباشر
        if (text.includes('كيف حالك') || text.includes('كيفك')) {
          return ctx.reply('أنا بخير، شكراً على سؤالك! كيف يمكنني مساعدتك اليوم؟');
        }
        
        if (text.includes('مرحبا') || text.includes('أهلا') || text.includes('السلام عليكم')) {
          return ctx.reply(`مرحباً ${ctx.from.first_name}! كيف يمكنني مساعدتك اليوم؟`);
        }
        
        if (text.includes('شكرا') || text.includes('شكراً')) {
          return ctx.reply('العفو! أنا دائماً في خدمتك. هل هناك شيء آخر تحتاجه؟');
        }
        
        if (text.includes('ماذا يمكنك أن تفعل') || text.includes('ما هي قدراتك')) {
          return ctx.reply(`يمكنني مساعدتك في الكثير من المهام مثل:
          
✅ تحليل النظام وتشخيص المشاكل
✅ تطوير واجهات المستخدم وإضافة ميزات جديدة
✅ إصلاح الأخطاء البرمجية
✅ تقديم اقتراحات لتحسين النظام
✅ إنشاء تقارير عن حالة النظام والموارد

ما الذي تحتاج مساعدة به اليوم؟`);
        }
        
        // توليد إجابة سريعة للأسئلة العامة
        const response = await generateCodeWithOpenAI(`أجب بإيجاز وبشكل ودي وطبيعي على هذا السؤال باللغة العربية: ${text}`);
        return ctx.reply(response);
      }
      
      // للطلبات المعقدة، نستخدم نهج أكثر تفاعلية
      const processingMessage = await ctx.reply(`أنا أفكر في طلبك... 🤔`);
      
      // توليد رد فوري على الطلب الرئيسي
      const quickAnalysis = await generateCodeWithOpenAI(`
        قم بتحليل سريع لهذا الطلب: "${text}" 
        واكتب رداً قصيراً يوضح فهمك للطلب وكيف ستساعد.
        الرد يجب أن يكون ودوداً وتفاعلياً ومباشراً، بأسلوب محادثة طبيعي.
      `);
      
      // تحديث رسالة المعالجة بالتحليل السريع
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMessage.message_id,
        undefined,
        quickAnalysis
      );
      
      // تنفيذ الأمر مباشرة بدون تعقيد
      const commandResult = await executeCommand(text);
      
      // إرسال النتيجة في رسائل متعددة للتفاعل المستمر
      const resultLines = commandResult.split('\n');
      
      // تقسيم النتيجة إلى أجزاء لتحسين التفاعل
      if (resultLines.length > 15) {
        await ctx.reply(`هذا ما وجدته: 💡\n\n${resultLines.slice(0, 5).join('\n')}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // انتظار قليلاً للمحاكاة الطبيعية
        await ctx.reply(`وهذه بعض التفاصيل الإضافية:\n\n${resultLines.slice(5, 15).join('\n')}`);
        
        // إرسال خاتمة ودية وتسأل عن الخطوة التالية
        await new Promise(resolve => setTimeout(resolve, 1500));
        await ctx.reply(`هل كان هذا مفيداً؟ هل هناك شيء آخر تود مني معرفته أو تنفيذه؟`);
      } else {
        // إذا كانت النتيجة قصيرة، أرسلها كاملة
        await ctx.reply(commandResult);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ctx.reply(`هل هناك شيء آخر تحتاج مساعدة به؟`);
      }
    } catch (error) {
      console.error('❌ خطأ في معالجة الرسالة:', error);
      ctx.reply(`عفواً، واجهت مشكلة أثناء معالجة طلبك. هل يمكنك توضيح طلبك بطريقة أخرى؟`);
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
