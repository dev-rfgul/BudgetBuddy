import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { localStorageService } from "@/lib/localStorage";
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";
import { type Expense, type Category } from "@shared/schema";
import { useMemo } from "react";

interface TransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId?: string;
}

export default function TransactionsModal({ open, onOpenChange, budgetId }: TransactionsModalProps) {
  const { data: expenses = [], isLoading } = useExpenses(budgetId);
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => await localStorageService.getCategories(),
    enabled: !!open,
  });

  const deleteMutation = useDeleteExpense();

  const currentMonthExpenses = useMemo(() => {
    if (!expenses) return [] as Expense[];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [expenses]);

  const findCategoryName = (id?: string) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transactions — Current Month</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-2">
          {isLoading ? (
            <div className="text-muted-foreground">Loading transactions…</div>
          ) : currentMonthExpenses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-muted-foreground">No transactions for this month.</div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {currentMonthExpenses.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <div className="font-medium">{tx.description || findCategoryName(tx.categoryId)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{findCategoryName(tx.categoryId)}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="font-semibold">PKR {Number(tx.amount).toLocaleString()}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (!budgetId) return;
                        await deleteMutation.mutateAsync({ expenseId: tx.id, budgetId });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
