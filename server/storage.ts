import { type Budget, type InsertBudget, type Category, type InsertCategory, type BudgetAllocation, type InsertBudgetAllocation, type Expense, type InsertExpense, type CategoryWithAllocation, type BudgetSummary } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Budget operations
  getBudget(month: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Budget allocation operations
  getBudgetAllocations(budgetId: string): Promise<BudgetAllocation[]>;
  createBudgetAllocation(allocation: InsertBudgetAllocation): Promise<BudgetAllocation>;
  updateBudgetAllocation(id: string, allocation: Partial<InsertBudgetAllocation>): Promise<BudgetAllocation>;
  deleteBudgetAllocation(id: string): Promise<void>;

  // Expense operations
  getExpenses(budgetId: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;

  // Analytics operations
  getCategoriesWithAllocations(budgetId: string): Promise<CategoryWithAllocation[]>;
  getBudgetSummary(budgetId: string): Promise<BudgetSummary>;
}

export class MemStorage implements IStorage {
  private budgets: Map<string, Budget> = new Map();
  private categories: Map<string, Category> = new Map();
  private budgetAllocations: Map<string, BudgetAllocation> = new Map();
  private expenses: Map<string, Expense> = new Map();

  constructor() {
    this.seedDefaultCategories();
  }

  private seedDefaultCategories() {
    const defaultCategories = [
      { name: "Groceries", icon: "shopping-cart", color: "#2ECC71", isDefault: true },
      { name: "Transport", icon: "car", color: "#3498DB", isDefault: true },
      { name: "Bills", icon: "file-text", color: "#E74C3C", isDefault: true },
      { name: "Utilities", icon: "zap", color: "#F39C12", isDefault: true },
    ];

    defaultCategories.forEach(cat => {
      const id = randomUUID();
      const category: Category = {
        id,
        ...cat,
        isDefault: cat.isDefault ?? false,
        createdAt: new Date(),
      };
      this.categories.set(id, category);
    });
  }

  async getBudget(month: string): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(b => b.month === month);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = {
      ...insertBudget,
      id,
      createdAt: new Date(),
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updateData: Partial<InsertBudget>): Promise<Budget> {
    const existing = this.budgets.get(id);
    if (!existing) throw new Error("Budget not found");
    
    const updated: Budget = { ...existing, ...updateData };
    this.budgets.set(id, updated);
    return updated;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  async getBudgetAllocations(budgetId: string): Promise<BudgetAllocation[]> {
    return Array.from(this.budgetAllocations.values()).filter(a => a.budgetId === budgetId);
  }

  async createBudgetAllocation(insertAllocation: InsertBudgetAllocation): Promise<BudgetAllocation> {
    const id = randomUUID();
    const allocation: BudgetAllocation = {
      ...insertAllocation,
      id,
      createdAt: new Date(),
    };
    this.budgetAllocations.set(id, allocation);
    return allocation;
  }

  async updateBudgetAllocation(id: string, updateData: Partial<InsertBudgetAllocation>): Promise<BudgetAllocation> {
    const existing = this.budgetAllocations.get(id);
    if (!existing) throw new Error("Budget allocation not found");
    
    const updated: BudgetAllocation = { ...existing, ...updateData };
    this.budgetAllocations.set(id, updated);
    return updated;
  }

  async deleteBudgetAllocation(id: string): Promise<void> {
    this.budgetAllocations.delete(id);
  }

  async getExpenses(budgetId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(e => e.budgetId === budgetId);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    this.expenses.delete(id);
  }

  async getCategoriesWithAllocations(budgetId: string): Promise<CategoryWithAllocation[]> {
    const categories = await this.getCategories();
    const allocations = await this.getBudgetAllocations(budgetId);
    const expenses = await this.getExpenses(budgetId);

    return categories.map(category => {
      const allocation = allocations.find(a => a.categoryId === category.id);
      const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
      
      const allocated = allocation ? Number(allocation.allocatedAmount) : 0;
      const spent = categoryExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const remaining = allocated - spent;
      const transactionCount = categoryExpenses.length;

      return {
        ...category,
        allocated,
        spent,
        remaining,
        transactionCount,
      };
    }).filter(cat => cat.allocated > 0); // Only show categories with allocations
  }

  async getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
    const budget = this.budgets.get(budgetId);
    if (!budget) throw new Error("Budget not found");

    const allocations = await this.getBudgetAllocations(budgetId);
    const expenses = await this.getExpenses(budgetId);
    const categoriesWithAllocations = await this.getCategoriesWithAllocations(budgetId);

    const monthlyBudget = Number(budget.monthlyIncome);
    const totalAllocated = allocations.reduce((sum, a) => sum + Number(a.allocatedAmount), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const remainingBudget = monthlyBudget - totalAllocated;

    // Calculate days left in month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const daysLeft = lastDay - now.getDate();

    return {
      monthlyBudget,
      totalAllocated,
      totalSpent,
      remainingBudget,
      daysLeft: Math.max(0, daysLeft),
      categoryCount: categoriesWithAllocations.length,
    };
  }
}

export const storage = new MemStorage();
