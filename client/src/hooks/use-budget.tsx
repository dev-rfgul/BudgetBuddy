import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type Budget, type BudgetSummary } from "@shared/schema";

export function useCurrentBudget() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  return useQuery<Budget | null>({
    queryKey: ["/api/budget", currentMonth],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/budget/${currentMonth}`);
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Failed to fetch budget");
        return response.json();
      } catch (error) {
        return null;
      }
    },
  });
}

export function useBudgetSummary(budgetId: string | undefined) {
  return useQuery<BudgetSummary>({
    queryKey: ["/api/budget", budgetId, "summary"],
    enabled: !!budgetId,
  });
}

export function useCreateBudget() {
  return useMutation({
    mutationFn: async (budgetData: { monthlyIncome: number; month: string }) => {
      const response = await apiRequest("POST", "/api/budget", budgetData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
    },
  });
}

export function useUpdateBudget() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ monthlyIncome: number; month: string }> }) => {
      const response = await apiRequest("PUT", `/api/budget/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
    },
  });
}
