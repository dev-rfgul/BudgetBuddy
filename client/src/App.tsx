import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InstallButton from "./components/install-button";
import Dashboard from "@/pages/dashboard";
import BudgetSetup from "@/pages/budget-setup";
import ManageBudget from "@/pages/manage-budget";
import Transactions from "@/pages/transactions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/budget-setup" component={BudgetSetup} />
      <Route path="/manage-budget" component={ManageBudget} />
      <Route path="/transactions" component={Transactions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div style={{display:'flex',gap:12,alignItems:'center',justifyContent:'flex-end',padding:8}}>
          <InstallButton />
        </div>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
