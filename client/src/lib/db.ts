import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Budget, Category, BudgetAllocation, Expense, RecurringExpense, SavingsGoal, AppSettings } from '@/types';

interface BudgetBuddyDB extends DBSchema {
  budgets: {
    key: string;
    value: Budget;
    indexes: { 'by-month': string };
  };
  categories: {
    key: string;
    value: Category;
  };
  allocations: {
    key: string;
    value: BudgetAllocation;
    indexes: { 'by-budget': string };
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-budget': string; 'by-category': string };
  };
  incomes: {
    key: string;
    value: { id: string; budgetId: string; amount: string; note?: string; date: string; createdAt: Date };
    indexes: { 'by-budget': string };
  };
  recurring_expenses: {
    key: string;
    value: RecurringExpense;
  };
  savings_goals: {
    key: string;
    value: SavingsGoal;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'budget-buddy-db';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBPDatabase<BudgetBuddyDB>> {
  return openDB<BudgetBuddyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Budgets store
      if (!db.objectStoreNames.contains('budgets')) {
        const store = db.createObjectStore('budgets', { keyPath: 'id' });
        store.createIndex('by-month', 'month');
      }

      // Categories store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }

      // Allocations store
      if (!db.objectStoreNames.contains('allocations')) {
        const store = db.createObjectStore('allocations', { keyPath: 'id' });
        store.createIndex('by-budget', 'budgetId');
      }

      // Expenses store
      if (!db.objectStoreNames.contains('expenses')) {
        const store = db.createObjectStore('expenses', { keyPath: 'id' });
        store.createIndex('by-budget', 'budgetId');
        store.createIndex('by-category', 'categoryId');
      }

      // Incomes store
      if (!db.objectStoreNames.contains('incomes')) {
        const store = db.createObjectStore('incomes', { keyPath: 'id' });
        store.createIndex('by-budget', 'budgetId');
      }

      // Recurring Expenses store
      if (!db.objectStoreNames.contains('recurring_expenses')) {
        db.createObjectStore('recurring_expenses', { keyPath: 'id' });
      }

      // Savings Goals store
      if (!db.objectStoreNames.contains('savings_goals')) {
        db.createObjectStore('savings_goals', { keyPath: 'id' });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
}
