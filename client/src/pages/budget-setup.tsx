import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { useCreateBudget } from "@/hooks/use-budget";
import { useToast } from "@/hooks/use-toast";

export default function BudgetSetup() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBudget = useCreateBudget();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monthlyIncome || parseFloat(monthlyIncome) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid monthly income",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      await createBudget.mutateAsync({
        monthlyIncome: monthlyIncome,
        month: currentMonth,
      });

      toast({
        title: "Success",
        description: "Budget created successfully!",
      });

      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="budget-setup-form">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Set Up Your Budget</CardTitle>
          <p className="text-muted-foreground">
            Enter your monthly income to get started with expense tracking
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="monthlyIncome">Monthly Income *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="monthlyIncome"
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="pl-8"
                  data-testid="input-monthly-income"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This will be used as the basis for your budget allocations
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={createBudget.isPending}
              data-testid="button-create-budget"
            >
              {createBudget.isPending ? "Creating Budget..." : "Create Budget"}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                You can always update this later in settings
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
