import { type Budget, type Category, type BudgetAllocation, type Expense, type CategoryWithAllocation, type BudgetSummary } from "@shared/schema";

class LocalStorageService {
  private readonly BUDGETS_KEY = 'budgettracker_budgets';
  private readonly CATEGORIES_KEY = 'budgettracker_categories';
  private readonly ALLOCATIONS_KEY = 'budgettracker_allocations';
  private readonly INCOMES_KEY = 'budgettracker_incomes';
  private readonly EXPENSES_KEY = 'budgettracker_expenses';

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize categories if they don't exist
    if (!localStorage.getItem(this.CATEGORIES_KEY)) {
      const defaultCategories: Category[] = [
        {
          id: crypto.randomUUID(),
          name: "Groceries",
          icon: "shopping-cart",
          color: "#2ECC71",
          isDefault: true,
          createdAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          name: "Transport",
          icon: "car",
          color: "#3498DB",
          isDefault: true,
          createdAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          name: "Bills",
          icon: "file-text",
          color: "#E74C3C",
          isDefault: true,
          createdAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          name: "Utilities",
          icon: "zap",
          color: "#F39C12",
          isDefault: true,
          createdAt: new Date(),
        },
      ];
      this.setItem(this.CATEGORIES_KEY, defaultCategories);
    }

    // Initialize other data structures if they don't exist
    if (!localStorage.getItem(this.BUDGETS_KEY)) {
      this.setItem(this.BUDGETS_KEY, []);
    }
    if (!localStorage.getItem(this.ALLOCATIONS_KEY)) {
      this.setItem(this.ALLOCATIONS_KEY, []);
    }
    if (!localStorage.getItem(this.EXPENSES_KEY)) {
      this.setItem(this.EXPENSES_KEY, []);
    }
    if (!localStorage.getItem(this.INCOMES_KEY)) {
      this.setItem(this.INCOMES_KEY, []);
    }
  }

  private getItem<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return [];
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  // Budget operations
  async getBudget(month: string): Promise<Budget | undefined> {
    const budgets = this.getItem<Budget>(this.BUDGETS_KEY);
    return budgets.find(b => b.month === month);
  }

  async createBudget(budgetData: { monthlyIncome: string; month: string }): Promise<Budget> {
    const budgets = this.getItem<Budget>(this.BUDGETS_KEY);
    const newBudget: Budget = {
      id: crypto.randomUUID(),
      monthlyIncome: budgetData.monthlyIncome,
      month: budgetData.month,
      createdAt: new Date(),
    };
    
    // Remove any existing budget for the same month
    const filteredBudgets = budgets.filter(b => b.month !== budgetData.month);
    filteredBudgets.push(newBudget);
    
    this.setItem(this.BUDGETS_KEY, filteredBudgets);
    return newBudget;
  }

  async updateBudget(id: string, updateData: Partial<{ monthlyIncome: string; month: string }>): Promise<Budget> {
    const budgets = this.getItem<Budget>(this.BUDGETS_KEY);
    const index = budgets.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error("Budget not found");
    }
    
    budgets[index] = { ...budgets[index], ...updateData };
    this.setItem(this.BUDGETS_KEY, budgets);
    return budgets[index];
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return this.getItem<Category>(this.CATEGORIES_KEY);
  }

  async createCategory(categoryData: { name: string; icon: string; color: string; isDefault?: boolean }): Promise<Category> {
    const categories = this.getItem<Category>(this.CATEGORIES_KEY);
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: categoryData.name,
      icon: categoryData.icon,
      color: categoryData.color,
      isDefault: categoryData.isDefault ?? false,
      createdAt: new Date(),
    };
    
    categories.push(newCategory);
    this.setItem(this.CATEGORIES_KEY, categories);
    return newCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const categories = this.getItem<Category>(this.CATEGORIES_KEY);
    const filteredCategories = categories.filter(c => c.id !== id);
    this.setItem(this.CATEGORIES_KEY, filteredCategories);
  }

  // Budget allocation operations
  async getBudgetAllocations(budgetId: string): Promise<BudgetAllocation[]> {
    const allocations = this.getItem<BudgetAllocation>(this.ALLOCATIONS_KEY);
    return allocations.filter(a => a.budgetId === budgetId);
  }

  async createBudgetAllocation(allocationData: { budgetId: string; categoryId: string; allocatedAmount: string }): Promise<BudgetAllocation> {
    const allocations = this.getItem<BudgetAllocation>(this.ALLOCATIONS_KEY);
    const newAllocation: BudgetAllocation = {
      id: crypto.randomUUID(),
      budgetId: allocationData.budgetId,
      categoryId: allocationData.categoryId,
      allocatedAmount: allocationData.allocatedAmount,
      createdAt: new Date(),
    };
    
    allocations.push(newAllocation);
    this.setItem(this.ALLOCATIONS_KEY, allocations);
    return newAllocation;
  }

  async updateBudgetAllocation(id: string, updateData: Partial<{ allocatedAmount: string }>): Promise<BudgetAllocation> {
    const allocations = this.getItem<BudgetAllocation>(this.ALLOCATIONS_KEY);
    const index = allocations.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error("Budget allocation not found");
    }
    
    allocations[index] = { ...allocations[index], ...updateData };
    this.setItem(this.ALLOCATIONS_KEY, allocations);
    return allocations[index];
  }

  async deleteBudgetAllocation(id: string): Promise<void> {
    const allocations = this.getItem<BudgetAllocation>(this.ALLOCATIONS_KEY);
    const filteredAllocations = allocations.filter(a => a.id !== id);
    this.setItem(this.ALLOCATIONS_KEY, filteredAllocations);
  }

  // Expense operations
  async getExpenses(budgetId: string): Promise<Expense[]> {
    const expenses = this.getItem<Expense>(this.EXPENSES_KEY);
    return expenses.filter(e => e.budgetId === budgetId);
  }

  async createExpense(expenseData: { amount: string; description: string; categoryId: string; budgetId: string; date: string }): Promise<Expense> {
    const expenses = this.getItem<Expense>(this.EXPENSES_KEY);
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: expenseData.amount,
      description: expenseData.description || "",
      categoryId: expenseData.categoryId,
      budgetId: expenseData.budgetId,
      date: new Date(expenseData.date),
      createdAt: new Date(),
    };
    
    expenses.push(newExpense);
    this.setItem(this.EXPENSES_KEY, expenses);
    return newExpense;
  }

  // Income log operations
  async getIncomeRecords(budgetId?: string): Promise<Array<{ id: string; budgetId: string; amount: string; note?: string; date: string; createdAt: Date }>> {
    const incomes = this.getItem<any>(this.INCOMES_KEY);
    return budgetId ? incomes.filter((i: any) => i.budgetId === budgetId) : incomes;
  }

  async createIncomeRecord(record: { budgetId: string; amount: string; note?: string; date?: string }): Promise<any> {
    const incomes = this.getItem<any>(this.INCOMES_KEY);
    const newRecord = {
      id: crypto.randomUUID(),
      budgetId: record.budgetId,
      amount: record.amount,
      note: record.note || "",
      date: record.date ? record.date : new Date().toISOString(),
      createdAt: new Date(),
    };
    incomes.push(newRecord);
    this.setItem(this.INCOMES_KEY, incomes);
    return newRecord;
  }

  // Get all budgets
  async getBudgets(): Promise<Budget[]> {
    return this.getItem<Budget>(this.BUDGETS_KEY);
  }

  // Copy allocations from one budget to another (used for month rollover)
  async copyAllocations(fromBudgetId: string, toBudgetId: string): Promise<void> {
    const allocations = this.getItem<BudgetAllocation>(this.ALLOCATIONS_KEY);
    const from = allocations.filter(a => a.budgetId === fromBudgetId);
    const copies = from.map(a => ({
      id: crypto.randomUUID(),
      budgetId: toBudgetId,
      categoryId: a.categoryId,
      allocatedAmount: a.allocatedAmount,
      createdAt: new Date(),
    }));
    const merged = [...allocations, ...copies];
    this.setItem(this.ALLOCATIONS_KEY, merged);
  }

  async deleteExpense(id: string): Promise<void> {
    const expenses = this.getItem<Expense>(this.EXPENSES_KEY);
    const filteredExpenses = expenses.filter(e => e.id !== id);
    this.setItem(this.EXPENSES_KEY, filteredExpenses);
  }

  async resetBudgetExpenses(budgetId: string): Promise<void> {
    const expenses = this.getItem<Expense>(this.EXPENSES_KEY);
    const filteredExpenses = expenses.filter(e => e.budgetId !== budgetId);
    this.setItem(this.EXPENSES_KEY, filteredExpenses);
  }

  // Analytics operations
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
    }).filter(cat => cat.allocated > 0);
  }

  async getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
    const budgets = this.getItem<Budget>(this.BUDGETS_KEY);
    const budget = budgets.find(b => b.id === budgetId);
    
    if (!budget) {
      throw new Error("Budget not found");
    }

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

export const localStorageService = new LocalStorageService();