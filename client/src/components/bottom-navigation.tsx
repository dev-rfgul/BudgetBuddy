import { Link, useLocation } from "wouter";
import { Plus, Settings, Receipt, Home, RefreshCw, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onAddExpenseClick?: () => void;
  onManageBudgetClick?: () => void;
  onTransactionsClick?: () => void;
}

export default function BottomNavigation({ onAddExpenseClick }: BottomNavigationProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50" data-testid="bottom-navigation">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-between py-2">

          <Link href="/">
            <div className={cn("flex flex-col items-center space-y-1 p-2 cursor-pointer", isActive("/") ? "text-primary" : "text-muted-foreground")}>
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-medium">Home</span>
            </div>
          </Link>

          <Link href="/recurring-expenses">
            <div className={cn("flex flex-col items-center space-y-1 p-2 cursor-pointer", isActive("/recurring-expenses") ? "text-primary" : "text-muted-foreground")}>
              <RefreshCw className="w-6 h-6" />
              <span className="text-[10px] font-medium">Recurring</span>
            </div>
          </Link>

          <div className="relative -top-6">
            <button
              onClick={onAddExpenseClick}
              className="flex flex-col items-center justify-center w-14 h-14 bg-primary rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Plus className="w-7 h-7 text-primary-foreground" />
            </button>
          </div>

          <Link href="/savings-goals">
            <div className={cn("flex flex-col items-center space-y-1 p-2 cursor-pointer", isActive("/savings-goals") ? "text-primary" : "text-muted-foreground")}>
              <Target className="w-6 h-6" />
              <span className="text-[10px] font-medium">Goals</span>
            </div>
          </Link>

          <Link href="/settings">
            <div className={cn("flex flex-col items-center space-y-1 p-2 cursor-pointer", isActive("/settings") ? "text-primary" : "text-muted-foreground")}>
              <Settings className="w-6 h-6" />
              <span className="text-[10px] font-medium">Settings</span>
            </div>
          </Link>

        </div>
      </div>
    </nav>
  );
}
