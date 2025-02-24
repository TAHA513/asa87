import { ExpenseCategory, Expense } from "@shared/schema";

type StorageKey = 'expense-categories' | 'expenses';

export function getStorageData<T>(key: StorageKey): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function setStorageData<T>(key: StorageKey, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
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