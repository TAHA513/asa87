import { ExpenseCategory, Expense } from "@shared/schema";

type StorageKey = 'expense-categories' | 'expenses';

// التحقق من وجود التخزين المحلي عند بدء التطبيق
function initializeStorage(key: StorageKey) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify([]));
  }
}

// تهيئة التخزين المحلي
initializeStorage('expense-categories');
initializeStorage('expenses');

export function getStorageData<T>(key: StorageKey): T[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      setStorageData(key, []);
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`خطأ في قراءة البيانات من التخزين المحلي للمفتاح ${key}:`, error);
    return [];
  }
}

export function setStorageData<T>(key: StorageKey, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`خطأ في حفظ البيانات في التخزين المحلي للمفتاح ${key}:`, error);
    throw new Error("فشل في حفظ البيانات");
  }
}

export function addItem<T extends { id?: number }>(key: StorageKey, item: Omit<T, 'id'>): T {
  try {
    const items = getStorageData<T>(key);
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;

    // تحويل القيم الرقمية إلى نصوص
    const newItem = {
      ...item,
      id: newId,
      budgetAmount: typeof item['budgetAmount'] === 'number' ? item['budgetAmount'].toString() : undefined,
      amount: typeof item['amount'] === 'number' ? item['amount'].toString() : undefined,
    } as T;

    console.log(`بيانات العنصر الجديد قبل الحفظ:`, newItem);

    items.push(newItem);
    setStorageData(key, items);

    console.log(`تم إضافة عنصر جديد إلى ${key}:`, newItem);
    console.log(`البيانات الحالية في ${key}:`, items);

    return newItem;
  } catch (error) {
    console.error(`خطأ في إضافة عنصر إلى ${key}:`, error);
    throw new Error("فشل في إضافة العنصر");
  }
}