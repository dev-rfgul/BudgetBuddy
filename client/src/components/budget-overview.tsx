import { Card, CardContent } from "@/components/ui/card";
import { type BudgetSummary } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface BudgetOverviewProps {
  summary: BudgetSummary | undefined;
  isLoading: boolean;
}

export default function BudgetOverview({ summary, isLoading }: BudgetOverviewProps) {
  if (isLoading) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <Skeleton className="h-4 w-24 mx-auto mb-2" />
            <Skeleton className="h-8 w-32 mx-auto mb-2" />
            <div className="flex justify-center items-center mt-2 space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-full mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">No budget data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allocationPercentage = summary.monthlyBudget > 0 ? (summary.totalAllocated / summary.monthlyBudget) * 100 : 0;

  return (
    <Card className="mx-4 mt-4" data-testid="budget-overview">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Monthly Budget</p>
          <p className="text-3xl font-bold text-foreground" data-testid="monthly-budget">
            PKR {summary.monthlyBudget.toLocaleString()}
          </p>
          <div className="flex justify-center items-center mt-2 space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-muted-foreground">Allocated: </span>
              <span className="font-medium ml-1" data-testid="total-allocated">
                PKR {summary.totalAllocated.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-muted rounded-full mr-2"></div>
              <span className="text-muted-foreground">Remaining: </span>
              <span className="font-medium ml-1 text-primary" data-testid="remaining-budget">
                PKR {summary.remainingBudget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-4">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
            data-testid="budget-progress-bar"
          ></div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="font-semibold text-foreground" data-testid="total-spent">
              PKR {summary.totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="font-semibold text-foreground" data-testid="category-count">
              {summary.categoryCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Days Left</p>
            <p className="font-semibold text-foreground" data-testid="days-left">
              {summary.daysLeft}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
