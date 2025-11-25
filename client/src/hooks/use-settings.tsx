import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { storageService } from "@/lib/storage";
import { type AppSettings } from "@/types";

export function useSettings() {
    return useQuery<AppSettings>({
        queryKey: ["settings"],
        queryFn: async () => {
            return await storageService.getSettings();
        },
    });
}

export function useUpdateSettings() {
    return useMutation({
        mutationFn: async (settings: Partial<AppSettings>) => {
            return await storageService.updateSettings(settings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });
}
