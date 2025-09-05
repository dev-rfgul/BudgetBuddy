import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { localStorageService } from "@/lib/localStorage";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Category, BudgetAllocation } from "@shared/schema";
import { ShoppingCart, Car, FileText, Zap, Smile } from "lucide-react";

interface ManageBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId?: string;
}

export default function ManageBudgetModal({ open, onOpenChange, budgetId }: ManageBudgetModalProps) {
  const { toast } = useToast();
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => await localStorageService.getCategories(),
  });

  const { data: allocations = [] } = useQuery<BudgetAllocation[]>({
    queryKey: ["allocations", budgetId],
    enabled: !!budgetId,
    queryFn: async () => (budgetId ? await localStorageService.getBudgetAllocations(budgetId) : []),
  });

  const [localAlloc, setLocalAlloc] = useState<Record<string, { id?: string; allocatedAmount: string }>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const iconOptions = [
    { value: "shopping-cart", label: "Shopping Cart", icon: ShoppingCart },
    { value: "car", label: "Car", icon: Car },
    { value: "file-text", label: "File", icon: FileText },
    { value: "zap", label: "Lightning", icon: Zap },
    { value: "smile", label: "Smile", icon: Smile },
  ];

  const colorOptions = [
    { value: "#2ECC71", label: "Green" },
    { value: "#3498DB", label: "Blue" },
    { value: "#E74C3C", label: "Red" },
    { value: "#F39C12", label: "Orange" },
    { value: "#9B59B6", label: "Purple" },
  ];

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; icon: string; color: string }) => {
      return await localStorageService.createCategory({ ...categoryData, isDefault: false });
    },
    onSuccess: (created: Category) => {
      // update categories cache immediately
      queryClient.setQueryData(["categories"], (old: Category[] | undefined) => {
        const arr = old ? [...old] : [];
        arr.push(created);
        return arr;
      });

      // ensure local allocation entry exists
      setLocalAlloc((s) => ({ ...s, [created.id]: { id: undefined, allocatedAmount: "0" } }));

      setNewCategoryName("");
      setNewCategoryIcon("");
      setNewCategoryColor("");
      setIsCreating(false);
  queryClient.invalidateQueries({ queryKey: ["categories"] });
  // also refresh budget-related derived queries in case user created category during a session
  queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast({ title: "Success", description: "Category created successfully!" });
    },
  });

  useEffect(() => {
    // initialize local allocations for every category
    const map: Record<string, { id?: string; allocatedAmount: string }> = {};
    categories.forEach((c) => {
      const existing = allocations.find((a) => a.categoryId === c.id);
      map[c.id] = { id: existing?.id, allocatedAmount: existing ? String(existing.allocatedAmount) : "0" };
    });
    setLocalAlloc(map);
  }, [categories, allocations]);

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCategoryName || !newCategoryIcon || !newCategoryColor) {
      toast({ title: "Error", description: "Please fill in all category fields", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      await createCategoryMutation.mutateAsync({ name: newCategoryName, icon: newCategoryIcon, color: newCategoryColor });
    } catch (err) {
      setIsCreating(false);
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    }
  };

  const handleChange = (categoryId: string, value: string) => {
    setLocalAlloc((s) => ({ ...s, [categoryId]: { ...s[categoryId], allocatedAmount: value } }));
  };

  const handleSave = async () => {
    if (!budgetId) return;
    try {
      for (const categoryId of Object.keys(localAlloc)) {
        const amount = localAlloc[categoryId].allocatedAmount || "0";
        const existing = allocations.find((a) => a.categoryId === categoryId);

        if (existing) {
          if (Number(amount) === 0) {
            await localStorageService.deleteBudgetAllocation(existing.id);
          } else if (String(existing.allocatedAmount) !== String(amount)) {
            await localStorageService.updateBudgetAllocation(existing.id, { allocatedAmount: amount });
          }
        } else {
          if (Number(amount) > 0) {
            await localStorageService.createBudgetAllocation({ budgetId, categoryId, allocatedAmount: amount });
          }
        }
      }

      // Immediately update allocations cache so UI elsewhere reflects changes
      const newAllocations: BudgetAllocation[] = Object.keys(localAlloc).map((categoryId) => {
        const existing = allocations.find((a) => a.categoryId === categoryId);
        return {
          id: existing?.id ?? crypto.randomUUID(),
          budgetId: budgetId,
          categoryId,
          allocatedAmount: localAlloc[categoryId].allocatedAmount,
          createdAt: new Date(),
        } as unknown as BudgetAllocation;
      }).filter(a => Number(a.allocatedAmount) > 0);

      queryClient.setQueryData(["allocations", budgetId], newAllocations);
  queryClient.invalidateQueries({ queryKey: ["budget", budgetId, "summary"] });
  queryClient.invalidateQueries({ queryKey: ["allocations", budgetId] });
  // ensure dashboard derived queries refresh
  queryClient.invalidateQueries({ queryKey: ["budget", budgetId, "categories-with-allocations"] });
  queryClient.invalidateQueries({ queryKey: ["budget", budgetId, "expenses"] });

      toast({ title: "Success", description: "Allocations updated" });
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update allocations", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg slide-up" data-testid="manage-budget-modal">
        <DialogHeader>
          <DialogTitle>Manage Budget Allocations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Adjust allocations per category. Total allocations should not exceed your monthly income.</p>

          <div className="space-y-3">
            {/* Create new category (use same design as BudgetSetup) */}
            <form onSubmit={handleCreateCategory} className="space-y-3 p-2 border border-border rounded">
              <div>
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Entertainment"
                  data-testid="input-category-name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoryIcon">Icon *</Label>
                <Select value={newCategoryIcon} onValueChange={setNewCategoryIcon} required>
                  <SelectTrigger data-testid="select-category-icon">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoryColor">Color *</Label>
                <Select value={newCategoryColor} onValueChange={setNewCategoryColor} required>
                  <SelectTrigger data-testid="select-category-color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: option.value }}
                          ></div>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setNewCategoryName(""); setNewCategoryIcon(""); setNewCategoryColor(""); }} className="flex-1" data-testid="button-cancel-category">Cancel</Button>
                <Button type="submit" className="flex-1" disabled={createCategoryMutation.isPending} data-testid="button-create-category">{createCategoryMutation.isPending ? "Creating..." : "Create Category"}</Button>
              </div>
            </form>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.icon}</div>
                </div>
                <div className="w-32">
                  <Label htmlFor={`alloc-${category.id}`} className="sr-only">Allocation</Label>
                  <Input
                    id={`alloc-${category.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={localAlloc[category.id]?.allocatedAmount ?? "0"}
                    onChange={(e) => handleChange(category.id, e.target.value)}
                    data-testid={`input-alloc-${category.id}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
            <Button type="button" className="flex-1" onClick={handleSave}>Save Allocations</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
