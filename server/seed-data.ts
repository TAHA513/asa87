
import { db } from "./db";
import * as schema from "@shared/schema";
import bcrypt from "bcrypt";

async function seedDatabase() {
  console.log("بدء إضافة البيانات الاختبارية...");

  try {
    // 1. إضافة مستخدمين
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    const [adminUser] = await db.insert(schema.users).values({
      username: "admin",
      password: hashedPassword,
      fullName: "مدير النظام",
      role: "admin",
      email: "admin@example.com",
      phone: "07700000000",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log("✅ تم إنشاء المستخدم الأول:", adminUser.username);
    
    await db.insert(schema.users).values({
      username: "موظف1",
      password: hashedPassword,
      fullName: "موظف المبيعات",
      role: "staff",
      email: "staff@example.com",
      phone: "07700000001",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log("✅ تم إنشاء المستخدم الثاني");

    // 2. إضافة فئات المنتجات
    const categories = [
      { name: "إلكترونيات", description: "أجهزة إلكترونية متنوعة" },
      { name: "ملابس", description: "ملابس رجالية ونسائية" },
      { name: "أثاث", description: "أثاث منزلي ومكتبي" },
      { name: "مواد غذائية", description: "منتجات غذائية متنوعة" }
    ];
    
    for (const category of categories) {
      await db.insert(schema.productCategories).values({
        name: category.name,
        description: category.description,
        createdAt: new Date()
      });
    }
    
    console.log("✅ تم إنشاء فئات المنتجات");

    // الحصول على معرفات الفئات
    const categoryRecords = await db.select().from(schema.productCategories);
    const categoryMap = categoryRecords.reduce((map, cat) => {
      map[cat.name] = cat.id;
      return map;
    }, {} as Record<string, number>);

    // 3. إضافة منتجات
    const products = [
      {
        name: "تلفزيون ذكي 55 بوصة",
        description: "تلفزيون ذكي بشاشة 4K عالية الدقة",
        productCode: "TV-55-SMART",
        barcode: "12345678901",
        productType: "إلكترونيات",
        quantity: 25,
        minQuantity: 5,
        costPrice: "250000",
        priceIqd: "280000",
        categoryId: categoryMap["إلكترونيات"],
        stock: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "هاتف ذكي",
        description: "هاتف ذكي مع كاميرا عالية الدقة",
        productCode: "PHONE-PRO",
        barcode: "12345678902",
        productType: "إلكترونيات",
        quantity: 50,
        minQuantity: 10,
        costPrice: "150000",
        priceIqd: "170000",
        categoryId: categoryMap["إلكترونيات"],
        stock: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "قميص رجالي",
        description: "قميص رجالي قطني",
        productCode: "SHIRT-M",
        barcode: "12345678903",
        productType: "ملابس",
        quantity: 100,
        minQuantity: 20,
        costPrice: "15000",
        priceIqd: "20000",
        categoryId: categoryMap["ملابس"],
        stock: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "طاولة خشبية",
        description: "طاولة خشبية للمكتب",
        productCode: "TABLE-WOOD",
        barcode: "12345678904",
        productType: "أثاث",
        quantity: 15,
        minQuantity: 3,
        costPrice: "75000",
        priceIqd: "85000",
        categoryId: categoryMap["أثاث"],
        stock: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "أرز بسمتي",
        description: "أرز بسمتي فاخر - 5 كيلو",
        productCode: "RICE-PREMIUM",
        barcode: "12345678905",
        productType: "مواد غذائية",
        quantity: 200,
        minQuantity: 50,
        costPrice: "7500",
        priceIqd: "9000",
        categoryId: categoryMap["مواد غذائية"],
        isWeightBased: true,
        stock: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const product of products) {
      await db.insert(schema.products).values(product);
    }
    
    console.log("✅ تم إنشاء المنتجات");

    // 4. إضافة عملاء
    const customers = [
      {
        name: "محمد أحمد",
        phone: "07700001234",
        email: "mohammed@example.com",
        address: "بغداد - الكرادة",
        notes: "عميل مميز",
        createdAt: new Date()
      },
      {
        name: "فاطمة علي",
        phone: "07700005678",
        email: "fatima@example.com",
        address: "بغداد - المنصور",
        notes: "تفضل المنتجات الإلكترونية",
        createdAt: new Date()
      },
      {
        name: "أحمد محمود",
        phone: "07700009012",
        email: "ahmed@example.com",
        address: "البصرة - العشار",
        notes: "",
        createdAt: new Date()
      }
    ];

    for (const customer of customers) {
      await db.insert(schema.customers).values(customer);
    }
    
    console.log("✅ تم إنشاء العملاء");

    // الحصول على معرفات العملاء
    const customerRecords = await db.select().from(schema.customers);
    
    // 5. إضافة مبيعات
    const sales = [
      {
        productId: 1, // تلفزيون
        customerId: customerRecords[0].id, // محمد أحمد
        quantity: 1,
        priceIqd: "280000",
        discount: "10000",
        finalPriceIqd: "270000",
        date: new Date(),
        userId: adminUser.id,
        isInstallment: false
      },
      {
        productId: 2, // هاتف ذكي
        customerId: customerRecords[1].id, // فاطمة علي
        quantity: 1,
        priceIqd: "170000",
        discount: "5000",
        finalPriceIqd: "165000",
        date: new Date(),
        userId: adminUser.id,
        isInstallment: false
      },
      {
        productId: 3, // قميص
        customerId: customerRecords[2].id, // أحمد محمود
        quantity: 3,
        priceIqd: "60000", // 3 قمصان
        discount: "5000",
        finalPriceIqd: "55000",
        date: new Date(),
        userId: adminUser.id,
        isInstallment: false
      }
    ];

    for (const sale of sales) {
      await db.insert(schema.sales).values(sale);
    }
    
    console.log("✅ تم إنشاء المبيعات");

    // 6. إضافة فئات المصروفات
    const expenseCategories = [
      {
        name: "رواتب",
        description: "رواتب الموظفين",
        budgetAmount: "1000000",
        userId: adminUser.id,
        createdAt: new Date()
      },
      {
        name: "إيجار",
        description: "إيجار المتجر",
        budgetAmount: "500000",
        userId: adminUser.id,
        createdAt: new Date()
      },
      {
        name: "خدمات",
        description: "كهرباء، ماء، إنترنت",
        budgetAmount: "200000",
        userId: adminUser.id,
        createdAt: new Date()
      }
    ];

    for (const category of expenseCategories) {
      await db.insert(schema.expenseCategories).values(category);
    }
    
    console.log("✅ تم إنشاء فئات المصروفات");

    // الحصول على معرفات فئات المصروفات
    const expenseCategoryRecords = await db.select().from(schema.expenseCategories);

    // 7. إضافة مصروفات
    const expenses = [
      {
        amount: "1000000",
        description: "رواتب شهر فبراير 2025",
        date: new Date(),
        categoryId: expenseCategoryRecords[0].id,
        userId: adminUser.id,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: "500000",
        description: "إيجار شهر فبراير 2025",
        date: new Date(),
        categoryId: expenseCategoryRecords[1].id,
        userId: adminUser.id,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        amount: "150000",
        description: "فاتورة الكهرباء",
        date: new Date(),
        categoryId: expenseCategoryRecords[2].id,
        userId: adminUser.id,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const expense of expenses) {
      await db.insert(schema.expenses).values(expense);
    }
    
    console.log("✅ تم إنشاء المصروفات");

    // 8. إضافة موردين
    const suppliers = [
      {
        name: "شركة الإلكترونيات الحديثة",
        contactPerson: "علي حسين",
        phone: "07800001234",
        email: "ali@electronics.com",
        address: "بغداد - الكرادة",
        paymentTerms: "30 يوم",
        notes: "مورد أجهزة إلكترونية",
        status: "active",
        categories: ["إلكترونيات"],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: adminUser.id
      },
      {
        name: "مصنع الأقمشة الوطني",
        contactPerson: "سمير جاسم",
        phone: "07800005678",
        email: "samir@fabrics.com",
        address: "بغداد - الشعب",
        paymentTerms: "15 يوم",
        notes: "مورد أقمشة وملابس",
        status: "active",
        categories: ["ملابس"],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: adminUser.id
      }
    ];

    for (const supplier of suppliers) {
      await db.insert(schema.suppliers).values(supplier);
    }
    
    console.log("✅ تم إنشاء الموردين");

    // 9. إضافة مواعيد
    const appointments = [
      {
        customerId: customerRecords[0].id,
        title: "عرض منتجات جديدة",
        description: "عرض أحدث الأجهزة الإلكترونية للعميل",
        date: new Date(Date.now() + 86400000), // غدًا
        duration: 60, // 60 دقيقة
        status: "scheduled",
        notes: "تحضير كتالوج المنتجات الجديدة",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        customerId: customerRecords[1].id,
        title: "متابعة طلب سابق",
        description: "متابعة طلب شراء هاتف ذكي",
        date: new Date(Date.now() + 172800000), // بعد غد
        duration: 30, // 30 دقيقة
        status: "scheduled",
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const appointment of appointments) {
      await db.insert(schema.appointments).values(appointment);
    }
    
    console.log("✅ تم إنشاء المواعيد");

    // 10. إضافة معدل الصرف
    await db.insert(schema.exchangeRates).values({
      usdToIqd: "1460",
      date: new Date()
    });
    
    console.log("✅ تم إنشاء معدل الصرف");

    console.log("✅✅✅ تم إضافة جميع البيانات الاختبارية بنجاح!");
    console.log("يمكنك الآن تسجيل الدخول باستخدام:");
    console.log("اسم المستخدم: admin");
    console.log("كلمة المرور: 123456");

  } catch (error) {
    console.error("❌ حدث خطأ أثناء إضافة البيانات:", error);
  }
}

// تنفيذ الدالة
seedDatabase();
