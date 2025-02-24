import { ExpenseCategory, Expense } from "@shared/schema";

type StorageKey = 'expense-categories' | 'expenses';

export function getStorageData<T>(key: StorageKey): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return [];
  }
}

export function setStorageData<T>(key: StorageKey, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
  }
}

export function addItem<T extends { id?: number }>(key: StorageKey, item: Omit<T, 'id'>): T {
  const items = getStorageData<T>(key);
  const newItem = {
    ...item,
    id: items.length + 1
  } as T;

  items.push(newItem);
  setStorageData(key, items);
  return newItem;
}