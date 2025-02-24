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
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return [];
  }
}

export function setStorageData<T>(key: StorageKey, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage for key ${key}:`, error);
    throw new Error("فشل في حفظ البيانات");
  }
}

export function addItem<T extends { id?: number }>(key: StorageKey, item: Omit<T, 'id'>): T {
  try {
    const items = getStorageData<T>(key);
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id || 0)) + 1 : 1;

    const newItem = {
      ...item,
      id: newId
    } as T;

    items.push(newItem);
    setStorageData(key, items);
    return newItem;
  } catch (error) {
    console.error(`Error adding item to ${key}:`, error);
    throw new Error("فشل في إضافة العنصر");
  }
}