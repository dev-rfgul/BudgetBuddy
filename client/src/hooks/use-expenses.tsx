import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { type Expense, type CategoryWithAllocation } from "@shared/schema";

export function useExpenses(budgetId: string | undefined) {
  return useQuery<Expense[]>({
    queryKey: ["/api/budget", budgetId, "expenses"],
    enabled: !!budgetId,
  });
}

export function useCategoriesWithAllocations(budgetId: string | undefined) {
  return useQuery<CategoryWithAllocation[]>({
    queryKey: ["/api/budget", budgetId, "categories-with-allocations"],
    enabled: !!budgetId,
  });
}

export function useCreateExpense() {
  return useMutation({
    mutationFn: async ({ budgetId, expenseData }: { 
      budgetId: string; 
      expenseData: { 
        amount: string; 
        description: string; 
        categoryId: string; 
        date: string; 
      } 
    }) => {
      const response = await apiRequest("POST", `/api/budget/${budgetId}/expenses`, expenseData);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget", variables.budgetId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget", variables.budgetId, "categories-with-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget", variables.budgetId, "summary"] });
    },
  });
}

export function useDeleteExpense() {
  return useMutation({
    mutationFn: async ({ expenseId, budgetId }: { expenseId: string; budgetId: string }) => {
      const response = await apiRequest("DELETE", `/api/expenses/${expenseId}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget", variables.budgetId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget", variables.budgetId, "categories-with-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget", variables.budgetId, "summary"] });
    },
  });
}
