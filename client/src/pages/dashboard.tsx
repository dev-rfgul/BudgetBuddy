import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign } from "lucide-react";
import BudgetOverview from "@/components/budget-overview";
import CategoryTile from "@/components/category-tile";
import AddExpenseModal from "@/components/add-expense-modal";
import BottomNavigation from "@/components/bottom-navigation";
import ManageBudgetModal from "@/components/manage-budget-modal";
import TransactionsModal from "@/components/transactions-modal";
import { useCurrentBudget, useBudgetSummary } from "@/hooks/use-budget";
import { useCategoriesWithAllocations, useExpenses } from "@/hooks/use-expenses";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showManageBudget, setShowManageBudget] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  
  const { data: budget, isLoading: budgetLoading } = useCurrentBudget();
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budget?.id);
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesWithAllocations(budget?.id);
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(budget?.id);

  // If no budget exists, redirect to budget setup
  if (!budgetLoading && !budget) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Welcome to Expense Tracker</h1>
            <p className="text-muted-foreground mb-6">
              Let's set up your first budget to get started tracking your expenses.
            </p>
            <Link href="/budget-setup">
              <Button className="w-full" data-testid="button-setup-budget">
                Set Up Budget
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recentExpenses = expenses.slice(-3).reverse();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">ExpenseTracker</h1>
                <p className="text-xs text-muted-foreground" data-testid="current-month">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Budget Overview */}
      <BudgetOverview summary={summary} isLoading={summaryLoading} />

      {/* Quick Add Expense */}
      <section className="px-4 mb-6 mt-6">
        <Button 
          onClick={() => setShowAddExpense(true)}
          className="w-full py-4 px-6 font-medium flex items-center justify-center space-x-2"
          data-testid="button-quick-add"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </Button>
      </section>

      {/* Budget Categories */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Budget Categories</h2>
          <Button onClick={() => setShowManageBudget(true)} variant="ghost" size="sm" className="text-accent hover:text-white">
            Manage
          </Button>
        </div>
        
        {categoriesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No budget categories set up yet.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowManageBudget(true)}
                data-testid="button-setup-categories"
              >
                Set Up Categories
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" data-testid="categories-list">
            {categories.map((category) => (
              <CategoryTile key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Transactions */}
      <section className="p-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>

          <Button onClick={() => setShowTransactions(true)} variant="ghost" size="sm" className="text-accent hover:text-white">
            View All
          </Button>
        </div>
        
        {expensesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : recentExpenses.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No transactions yet.</p>
              <Button 
                onClick={() => setShowAddExpense(true)}
                variant="outline" 
                className="mt-4"
                data-testid="button-add-first-expense"
              >
                Add Your First Expense
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" data-testid="recent-transactions">
            {recentExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium" data-testid={`transaction-category-${expense.id}`}>
                          {categories.find((c) => c.id === expense.categoryId)?.name ?? 'Uncategorized'}
                        </p>
                        {expense.description ? (
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                        ) : null}
                        <p className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold" data-testid={`transaction-amount-${expense.id}`}>
                      -PKR {Number(expense.amount).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Analytics Preview */}
      <section className="p-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Spending Analytics</h2>
          <Link href="/analytics">
            <Button variant="ghost" size="sm" className="text-accent hover:text-white">
              View Details
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">View detailed spending analytics and insights</p>
            <Link href="/analytics">
              <Button variant="outline" data-testid="button-view-analytics">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Add Expense Modal */}
      {budget && (
        <AddExpenseModal 
          open={showAddExpense} 
          onOpenChange={setShowAddExpense}
          budgetId={budget.id}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        onAddExpenseClick={() => setShowAddExpense(true)}
        onManageBudgetClick={() => setShowManageBudget(true)}
        onTransactionsClick={() => setShowTransactions(true)}
      />

      {/* Manage Budget Modal */}
      {budget && (
        <ManageBudgetModal open={showManageBudget} onOpenChange={setShowManageBudget} budgetId={budget.id} />
      )}
      {budget && (
        <TransactionsModal open={showTransactions} onOpenChange={setShowTransactions} budgetId={budget.id} />
      )}
    </div>
  );
}
