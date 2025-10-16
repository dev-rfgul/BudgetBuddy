// import { Link } from "wouter";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
// import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
// import { useCurrentBudget } from "@/hooks/use-budget";
// import { useCategoriesWithAllocations, useExpenses } from "@/hooks/use-expenses";
// import { Skeleton } from "@/components/ui/skeleton";

// const COLORS = ['#2ECC71', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6'];

// export default function Analytics() {
//   const { data: budget } = useCurrentBudget();
//   const { data: categories = [], isLoading: categoriesLoading } = useCategoriesWithAllocations(budget?.id);
//   const { data: expenses = [], isLoading: expensesLoading } = useExpenses(budget?.id);

//   // Generate weekly spending data
//   const weeklyData = [];
//   const today = new Date();
//   for (let i = 6; i >= 0; i--) {
//     const date = new Date(today);
//     date.setDate(today.getDate() - i);
//     const dayExpenses = expenses.filter(expense => {
//       const expenseDate = new Date(expense.date);
//       return expenseDate.toDateString() === date.toDateString();
//     });
//     const dailyTotal = dayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
//     weeklyData.push({
//       day: date.toLocaleDateString('en-US', { weekday: 'short' }),
//       amount: dailyTotal,
//     });
//   }

//   // Generate category data for pie chart
//   const categoryData = categories.map((category, index) => ({
//     name: category.name,
//     value: category.spent,
//     color: COLORS[index % COLORS.length],
//   })).filter(item => item.value > 0);

//   // Calculate insights
//   const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
//   const averageDaily = totalSpent / 30; // Rough monthly average
//   const highestSpendingDay = weeklyData.reduce((max, day) => day.amount > max.amount ? day : max, weeklyData[0]);
//   const overspentCategories = categories.filter(cat => cat.spent > cat.allocated);

//   if (!budget) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <Card className="w-full max-w-md mx-4">
//           <CardContent className="pt-6 text-center">
//             <p className="text-muted-foreground">No budget data available for analytics.</p>
//             <Link href="/">
//               <Button className="mt-4">Go to Dashboard</Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="bg-card border-b border-border sticky top-0 z-40">
//         <div className="max-w-md mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <Link href="/">
//                 <Button variant="ghost" size="sm" data-testid="button-back">
//                   <ArrowLeft className="w-5 h-5" />
//                 </Button>
//               </Link>
//               <h1 className="font-semibold text-lg">Analytics</h1>
//             </div>
//             <div className="flex space-x-2">
//               <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
//                 Month
//               </Button>
//               <Button variant="ghost" size="sm" className="text-muted-foreground">
//                 Week
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-md mx-auto p-4 space-y-6 pb-20">
//         {/* Weekly Spending Chart */}
//         <Card data-testid="weekly-chart">
//           <CardHeader>
//             <CardTitle>Weekly Spending Trend</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {expensesLoading ? (
//               <Skeleton className="h-64 w-full" />
//             ) : (
//               <ResponsiveContainer width="100%" height={250}>
//                 <LineChart data={weeklyData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
//                   <XAxis dataKey="day" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => [`PKR ${Number(value).toFixed(2)}`, 'Amount']} />
//                   <Line 
//                     type="monotone" 
//                     dataKey="amount" 
//                     stroke="hsl(145 63% 49%)" 
//                     strokeWidth={2}
//                     dot={{ fill: 'hsl(145 63% 49%)', strokeWidth: 2 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>

//         {/* Category Breakdown */}
//         <Card data-testid="category-chart">
//           <CardHeader>
//             <CardTitle>Spending by Category</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {categoriesLoading ? (
//               <Skeleton className="h-64 w-full" />
//             ) : categoryData.length === 0 ? (
//               <p className="text-center text-muted-foreground py-8">No spending data available</p>
//             ) : (
//               <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie
//                     data={categoryData}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     dataKey="value"
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {categoryData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(value) => [`PKR ${Number(value).toFixed(2)}`, 'Spent']} />
//                 </PieChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>

//         {/* Spending Insights */}
//         <Card data-testid="insights">
//           <CardHeader>
//             <CardTitle>Insights</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
//                     <TrendingUp className="w-4 h-4 text-primary" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Highest spending day</p>
//                     <p className="text-xs text-muted-foreground">
//                       {highestSpendingDay?.day} - PKR {highestSpendingDay?.amount.toFixed(2)}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
//                     <CheckCircle className="w-4 h-4 text-success" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-sm">Average daily spending</p>
//                     <p className="text-xs text-muted-foreground">
//                       PKR {averageDaily.toFixed(2)} per day
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {overspentCategories.length > 0 && (
//                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
//                       <AlertTriangle className="w-4 h-4 text-destructive" />
//                     </div>
//                     <div>
//                       <p className="font-medium text-sm">Categories over budget</p>
//                       <p className="text-xs text-muted-foreground">
//                         {overspentCategories.length} category(ies) need attention
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Budget vs Actual */}
//         <Card data-testid="budget-vs-actual">
//           <CardHeader>
//             <CardTitle>Budget vs Actual</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {categoriesLoading ? (
//               <div className="space-y-4">
//                 {[1, 2, 3, 4].map((i) => (
//                   <Skeleton key={i} className="h-12 w-full" />
//                 ))}
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {categories.map((category) => {
//                   const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
//                   const isOverspent = category.spent > category.allocated;
                  
//                   return (
//                     <div key={category.id} className="flex items-center justify-between">
//                       <div className="flex items-center space-x-3 flex-1">
//                         <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
//                           <span className="text-xs font-medium text-primary">
//                             {category.name.charAt(0)}
//                           </span>
//                         </div>
//                         <div className="flex-1">
//                           <p className="font-medium text-sm">{category.name}</p>
//                           <div className="w-full bg-muted rounded-full h-1.5 mt-1">
//                             <div 
//                               className={`h-1.5 rounded-full ${
//                                 isOverspent ? 'bg-destructive' : 'bg-primary'
//                               }`}
//                               style={{ width: `${Math.min(percentage, 100)}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="text-right ml-4">
//                         <p className="text-sm font-medium">
//                           PKR {category.spent.toLocaleString()}
//                         </p>
//                         <p className="text-xs text-muted-foreground">
//                           of PKR {category.allocated.toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, DollarSign, Target, Activity, Eye, EyeOff } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { useCurrentBudget } from "@/hooks/use-budget";
import { useCategoriesWithAllocations, useExpenses } from "@/hooks/use-expenses";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const COLORS = ['#2ECC71', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#8E44AD'];

export default function Analytics() {
  const { data: budget } = useCurrentBudget();
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesWithAllocations(budget?.id);
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(budget?.id);
  const [viewPeriod, setViewPeriod] = useState<'week'|'month'|'day'>('month');
  const [showDetailedInsights, setShowDetailedInsights] = useState(true);

  const isMobile = useIsMobile();
  const CHART_HEIGHT = isMobile ? 220 : 320;

  // Helper functions for data analysis
  // Period semantics:
  // - 'day'   => last 7 days (daily points)
  // - 'week'  => last 5 weeks (weekly aggregated points)
  // - 'month' => last 5 months (monthly aggregated points)
  const WEEKS = 5;
  const MONTHS = 5;

  const getDateRange = () => {
    const today = new Date();
    let startDate = new Date();

    if (viewPeriod === 'day') {
      // last 7 days
      startDate.setDate(today.getDate() - (7 - 1));
    } else if (viewPeriod === 'week') {
      // last WEEKS weeks (use 5 weeks)
      startDate.setDate(today.getDate() - (WEEKS * 7 - 1));
    } else {
      // last MONTHS months (start at first day of month N months ago)
      startDate = new Date(today.getFullYear(), today.getMonth() - (MONTHS - 1), 1);
    }

    return { startDate, endDate: today };
  };

  const { startDate, endDate } = getDateRange();

  // Filter expenses by selected period to reduce work
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Generate time series data based on selected aggregation
  const generateTimeSeriesData = () => {
    const data: { key: string; label: string; amount: number; cumulative: number }[] = [];
    let cumulativeTotal = 0;

    if (viewPeriod === 'day') {
      // last 7 days
      for (let i = 7 - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const dailyTotal = filteredExpenses
          .filter(e => {
            const d = new Date(e.date);
            return d >= dayStart && d < dayEnd;
          })
          .reduce((s, e) => s + Number(e.amount), 0);

        cumulativeTotal += dailyTotal;

        data.push({
          key: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: isMobile ? 'short' : 'short' }),
          amount: dailyTotal,
          cumulative: cumulativeTotal,
        });
      }
    } else if (viewPeriod === 'week') {
      // last WEEKS weeks; each point aggregates 7-day window ending on that day
      for (let i = WEEKS - 1; i >= 0; i--) {
        const end = new Date();
        end.setDate(end.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6);

        const weekTotal = filteredExpenses
          .filter(e => {
            const d = new Date(e.date);
            return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) && d <= new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
          })
          .reduce((s, e) => s + Number(e.amount), 0);

        cumulativeTotal += weekTotal;

        // label: use short month/day of week start for compactness
        const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        data.push({
          key: `${start.toISOString().split('T')[0]}_wk`,
          label: label,
          amount: weekTotal,
          cumulative: cumulativeTotal,
        });
      }
    } else {
      // month view: last MONTHS months
      for (let i = MONTHS - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthTotal = filteredExpenses
          .filter(e => {
            const date = new Date(e.date);
            return date >= monthStart && date <= monthEnd;
          })
          .reduce((s, e) => s + Number(e.amount), 0);

        cumulativeTotal += monthTotal;

        data.push({
          key: `${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`,
          label: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          amount: monthTotal,
          cumulative: cumulativeTotal,
        });
      }
    }

    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Category analysis (pie + metrics)
  const categoryAnalysis = categories.map((category, index) => {
    const categoryExpenses = filteredExpenses.filter(exp => exp.categoryId === category.id);
    const spent = categoryExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const transactionCount = categoryExpenses.length;
    const averageTransaction = transactionCount > 0 ? spent / transactionCount : 0;
    const dailyAverage = spent / (viewPeriod === 'week' ? 7 : (viewPeriod === 'day' ? 1 : 30));
    const budgetUtilization = category.allocated > 0 ? (spent / category.allocated) * 100 : 0;

    // Trend analysis
    const daysTotal = viewPeriod === 'week' ? 7 : (viewPeriod === 'day' ? 1 : 30);
    const midPoint = Math.floor(daysTotal / 2);
    const sorted = filteredExpenses
      .filter(exp => exp.categoryId === category.id)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const firstHalf = sorted.slice(midPoint).reduce((s, e) => s + Number(e.amount), 0);
    const secondHalf = sorted.slice(0, midPoint).reduce((s, e) => s + Number(e.amount), 0);
    const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    return {
      ...category,
      spent,
      transactionCount,
      averageTransaction,
      dailyAverage,
      budgetUtilization,
      trend,
      color: COLORS[index % COLORS.length],
      efficiency: category.allocated > 0 ? Math.max(0, Math.min(100, (category.allocated - spent) / category.allocated * 100)) : 0
    };
  }).filter(cat => cat.allocated > 0);

  // Simple weekday aggregation for a line chart
  const expensesByDay: Record<number, number> = {};
  const expensesByHour: Record<number, number> = {};
  filteredExpenses.forEach(expense => {
    const date = new Date(expense.date);
    const day = date.getDay();
    const hour = date.getHours();
    expensesByDay[day] = (expensesByDay[day] || 0) + Number(expense.amount);
    expensesByHour[hour] = (expensesByHour[hour] || 0) + Number(expense.amount);
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const spendingByWeekday = Object.entries(expensesByDay)
    .map(([day, amount]) => ({ day: dayNames[parseInt(day)], amount: Number(amount) }))
    .sort((a, b) => dayNames.indexOf(a.day) - dayNames.indexOf(b.day)); // maintain weekday order

  // High-level metrics
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalBudget = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const budgetRemaining = totalBudget - totalSpent;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  // compute period days for averages
  const periodDays = viewPeriod === 'day' ? 7 : (viewPeriod === 'week' ? WEEKS * 7 : MONTHS * 30);
  const averageDaily = totalSpent / Math.max(1, periodDays);
  const projectedMonthly = averageDaily * 30;

  // Visual helpers
  const areaStroke = 'hsl(145 63% 49%)';
  const cumulativeStroke = 'hsl(271 81% 56%)';

  if (!budget) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
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
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="font-semibold text-lg">Spending Trends</h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewPeriod === 'day' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewPeriod('day')}
                className="text-xs"
              >
                Day
              </Button>
              <Button
                variant={viewPeriod === 'week' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewPeriod('week')}
                className="text-xs"
              >
                Week
              </Button>
              <Button
                variant={viewPeriod === 'month' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewPeriod('month')}
                className="text-xs"
              >
                Month
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6 pb-32">
        {/* Overview Cards (small sparklines) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-semibold">PKR {totalSpent.toLocaleString()}</p>
                </div>
                <div style={{ width: 90, height: 36 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <Line dataKey="amount" stroke={areaStroke} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{budgetUtilization.toFixed(1)}% of allocations</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-lg font-semibold">PKR {budgetRemaining.toLocaleString()}</p>
                </div>
                <div style={{ width: 90, height: 36 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <Area dataKey="cumulative" stroke={cumulativeStroke} fill={cumulativeStroke} fillOpacity={0.12} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Projected: PKR {projectedMonthly.toFixed(0)}/mo</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold">{filteredExpenses.length}</p>
                </div>
                <div style={{ width: 90, height: 36 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <Line dataKey="amount" stroke="#9B59B6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Avg: PKR {filteredExpenses.length > 0 ? (totalSpent / filteredExpenses.length).toFixed(0) : 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Daily Avg</p>
                  <p className="text-lg font-semibold">PKR {averageDaily.toFixed(0)}</p>
                </div>
                <div style={{ width: 90, height: 36 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <Area dataKey="amount" stroke="#F39C12" fill="#F39C12" fillOpacity={0.12} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Projected monthly shown above</p>
            </CardContent>
          </Card>
        </div>

        {/* Big Trend chart (Area + cumulative line) */}
        <Card data-testid="spending-trend">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Spending Trend</CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant={Math.abs((timeSeriesData[timeSeriesData.length-1]?.amount || 0) - (timeSeriesData[0]?.amount || 0)) > 1000 ? "destructive" : "secondary"}>
                {timeSeriesData.length > 1 ? `${Math.sign((timeSeriesData[timeSeriesData.length-1]?.amount || 0) - (timeSeriesData[0]?.amount || 0)) === 1 ? '↗' : '↘'} ${Math.abs(((timeSeriesData[timeSeriesData.length-1]?.amount || 0) - (timeSeriesData[0]?.amount || 0))).toFixed(0)}` : '—'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <AreaChart data={timeSeriesData} margin={{ top: 8, right: 18, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={areaStroke} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={areaStroke} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                  <XAxis dataKey={viewPeriod === 'week' ? 'day' : 'fullDate'} className="text-xs" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Amount']} labelFormatter={(label) => `Date: ${label}`} />
                  <Area type="monotone" dataKey="amount" stroke={areaStroke} fill="url(#colorAmount)" strokeWidth={2} dot={{ r: isMobile ? 2 : 3 }} />
                  <Line type="monotone" dataKey="cumulative" stroke={cumulativeStroke} strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown (Pie) */}
          <Card data-testid="category-chart">
            <CardHeader>
              <CardTitle className="text-lg">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : categoryAnalysis.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No budget allocations available</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div style={{ width: isMobile ? 180 : 220, height: isMobile ? 180 : 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryAnalysis}
                          dataKey="spent"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 36 : 48}
                          outerRadius={isMobile ? 64 : 90}
                          paddingAngle={4}
                          labelLine={false}
                        >
                          {categoryAnalysis.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1">
                    <div className="space-y-3">
                      {categoryAnalysis.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                            <div>
                              <p className="font-medium text-sm">{cat.name}</p>
                              <p className="text-xs text-muted-foreground">{cat.transactionCount} tx • PKR {cat.spent.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">PKR {cat.spent.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{cat.budgetUtilization.toFixed(0)}% used</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekday / Hour pattern (Line) */}
          <Card data-testid="weekday-pattern">
            <CardHeader>
              <CardTitle className="text-lg">Spending by Weekday</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                  <LineChart data={spendingByWeekday} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value) => [`PKR ${Number(value).toFixed(2)}`, 'Amount']} />
                    <Line dataKey="amount" stroke="#3498DB" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Smart Insights */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Smart Insights</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailedInsights(!showDetailedInsights)}
            >
              {showDetailedInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${budgetUtilization < 50 ? 'bg-green-500' : budgetUtilization < 80 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <p className="font-medium text-sm">Budget Health</p>
                </div>
                <p className="text-2xl font-bold">{Math.min(100, budgetUtilization).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">{budgetUtilization < 30 ? 'Excellent' : budgetUtilization < 70 ? 'Monitor' : 'Action needed'}</p>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <p className="font-medium text-sm">Spending Trend</p>
                </div>
                <p className="text-2xl font-bold">{(timeSeriesData.length > 1 ? ((timeSeriesData[timeSeriesData.length-1].amount - timeSeriesData[0].amount) / Math.max(1, timeSeriesData[0].amount)) * 100 : 0).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">vs. period start</p>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="font-medium text-sm">Most Efficient Category</p>
                </div>
                <p className="text-lg font-bold">
                  {categoryAnalysis.reduce((best, cat) => cat.efficiency > best.efficiency ? cat : best, categoryAnalysis[0] || { name: 'N/A', efficiency: 0 }).name}
                </p>
                <p className="text-xs text-muted-foreground">Best budget utilization</p>
              </div>
            </div>

            {showDetailedInsights && (
              <div className="mt-4 space-y-3">
                {categoryAnalysis.slice(0, 6).map(cat => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                      <div>
                        <p className="font-medium text-sm">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.transactionCount} tx • Avg PKR {cat.averageTransaction.toFixed(0)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">PKR {cat.spent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{cat.budgetUtilization.toFixed(0)}% used</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}