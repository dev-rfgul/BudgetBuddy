import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { storageService } from "@/lib/storage";
import { type SavingsGoal } from "@/types";

export function useSavingsGoals() {
    return useQuery<SavingsGoal[]>({
        queryKey: ["savings-goals"],
        queryFn: async () => {
            return await storageService.getSavingsGoals();
        },
    });
}

export function useCreateSavingsGoal() {
    return useMutation({
        mutationFn: async (data: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
            return await storageService.createSavingsGoal(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
        },
    });
}

export function useUpdateSavingsGoal() {
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<SavingsGoal> }) => {
            return await storageService.updateSavingsGoal(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
        },
    });
}

export function useDeleteSavingsGoal() {
    return useMutation({
        mutationFn: async (id: string) => {
            return await storageService.deleteSavingsGoal(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
        },
    });
}
