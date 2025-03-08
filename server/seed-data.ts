import { db } from "./db";
import { users, products, customers, productCategories, suppliers, expenses, expenseCategories } from "@shared/schema";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function seedDatabase() {
  console.log("بدء زراعة البيانات الاختبارية في قاعدة البيانات...");

  // إضافة فئات المنتجات
  const categories = await db.insert(productCategories).values([
    { name: "إلكترونيات", description: "منتجات إلكترونية متنوعة", createdAt: new Date() },
    { name: "ملابس", description: "ملابس رجالية ونسائية", createdAt: new Date() },
    { name: "أجهزة منزلية", description: "أجهزة للمنزل", createdAt: new Date() },
    { name: "أثاث", description: "أثاث منزلي ومكتبي", createdAt: new Date() },
    { name: "مستلزمات أطفال", description: "منتجات خاصة بالأطفال", createdAt: new Date() }
  ]).returning();

  console.log(`تم إضافة ${categories.length} فئة للمنتجات`);

  // إضافة منتجات
  const productsList = await db.insert(products).values([
    {
      name: "هاتف ذكي سامسونج A52",
      description: "هاتف ذكي بشاشة 6.5 بوصة وكاميرا 64 ميجابكسل",
      productCode: "PHONE-001",
      barcode: "1234567890123",
      productType: "إلكترونيات",
      quantity: 50,
      minQuantity: 10,
      productionDate: new Date("2023-01-01"),
      expiryDate: null,
      costPrice: 200,
      priceIqd: 300000,
      categoryId: categories[0].id,
      isWeightBased: false,
      enableDirectWeighing: false,
      stock: 50,
      imageUrl: null,
      thumbnailUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "لابتوب HP Pavilion",
      description: "لابتوب للاستخدام المكتبي والألعاب بمعالج i5",
      productCode: "LAPTOP-001",
      barcode: "9876543210123",
      productType: "إلكترونيات",
      quantity: 20,
      minQuantity: 5,
      productionDate: new Date("2023-02-15"),
      expiryDate: null,
      costPrice: 450,
      priceIqd: 700000,
      categoryId: categories[0].id,
      isWeightBased: false,
      enableDirectWeighing: false,
      stock: 20,
      imageUrl: null,
      thumbnailUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "قميص رجالي",
      description: "قميص رجالي بأكمام طويلة قطن 100%",
      productCode: "SHIRT-001",
      barcode: "1122334455667",
      productType: "ملابس",
      quantity: 100,
      minQuantity: 20,
      productionDate: null,
      expiryDate: null,
      costPrice: 15,
      priceIqd: 25000,
      categoryId: categories[1].id,
      isWeightBased: false,
      enableDirectWeighing: false,
      stock: 100,
      imageUrl: null,
      thumbnailUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "فستان نسائي",
      description: "فستان نسائي مقاس متوسط",
      productCode: "DRESS-001",
      barcode: "7788990011223",
      productType: "ملابس",
      quantity: 30,
      minQuantity: 10,
      productionDate: null,
      expiryDate: null,
      costPrice: 25,
      priceIqd: 45000,
      categoryId: categories[1].id,
      isWeightBased: false,
      enableDirectWeighing: false,
      stock: 30,
      imageUrl: null,
      thumbnailUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "ثلاجة سامسونج",
      description: "ثلاجة منزلية سعة 500 لتر",
      productCode: "FRIDGE-001",
      barcode: "3344556677889",
      productType: "أجهزة منزلية",
      quantity: 15,
      minQuantity: 3,
      productionDate: new Date("2023-03-10"),
      expiryDate: null,
      costPrice: 300,
      priceIqd: 500000,
      categoryId: categories[2].id,
      isWeightBased: false,
      enableDirectWeighing: false,
      stock: 15,
      imageUrl: null,
      thumbnailUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]).returning();

  console.log(`تم إضافة ${productsList.length} منتج`);

  // إضافة عملاء
  const customersList = await db.insert(customers).values([
    {
      name: "أحمد محمد",
      phone: "07701234567",
      email: "ahmed@example.com",
      address: "بغداد - الكرادة",
      notes: "عميل منتظم",
      createdAt: new Date()
    },
    {
      name: "زينب علي",
      phone: "07709876543",
      email: "zainab@example.com",
      address: "بغداد - المنصور",
      notes: "",
      createdAt: new Date()
    },
    {
      name: "محمد عبد الله",
      phone: "07712345678",
      email: null,
      address: "بصرة - العشار",
      notes: "يفضل التواصل عبر الهاتف",
      createdAt: new Date()
    },
    {
      name: "فاطمة حسين",
      phone: "07798765432",
      email: "fatima@example.com",
      address: "أربيل - عنكاوا",
      notes: "",
      createdAt: new Date()
    },
    {
      name: "علي حسن",
      phone: "07756781234",
      email: "ali@example.com",
      address: "النجف",
      notes: "عميل VIP",
      createdAt: new Date()
    }
  ]).returning();

  console.log(`تم إضافة ${customersList.length} عميل`);

  // إضافة موردين
  const suppliersList = await db.insert(suppliers).values([
    {
      name: "شركة الرافدين للإلكترونيات",
      contactPerson: "سعد العامري",
      phone: "07801234567",
      email: "rafidain@example.com",
      address: "بغداد - الكرادة",
      taxNumber: "12345",
      paymentTerms: "30 يوم",
      notes: "مورد إلكترونيات رئيسي",
      status: "active",
      categories: ["إلكترونيات", "أجهزة منزلية"],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1
    },
    {
      name: "شركة الأناقة للملابس",
      contactPerson: "ليلى محمد",
      phone: "07809876543",
      email: "anaqa@example.com",
      address: "بغداد - المنصور",
      taxNumber: "54321",
      paymentTerms: "15 يوم",
      notes: "مورد ملابس",
      status: "active",
      categories: ["ملابس"],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1
    },
    {
      name: "مؤسسة الخليج للأثاث",
      contactPerson: "عمر فاروق",
      phone: "07712345678",
      email: "khaleej@example.com",
      address: "البصرة",
      taxNumber: "67890",
      paymentTerms: "cash",
      notes: "",
      status: "active",
      categories: ["أثاث"],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1
    }
  ]).returning();

  console.log(`تم إضافة ${suppliersList.length} مورد`);

  // إضافة فئات مصروفات
  const expenseCategoriesList = await db.insert(expenseCategories).values([
    {
      name: "إيجار",
      description: "إيجار المحل والمخزن",
      parentId: null,
      budgetAmount: 1000000,
      createdAt: new Date(),
      userId: 1
    },
    {
      name: "رواتب",
      description: "رواتب الموظفين",
      parentId: null,
      budgetAmount: 3000000,
      createdAt: new Date(),
      userId: 1
    },
    {
      name: "كهرباء",
      description: "فواتير الكهرباء",
      parentId: null,
      budgetAmount: 500000,
      createdAt: new Date(),
      userId: 1
    },
    {
      name: "ماء",
      description: "فواتير الماء",
      parentId: null,
      budgetAmount: 200000,
      createdAt: new Date(),
      userId: 1
    },
    {
      name: "صيانة",
      description: "صيانة المحل والأجهزة",
      parentId: null,
      budgetAmount: 400000,
      createdAt: new Date(),
      userId: 1
    }
  ]).returning();

  console.log(`تم إضافة ${expenseCategoriesList.length} فئة مصروفات`);

  // إضافة مصروفات
  const expensesList = await db.insert(expenses).values([
    {
      amount: 1000000,
      description: "إيجار المحل لشهر نيسان",
      date: new Date("2023-04-01"),
      categoryId: expenseCategoriesList[0].id,
      userId: 1,
      isRecurring: true,
      recurringPeriod: "monthly",
      recurringDay: 1,
      notes: "",
      attachments: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      amount: 2500000,
      description: "رواتب الموظفين لشهر نيسان",
      date: new Date("2023-04-05"),
      categoryId: expenseCategoriesList[1].id,
      userId: 1,
      isRecurring: true,
      recurringPeriod: "monthly",
      recurringDay: 5,
      notes: "",
      attachments: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      amount: 450000,
      description: "فاتورة الكهرباء لشهر آذار",
      date: new Date("2023-04-10"),
      categoryId: expenseCategoriesList[2].id,
      userId: 1,
      isRecurring: true,
      recurringPeriod: "monthly",
      recurringDay: 10,
      notes: "",
      attachments: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      amount: 180000,
      description: "فاتورة الماء لشهر آذار",
      date: new Date("2023-04-10"),
      categoryId: expenseCategoriesList[3].id,
      userId: 1,
      isRecurring: true,
      recurringPeriod: "monthly",
      recurringDay: 10,
      notes: "",
      attachments: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      amount: 350000,
      description: "صيانة مكيف الهواء",
      date: new Date("2023-04-15"),
      categoryId: expenseCategoriesList[4].id,
      userId: 1,
      isRecurring: false,
      recurringPeriod: null,
      recurringDay: null,
      notes: "صيانة طارئة",
      attachments: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]).returning();

  console.log(`تم إضافة ${expensesList.length} مصروف`);

  console.log("تم الانتهاء من زراعة البيانات الاختبارية بنجاح!");
  return {
    categories,
    products: productsList,
    customers: customersList,
    suppliers: suppliersList,
    expenseCategories: expenseCategoriesList,
    expenses: expensesList
  };
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

// تشغيل الوظيفة إذا تم استدعاء الملف مباشرة
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