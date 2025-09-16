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
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area, Cell } from "recharts";
import { useCurrentBudget } from "@/hooks/use-budget";
import { useCategoriesWithAllocations, useExpenses } from "@/hooks/use-expenses";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const COLORS = ['#2ECC71', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#8E44AD'];

export default function Analytics() {
  const { data: budget } = useCurrentBudget();
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesWithAllocations(budget?.id);
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(budget?.id);
  const [viewPeriod, setViewPeriod] = useState('month');
  const [showDetailedInsights, setShowDetailedInsights] = useState(true);

  // Helper functions for data analysis
  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    
    if (viewPeriod === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else {
      startDate.setDate(today.getDate() - 30);
    }
    
    return { startDate, endDate: today };
  };

  const { startDate, endDate } = getDateRange();

  // Filter expenses by selected period
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Generate time series data
  const generateTimeSeriesData = () => {
    const days = viewPeriod === 'week' ? 7 : 30;
    const data = [];
    let cumulativeTotal = 0;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.toDateString() === date.toDateString();
      });
      
      const dailyTotal = dayExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      cumulativeTotal += dailyTotal;
      
      data.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dailyTotal,
        cumulative: cumulativeTotal,
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Category analysis with enhanced insights
  const categoryAnalysis = categories.map((category, index) => {
    const categoryExpenses = filteredExpenses.filter(exp => exp.categoryId === category.id);
    const spent = categoryExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const transactionCount = categoryExpenses.length;
    const averageTransaction = transactionCount > 0 ? spent / transactionCount : 0;
    const dailyAverage = spent / (viewPeriod === 'week' ? 7 : 30);
    const budgetUtilization = category.allocated > 0 ? (spent / category.allocated) * 100 : 0;
    
    // Trend analysis (comparing first half vs second half of period)
    const midPoint = Math.floor((viewPeriod === 'week' ? 7 : 30) / 2);
    const firstHalf = categoryExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      const daysDiff = Math.floor((new Date() - expDate) / (1000 * 60 * 60 * 24));
      return daysDiff >= midPoint;
    }).reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    const secondHalf = spent - firstHalf;
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
      efficiency: category.allocated > 0 ? Math.min(100, (category.allocated - spent) / category.allocated * 100) : 0
    };
  }).filter(cat => cat.spent > 0);

  // Debug logging
  console.log('Categories:', categories);
  console.log('Filtered Expenses:', filteredExpenses);
  console.log('Category Analysis:', categoryAnalysis);

  // Advanced insights calculations
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalBudget = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const budgetRemaining = totalBudget - totalSpent;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  const averageDaily = totalSpent / (viewPeriod === 'week' ? 7 : 30);
  const projectedMonthly = averageDaily * 30;
  
  // Spending patterns
  const expensesByDay: Record<number, number> = {};
  const expensesByHour: Record<number, number> = {};
  
  filteredExpenses.forEach(expense => {
    const date = new Date(expense.date);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    
    expensesByDay[dayOfWeek] = (expensesByDay[dayOfWeek] || 0) + Number(expense.amount);
    expensesByHour[hour] = (expensesByHour[hour] || 0) + Number(expense.amount);
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const spendingByWeekday = Object.entries(expensesByDay)
    .map(([day, amount]) => ({
      day: dayNames[parseInt(day)],
      amount: Number(amount)
    }))
    .sort((a, b) => b.amount - a.amount);

  const highestSpendingDay = timeSeriesData.reduce((max, day) => 
    day.amount > max.amount ? day : max, timeSeriesData[0] || { amount: 0 });
  
  const lowestSpendingDay = timeSeriesData.reduce((min, day) => 
    day.amount < min.amount ? day : min, timeSeriesData[0] || { amount: 0 });

  // Risk assessment
  const overspentCategories = categoryAnalysis.filter(cat => cat.spent > cat.allocated);
  const riskScore = Math.min(100, (overspentCategories.length / categories.length) * 50 + 
    (budgetUtilization > 100 ? 50 : budgetUtilization * 0.5));

  // Spending velocity (acceleration/deceleration)
  const recentWeekSpending = timeSeriesData.slice(-7).reduce((sum, day) => sum + day.amount, 0);
  const previousWeekSpending = timeSeriesData.slice(-14, -7).reduce((sum, day) => sum + day.amount, 0);
  const spendingVelocity = previousWeekSpending > 0 ? 
    ((recentWeekSpending - previousWeekSpending) / previousWeekSpending) * 100 : 0;

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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="font-semibold text-lg lg:text-xl">Analytics</h1>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={viewPeriod === 'month' ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewPeriod('month')}
                className="text-xs lg:text-sm"
              >
                Month
              </Button>
              <Button 
                variant={viewPeriod === 'week' ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewPeriod('week')}
                className="text-xs lg:text-sm"
              >
                Week
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6 pb-20">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">Total Spent</p>
              </div>
              <p className="text-2xl font-bold">PKR {totalSpent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {budgetUtilization.toFixed(1)}% of budget
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-500" />
                <p className="text-sm font-medium">Remaining</p>
              </div>
              <p className="text-2xl font-bold">PKR {budgetRemaining.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {((budgetRemaining / totalBudget) * 100).toFixed(1)}% left
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-medium">Daily Average</p>
              </div>
              <p className="text-2xl font-bold">PKR {averageDaily.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">
                Projected: PKR {projectedMonthly.toFixed(0)}/mo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <p className="text-sm font-medium">Transactions</p>
              </div>
              <p className="text-2xl font-bold">{filteredExpenses.length}</p>
              <p className="text-xs text-muted-foreground">
                Avg: PKR {filteredExpenses.length > 0 ? (totalSpent / filteredExpenses.length).toFixed(0) : 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trend */}
          <Card data-testid="spending-trend" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Spending Trend</CardTitle>
              <Badge variant={spendingVelocity > 10 ? "destructive" : spendingVelocity < -10 ? "default" : "secondary"}>
                {spendingVelocity > 0 ? "↗" : "↘"} {Math.abs(spendingVelocity).toFixed(1)}%
              </Badge>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(145 63% 49%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(145 63% 49%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                    <XAxis 
                      dataKey={viewPeriod === 'week' ? 'day' : 'fullDate'} 
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value) => [`PKR ${Number(value).toFixed(2)}`, 'Amount']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(145 63% 49%)"
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone"
                      dataKey="cumulative"
                      stroke="hsl(262 52% 47%)"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card data-testid="category-chart">
            <CardHeader>
              <CardTitle className="text-lg">Category Spending</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : categoryAnalysis.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No spending data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categoryAnalysis.sort((a, b) => b.spent - a.spent)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value, name) => [`PKR ${Number(value).toLocaleString()}`, 'Spent']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                      {categoryAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Weekday Spending Pattern */}
          <Card data-testid="weekday-pattern">
            <CardHeader>
              <CardTitle className="text-lg">Spending by Weekday</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={spendingByWeekday}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value) => [`PKR ${Number(value).toFixed(2)}`, 'Amount']} />
                    <Bar dataKey="amount" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Advanced Insights */}
        <Card data-testid="advanced-insights">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Risk Assessment */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    riskScore < 30 ? 'bg-green-500' : riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <p className="font-medium text-sm">Budget Health</p>
                </div>
                <p className="text-2xl font-bold">{riskScore.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">
                  {riskScore < 30 ? 'Excellent control' : riskScore < 70 ? 'Monitor closely' : 'Action needed'}
                </p>
              </div>

              {/* Spending Velocity */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {spendingVelocity > 0 ? 
                    <TrendingUp className="w-4 h-4 text-red-500" /> : 
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  }
                  <p className="font-medium text-sm">Spending Trend</p>
                </div>
                <p className="text-2xl font-bold">{spendingVelocity > 0 ? '+' : ''}{spendingVelocity.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  vs. previous period
                </p>
              </div>

              {/* Peak Spending */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <p className="font-medium text-sm">Peak Day</p>
                </div>
                <p className="text-lg font-bold">{highestSpendingDay?.day || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  PKR {highestSpendingDay?.amount?.toFixed(2) || 0}
                </p>
              </div>

              {/* Best Category */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="font-medium text-sm">Most Efficient</p>
                </div>
                <p className="text-lg font-bold">
                  {categoryAnalysis.reduce((best, cat) => 
                    cat.efficiency > best.efficiency ? cat : best, 
                    categoryAnalysis[0] || { name: 'N/A', efficiency: 0 }
                  ).name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Best budget utilization
                </p>
              </div>
            </div>

            {showDetailedInsights && (
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-sm">Detailed Analysis</h4>
                
                {/* Category Performance */}
                <div className="space-y-3">
                  {categoryAnalysis.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{category.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{category.transactionCount} transactions</span>
                            <span>•</span>
                            <span>PKR {category.averageTransaction.toFixed(0)} avg</span>
                            <span>•</span>
                            <Badge 
                              variant={category.trend > 10 ? "destructive" : category.trend < -10 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {category.trend > 0 ? '+' : ''}{category.trend.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-sm font-medium">PKR {category.spent.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.budgetUtilization.toFixed(1)}% used
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actionable Recommendations */}
                {(overspentCategories.length > 0 || riskScore > 50) && (
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <h4 className="font-semibold text-sm">Recommendations</h4>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {overspentCategories.length > 0 && (
                        <li>• Consider reducing spending in {overspentCategories[0].name} (over by PKR {(overspentCategories[0].spent - overspentCategories[0].allocated).toLocaleString()})</li>
                      )}
                      {riskScore > 70 && (
                        <li>• Your spending is above recommended levels - review your largest categories</li>
                      )}
                      {spendingVelocity > 20 && (
                        <li>• Spending has increased significantly - monitor daily expenses more closely</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card data-testid="budget-progress">
          <CardHeader>
            <CardTitle className="text-lg">Budget Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categoryAnalysis.map((category) => {
                  const isOverspent = category.spent > category.allocated;
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-sm">{category.name}</span>
                          {isOverspent && (
                            <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            PKR {category.spent.toLocaleString()} / {category.allocated.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {category.budgetUtilization.toFixed(1)}% used
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            isOverspent ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(category.budgetUtilization, 100)}%` }}
                        />
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