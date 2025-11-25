import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/lib/storage";

interface ResetTransactionsParams {
  budgetId: string;
}

export function useResetTransactions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ budgetId }: ResetTransactionsParams) => {
      await storageService.resetBudgetExpenses(budgetId);
      return { success: true };
    },
    onSuccess: (_, { budgetId }) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["expenses", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-allocations", budgetId] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary", budgetId] });

      toast({
        title: "Success",
        description: "All transactions have been reset for this month",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset transactions",
        variant: "destructive",
      });
    },
  });
}
