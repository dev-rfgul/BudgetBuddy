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
        const budget = await localStorageService.getBudget(currentMonth);
        return budget || null;
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
