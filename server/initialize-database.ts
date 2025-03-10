
import { spawn } from 'child_process';

async function runScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`جاري تنفيذ: ${scriptPath}`);
    
    const process = spawn('npx', ['tsx', scriptPath], {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`تم تنفيذ ${scriptPath} بنجاح`);
        resolve();
      } else {
        console.error(`فشل في تنفيذ ${scriptPath} مع رمز الخروج: ${code}`);
        reject(new Error(`فشل تنفيذ ${scriptPath}`));
      }
    });
  });
}

async function initializeDatabase() {
  try {
    // إعادة تهيئة قاعدة البيانات (حذف وإنشاء الجداول)
    await runScript('./server/reset-database.ts');
    
    // إضافة البيانات الأولية
    await runScript('./server/seed-data.ts');
    
    console.log("تمت إعادة تهيئة وزراعة البيانات بنجاح!");
  } catch (error) {
    console.error("حدث خطأ أثناء تهيئة قاعدة البيانات:", error);
    process.exit(1);
  }
}

// تنفيذ وظيفة التهيئة
initializeDatabase();
