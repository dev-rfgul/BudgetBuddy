import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { localStorageService } from "@/lib/localStorage";
import { type Budget, type BudgetSummary } from "@shared/schema";

export function useCurrentBudget() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  return useQuery<Budget | null>({
    queryKey: ["budget", currentMonth],
    queryFn: async () => {
      try {
        let budget = await localStorageService.getBudget(currentMonth);
        if (budget) return budget;

        // No budget for current month - attempt to create one by copying the most recent budget
        const all = await localStorageService.getBudgets();
        if (all.length === 0) return null;

        // Find the most recent budget by month string (ISO YYYY-MM works for lexicographic sort)
        const sorted = all.slice().sort((a, b) => (a.month < b.month ? 1 : -1));
        const last = sorted[0];

        // Create new budget for currentMonth using last's monthlyIncome
        const created = await localStorageService.createBudget({ month: currentMonth, monthlyIncome: last.monthlyIncome });

        // Copy allocations from last budget to created budget
        try {
          await localStorageService.copyAllocations(last.id, created.id);
        } catch (e) {
          // non-fatal
          console.warn('Failed to copy allocations for new month', e);
        }

        // Invalidate relevant queries and return created
        queryClient.invalidateQueries({ queryKey: ["budget"] });
        return created;
      } catch (error) {
        return null;
      }
    },
  });
}

export function useBudgetSummary(budgetId: string | undefined) {
  return useQuery<BudgetSummary>({
    queryKey: ["budget", budgetId, "summary"],
    queryFn: async () => {
      if (!budgetId) throw new Error("Budget ID is required");
      return await localStorageService.getBudgetSummary(budgetId);
    },
    enabled: !!budgetId,
  });
}

export function useCreateBudget() {
  return useMutation({
    mutationFn: async (budgetData: { monthlyIncome: string; month: string }) => {
      return await localStorageService.createBudget(budgetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

export function useUpdateBudget() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ monthlyIncome: string; month: string }> }) => {
      return await localStorageService.updateBudget(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}
