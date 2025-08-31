import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useCurrentBudget } from "@/hooks/use-budget";
import { useCategoriesWithAllocations, useExpenses } from "@/hooks/use-expenses";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#2ECC71', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6'];

export default function Analytics() {
  const { data: budget } = useCurrentBudget();
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesWithAllocations(budget?.id);
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(budget?.id);

  // Generate weekly spending data
  const weeklyData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.toDateString() === date.toDateString();
    });
    const dailyTotal = dayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    weeklyData.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dailyTotal,
    });
  }

  // Generate category data for pie chart
  const categoryData = categories.map((category, index) => ({
    name: category.name,
    value: category.spent,
    color: COLORS[index % COLORS.length],
  })).filter(item => item.value > 0);

  // Calculate insights
  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const averageDaily = totalSpent / 30; // Rough monthly average
  const highestSpendingDay = weeklyData.reduce((max, day) => day.amount > max.amount ? day : max, weeklyData[0]);
  const overspentCategories = categories.filter(cat => cat.spent > cat.allocated);

  if (!budget) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No budget data available for analytics.</p>
            <Link href="/">
              <Button className="mt-4">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="font-semibold text-lg">Analytics</h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                Month
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Week
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6 pb-20">
        {/* Weekly Spending Chart */}
        <Card data-testid="weekly-chart">
          <CardHeader>
            <CardTitle>Weekly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(145 63% 49%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(145 63% 49%)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card data-testid="category-chart">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : categoryData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No spending data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spent']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Spending Insights */}
        <Card data-testid="insights">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Highest spending day</p>
                    <p className="text-xs text-muted-foreground">
                      {highestSpendingDay?.day} - ${highestSpendingDay?.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Average daily spending</p>
                    <p className="text-xs text-muted-foreground">
                      ${averageDaily.toFixed(2)} per day
                    </p>
                  </div>
                </div>
              </div>

              {overspentCategories.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Categories over budget</p>
                      <p className="text-xs text-muted-foreground">
                        {overspentCategories.length} category(ies) need attention
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card data-testid="budget-vs-actual">
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => {
                  const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
                  const isOverspent = category.spent > category.allocated;
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{category.name}</p>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${
                                isOverspent ? 'bg-destructive' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium">
                          ${category.spent.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          of ${category.allocated.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
