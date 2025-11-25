import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { storageService } from "@/lib/storage";
import { type RecurringExpense } from "@/types";

export function useRecurringExpenses() {
    return useQuery<RecurringExpense[]>({
        queryKey: ["recurring-expenses"],
        queryFn: async () => {
            return await storageService.getRecurringExpenses();
        },
    });
}

export function useCreateRecurringExpense() {
    return useMutation({
        mutationFn: async (data: Omit<RecurringExpense, 'id' | 'createdAt' | 'lastProcessed'>) => {
            return await storageService.createRecurringExpense(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
        },
    });
}

export function useDeleteRecurringExpense() {
    return useMutation({
        mutationFn: async (id: string) => {
            return await storageService.deleteRecurringExpense(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-expenses"] });
        },
    });
}
