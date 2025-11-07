import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { type Expense } from "@/types";
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";

interface SpendingChartProps {
  expenses: Expense[];
  isLoading: boolean;
}

type ChartPeriod = "day" | "week" | "month";

interface ChartDataPoint {
  label: string;
  amount: number;
  date: Date;
}

export default function SpendingChart({ expenses, isLoading }: SpendingChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("day");

  // Aggregate expenses by period
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const now = new Date();
    const data: ChartDataPoint[] = [];

    if (period === "day") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= dayStart && expDate <= dayEnd;
        });

        const total = dayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        
        data.push({
          label: format(date, "EEE"),
          amount: total,
          date: date,
        });
      }
    } else if (period === "week") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        
        const weekExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= weekStart && expDate <= weekEnd;
        });

        const total = weekExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        
        data.push({
          label: `W${4 - i}`,
          amount: total,
          date: weekStart,
        });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));
        
        const monthExpenses = expenses.filter(exp => {
          const expDate = new Date(exp.date);
          return expDate >= monthStart && expDate <= monthEnd;
        });

        const total = monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        
        data.push({
          label: format(monthStart, "MMM"),
          amount: total,
          date: monthStart,
        });
      }
    }

    return data;
  }, [expenses, period]);

  // Calculate stats
  const stats = useMemo(() => {
    if (chartData.length === 0) return { total: 0, average: 0, highest: 0 };
    
    const total = chartData.reduce((sum, d) => sum + d.amount, 0);
    const average = total / chartData.length;
    const highest = Math.max(...chartData.map(d => d.amount));
    
    return { total, average, highest };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md" data-testid="spending-chart">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-semibold">Spending Overview</CardTitle>
          
          {/* Period Selector - Mobile Optimized */}
          <Tabs value={period} onValueChange={(v) => setPeriod(v as ChartPeriod)} className="w-auto">
            <TabsList className="h-9 p-1 bg-muted/50">
              <TabsTrigger value="day" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Day
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No spending data for this period
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="w-full" style={{ touchAction: 'pan-y' }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart 
                  data={chartData} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--border))" 
                    opacity={0.3}
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    height={30}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      padding: '8px 12px',
                    }}
                    formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Spent']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload as ChartDataPoint;
                        if (period === "day") {
                          return format(data.date, "EEEE, MMM d");
                        } else if (period === "week") {
                          return `Week of ${format(data.date, "MMM d")}`;
                        } else {
                          return format(data.date, "MMMM yyyy");
                        }
                      }
                      return label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ 
                      r: 6, 
                      fill: 'hsl(var(--primary))',
                      stroke: 'hsl(var(--background))',
                      strokeWidth: 2
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Grid - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {/* Total */}
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Total</p>
                <p className="text-sm font-bold leading-tight">
                  PKR {stats.total.toLocaleString()}
                </p>
              </div>

              {/* Average */}
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Average</p>
                <p className="text-sm font-bold leading-tight">
                  PKR {Math.round(stats.average).toLocaleString()}
                </p>
              </div>

              {/* Highest */}
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Highest</p>
                <p className="text-sm font-bold leading-tight text-primary">
                  PKR {stats.highest.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Period Description */}
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              {period === "day" && "Daily spending for the last 7 days"}
              {period === "week" && "Weekly spending for the last 4 weeks"}
              {period === "month" && "Monthly spending for the last 6 months"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
