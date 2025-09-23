import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { localStorageService } from "@/lib/localStorage";
import { type Expense, type CategoryWithAllocation } from "@/types";

export function useExpenses(budgetId: string | undefined) {
  return useQuery<Expense[]>({
    queryKey: ["budget", budgetId, "expenses"],
    queryFn: async () => {
      if (!budgetId) throw new Error("Budget ID is required");
      return await localStorageService.getExpenses(budgetId);
    },
    enabled: !!budgetId,
  });
}

export function useCategoriesWithAllocations(budgetId: string | undefined) {
  return useQuery<CategoryWithAllocation[]>({
    queryKey: ["budget", budgetId, "categories-with-allocations"],
    queryFn: async () => {
      if (!budgetId) throw new Error("Budget ID is required");
      return await localStorageService.getCategoriesWithAllocations(budgetId);
    },
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
      return await localStorageService.createExpense({
        ...expenseData,
        budgetId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget", variables.budgetId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["budget", variables.budgetId, "categories-with-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["budget", variables.budgetId, "summary"] });
    },
  });
}

export function useDeleteExpense() {
  return useMutation({
    mutationFn: async ({ expenseId, budgetId }: { expenseId: string; budgetId: string }) => {
      await localStorageService.deleteExpense(expenseId);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budget", variables.budgetId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["budget", variables.budgetId, "categories-with-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["budget", variables.budgetId, "summary"] });
    },
  });
}
