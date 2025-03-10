import { connectionPool, db } from './connection-pool';
import { users, products, productCategories, customers } from '../shared/schema';
import bcrypt from 'bcryptjs';
import { storage } from "./storage";
import { users as usersSchema, products as productsSchema, customers as customersSchema, productCategories as productCategoriesSchema, suppliers as suppliersSchema, expenses as expensesSchema, expenseCategories as expenseCategoriesSchema } from "@shared/schema"; // Added import for the schema types


/**
 * وظيفة لإضافة بيانات أولية إلى قاعدة البيانات
 */
async function seedDatabase() {
  try {
    console.log('بدء إضافة البيانات الأولية...');

    // إضافة مستخدم افتراضي للنظام (admin)
    console.log('بدء إضافة بيانات المستخدم الافتراضي');

    // التحقق من وجود المستخدم
    const existingUsers = await db.select().from(users).where(
      sql`${users.username} = 'admin'`
    );

    if (existingUsers.length === 0) {
      // إنشاء كلمة مرور مشفرة
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // إضافة المستخدم الافتراضي
      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        fullName: 'مدير النظام',
        role: 'admin',
        email: 'admin@example.com',
        permissions: ['all'],
        isActive: true
      });

      console.log('تم إنشاء المستخدم الافتراضي بنجاح');
    } else {
      console.log('المستخدم الافتراضي موجود بالفعل، تخطي إنشاء حساب جديد');
    }

    // إضافة فئات المنتجات
    console.log('إضافة فئات المنتجات');

    const categories = [
      { name: 'إلكترونيات', description: 'أجهزة إلكترونية وكهربائية' },
      { name: 'ملابس', description: 'ملابس رجالية ونسائية وأطفال' },
      { name: 'أحذية', description: 'أحذية لجميع الأعمار' },
      { name: 'أثاث', description: 'أثاث منزلي ومكتبي' },
      { name: 'مواد غذائية', description: 'مواد غذائية متنوعة' }
    ];

    // إضافة الفئات إذا لم تكن موجودة
    const existingCategories = await db.select().from(productCategories);

    if (existingCategories.length === 0) {
      for (const category of categories) {
        await db.insert(productCategories).values(category);
      }
      console.log(`تم إضافة ${categories.length} فئات للمنتجات`);
    } else {
      console.log('فئات المنتجات موجودة بالفعل، تخطي إضافة الفئات');
    }

    // إضافة منتجات عينة
    console.log('إضافة منتجات عينة');

    const existingProducts = await db.select().from(products);

    if (existingProducts.length === 0) {
      // الحصول على معرفات الفئات من قاعدة البيانات
      const categoriesFromDB = await db.select().from(productCategories);
      const categoryMap = new Map();

      for (const cat of categoriesFromDB) {
        categoryMap.set(cat.name, cat.id);
      }

      // قائمة المنتجات العينة
      const sampleProducts = [
        {
          name: 'تلفاز سامسونج 55 بوصة',
          description: 'تلفاز ذكي LED بدقة 4K',
          productCode: 'TV-SAM-55',
          barcode: '8801234567890',
          productType: 'إلكترونيات',
          quantity: 10,
          minQuantity: 2,
          costPrice: 450,
          priceIqd: 550000,
          categoryId: categoryMap.get('إلكترونيات'),
          isWeightBased: false,
          imageUrl: null,
          thumbnailUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'قميص رجالي',
          description: 'قميص رجالي قطن 100%',
          productCode: 'SH-MEN-L',
          barcode: '5901234567890',
          productType: 'ملابس',
          quantity: 50,
          minQuantity: 10,
          costPrice: 15,
          priceIqd: 25000,
          categoryId: categoryMap.get('ملابس'),
          isWeightBased: false,
          imageUrl: null,
          thumbnailUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'حذاء رياضي',
          description: 'حذاء رياضي للرجال',
          productCode: 'SH-SPT-42',
          barcode: '4801234567890',
          productType: 'أحذية',
          quantity: 30,
          minQuantity: 5,
          costPrice: 25,
          priceIqd: 45000,
          categoryId: categoryMap.get('أحذية'),
          isWeightBased: false,
          imageUrl: null,
          thumbnailUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const product of sampleProducts) {
        await db.insert(products).values(product);
      }

      console.log(`تم إضافة ${sampleProducts.length} منتجات عينة`);
    } else {
      console.log('المنتجات موجودة بالفعل، تخطي إضافة منتجات عينة');
    }

    // إضافة عملاء عينة
    console.log('إضافة عملاء عينة');

    const existingCustomers = await db.select().from(customers);

    if (existingCustomers.length === 0) {
      const sampleCustomers = [
        {
          name: 'علي محمد',
          phone: '07701234567',
          email: 'ali@example.com',
          address: 'بغداد - الكرادة',
          notes: 'عميل دائم',
          createdAt: new Date()
        },
        {
          name: 'سارة أحمد',
          phone: '07711234567',
          email: 'sara@example.com',
          address: 'بغداد - المنصور',
          notes: 'تفضل الدفع نقدًا',
          createdAt: new Date()
        },
        {
          name: 'محمد جاسم',
          phone: '07721234567',
          email: 'mohammad@example.com',
          address: 'أربيل - عنكاوا',
          notes: '',
          createdAt: new Date()
        }
      ];

      for (const customer of sampleCustomers) {
        await db.insert(customers).values(customer);
      }

      console.log(`تم إضافة ${sampleCustomers.length} عملاء عينة`);
    } else {
      console.log('العملاء موجودون بالفعل، تخطي إضافة عملاء عينة');
    }

    console.log('اكتملت عملية بذر البيانات بنجاح');

  } catch (error) {
    console.error('حدث خطأ أثناء بذر البيانات:', error);
    throw error;
  } finally {
    // لا تغلق الاتصال هنا للسماح بالاستخدام في ملفات أخرى
  }
}

// تصدير الوظيفة لاستخدامها من ملفات أخرى
export { seedDatabase };

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function seedData() {
  try {
    console.log("بدء إضافة بيانات المستخدم الافتراضي");

    // التحقق ما إذا كان المستخدم موجود بالفعل
    const existingUser = await storage.getUserByUsername("admin");

    if (!existingUser) {
      // إنشاء مستخدم افتراضي إذا لم يكن موجوداً
      const hashedPassword = await hashPassword("123456");
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        fullName: "مدير النظام",
        email: "admin@example.com",
        phone: "07700000000",
        role: "admin",
        permissions: ["all"]
      });
      console.log("تم إنشاء حساب المستخدم الافتراضي بنجاح");
    } else {
      console.log("المستخدم الافتراضي موجود بالفعل، تخطي إنشاء حساب جديد");
    }

    console.log("اكتملت عملية بذر البيانات بنجاح");
  } catch (error) {
    console.error("حدث خطأ أثناء إضافة بيانات المستخدم:", error);
  }
}


// تنفيذ الوظيفة مباشرة عند تشغيل السكريبت
if (require.main === module) {
  Promise.all([seedDatabase(), seedData()])
    .then(() => {
      console.log("تمت زراعة البيانات بنجاح!");
      process.exit(0);
    })
    .catch(error => {
      console.error("حدث خطأ أثناء زراعة البيانات:", error);
      process.exit(1);
    });
}