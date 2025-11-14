import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { localStorageService } from "@/lib/localStorage";
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";
import { type Expense, type Category } from "@/types";
import ResetTransactionsModal from "@/components/reset-transactions-modal";
import { ArrowLeft, Filter, X, ShoppingCart, Car, FileText, Zap, Smile, Trash2, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const iconMap = {
  "shopping-cart": ShoppingCart,
  "car": Car,
  "file-text": FileText,
  "zap": Zap,
  "smile": Smile,
};

export default function Transactions() {
  const [, navigate] = useLocation();
  const budgetId = new URLSearchParams(window.location.search).get('budgetId');
  const initialCategoryId = new URLSearchParams(window.location.search).get('categoryId');
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [chartPeriod, setChartPeriod] = useState<'7days' | '14days' | '30days'>('7days');

  const { data: expenses = [], isLoading } = useExpenses(budgetId || undefined);
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => await localStorageService.getCategories(),
  });

  const deleteMutation = useDeleteExpense();

  const currentMonthExpenses = useMemo(() => {
    if (!expenses) return [] as Expense[];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [expenses]);

  const findCategory = (id?: string) => categories.find((c) => c.id === id);
  const findCategoryName = (id?: string) => findCategory(id)?.name ?? "Uncategorized";

  // Filter by category
  const filteredExpenses = useMemo(() => {
    if (!selectedCategoryId) return currentMonthExpenses;
    return currentMonthExpenses.filter((e) => e.categoryId === selectedCategoryId);
  }, [currentMonthExpenses, selectedCategoryId]);

  // Sort expenses
  const sortedExpenses = useMemo(() => {
    const sorted = [...filteredExpenses];
    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'amount-desc':
        return sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
      case 'amount-asc':
        return sorted.sort((a, b) => Number(a.amount) - Number(b.amount));
      default:
        return sorted;
    }
  }, [filteredExpenses, sortBy]);

  // Calculate stats
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const transactionCount = filteredExpenses.length;

  // Group expenses by category for quick filter
  const categoryStats = useMemo(() => {
    const stats = new Map<string, { count: number; total: number; category: Category }>();
    currentMonthExpenses.forEach((expense) => {
      const catId = expense.categoryId || 'uncategorized';
      const existing = stats.get(catId) || { count: 0, total: 0, category: findCategory(expense.categoryId)! };
      stats.set(catId, {
        count: existing.count + 1,
        total: existing.total + Number(expense.amount),
        category: existing.category,
      });
    });
    return Array.from(stats.entries()).map(([id, data]) => ({ categoryId: id, ...data }));
  }, [currentMonthExpenses, categories]);

  // Calculate chart data - spending trends by category over time
  const chartData = useMemo(() => {
    const days = chartPeriod === '7days' ? 7 : chartPeriod === '14days' ? 14 : 30;
    const today = startOfDay(new Date());
    const data: any[] = [];

    // Create data points for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayData: any = {
        date: format(date, 'MMM d'),
        fullDate: date,
      };

      // Calculate spending for each category on this day
      categories.forEach((category) => {
        const categoryExpenses = currentMonthExpenses.filter((exp) => {
          const expDate = new Date(exp.date);
          return exp.categoryId === category.id && expDate >= dayStart && expDate <= dayEnd;
        });
        
        const total = categoryExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        dayData[category.id] = total;
        dayData[`${category.id}_name`] = category.name;
        dayData[`${category.id}_color`] = category.color;
      });

      data.push(dayData);
    }

    return data;
  }, [currentMonthExpenses, categories, chartPeriod]);

  const handleDelete = async (expenseId: string) => {
    if (!budgetId) return;
    await deleteMutation.mutateAsync({ expenseId, budgetId });
  };

  if (!budgetId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No budget ID provided</p>
            <Button onClick={() => navigate("/")} className="mt-4">Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")} data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-xl">Transactions</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            {transactionCount > 0 && !selectedCategoryId && (
              <ResetTransactionsModal 
                budgetId={budgetId} 
                transactionCount={transactionCount}
              />
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-primary">{transactionCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-destructive">PKR {totalAmount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Trends Chart */}
        {currentMonthExpenses.length > 0 && categories.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Spending Trends by Category</CardTitle>
                </div>
                <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as typeof chartPeriod)} className="w-auto">
                  <TabsList className="h-8 p-1 bg-muted/50">
                    <TabsTrigger value="7days" className="text-xs px-2.5 py-1">7 Days</TabsTrigger>
                    <TabsTrigger value="14days" className="text-xs px-2.5 py-1">14 Days</TabsTrigger>
                    <TabsTrigger value="30days" className="text-xs px-2.5 py-1">30 Days</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    interval={chartPeriod === '30days' ? 4 : chartPeriod === '14days' ? 1 : 0}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value === 0 ? '0' : `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number, name: string) => {
                      const category = categories.find(c => c.id === name);
                      return [`PKR ${value.toLocaleString()}`, category?.name || name];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload;
                        return format(data.fullDate, "EEEE, MMM d, yyyy");
                      }
                      return label;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(value) => {
                      const category = categories.find(c => c.id === value);
                      return category?.name || value;
                    }}
                  />
                  {categories.map((category) => (
                    <Line
                      key={category.id}
                      type="monotone"
                      dataKey={category.id}
                      stroke={category.color}
                      strokeWidth={2}
                      dot={{ fill: category.color, strokeWidth: 2, r: 3, stroke: '#ffffff' }}
                      activeDot={{ r: 5, fill: category.color, stroke: '#ffffff', strokeWidth: 2 }}
                      name={category.name}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Daily spending comparison across all categories
              </p>
            </CardContent>
          </Card>
        )}

        {/* Category Filter Chips */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Filter by Category</h3>
              </div>
              {selectedCategoryId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategoryId(null)}
                  className="h-auto py-1 px-2"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!selectedCategoryId ? "default" : "outline"}
                className="cursor-pointer px-3 py-2 text-sm"
                onClick={() => setSelectedCategoryId(null)}
              >
                All ({currentMonthExpenses.length})
              </Badge>
              {categoryStats.map(({ categoryId, count, total, category }) => {
                const IconComponent = category ? iconMap[category.icon as keyof typeof iconMap] || Smile : Smile;
                const isSelected = selectedCategoryId === categoryId;
                
                return (
                  <Badge
                    key={categoryId}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer px-3 py-2 text-sm flex items-center space-x-1"
                    onClick={() => setSelectedCategoryId(categoryId === selectedCategoryId ? null : categoryId)}
                    style={isSelected && category ? { backgroundColor: category.color, borderColor: category.color } : {}}
                  >
                    {category && <IconComponent className="w-3 h-3" />}
                    <span>{category?.name || 'Uncategorized'}</span>
                    <span className="ml-1 opacity-70">({count})</span>
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedCategoryId ? (
              <>Showing {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} for <span className="font-medium text-foreground">{findCategoryName(selectedCategoryId)}</span></>
            ) : (
              <>Showing all {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}</>
            )}
          </div>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">Loading transactions…</div>
            </CardContent>
          </Card>
        ) : sortedExpenses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {selectedCategoryId 
                    ? `No transactions found for ${findCategoryName(selectedCategoryId)}`
                    : 'No transactions for this month.'
                  }
                </p>
                {selectedCategoryId && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSelectedCategoryId(null)}
                  >
                    View All Transactions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedExpenses.map((tx, index) => {
              const category = findCategory(tx.categoryId);
              const IconComponent = category ? iconMap[category.icon as keyof typeof iconMap] || Smile : Smile;
              
              return (
                <Card key={tx.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side - Icon and Details */}
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: category ? `${category.color}20` : '#e5e7eb' }}
                        >
                          {category ? (
                            <IconComponent className="w-5 h-5" style={{ color: category.color }} />
                          ) : (
                            <DollarSign className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-sm">{findCategoryName(tx.categoryId)}</h3>
                            {category && (
                              <Badge 
                                variant="outline" 
                                className="text-xs px-1.5 py-0"
                                style={{ borderColor: category.color, color: category.color }}
                              >
                                {category.name}
                              </Badge>
                            )}
                          </div>
                          
                          {tx.description && (
                            <p className="text-sm text-muted-foreground mb-1 break-words">
                              {tx.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(tx.date).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Amount and Actions */}
                      <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                        <div className="font-bold text-base text-destructive">
                          -PKR {Number(tx.amount).toLocaleString()}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(tx.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
