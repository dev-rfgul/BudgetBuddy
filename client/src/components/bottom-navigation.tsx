import { Link, useLocation } from "wouter";
import { BarChart3, Plus, Settings, Clipboard } from "lucide-react";

interface BottomNavigationProps {
  onAddExpenseClick: () => void;
}

export default function BottomNavigation({ onAddExpenseClick }: BottomNavigationProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    // Mobile-only bottom navigation. Hidden on medium+ screens.
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden" data-testid="bottom-navigation" role="navigation" aria-label="Bottom navigation">
      <div className="max-w-md mx-auto px-3">
        <div className="flex items-center justify-between py-2">
          <Link href="/">
            <button
              aria-current={isActive("/") ? 'page' : undefined}
              className={`flex flex-col items-center space-y-0.5 py-2 px-3 touch-manipulation ${isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              data-testid="nav-dashboard"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-[11px] font-medium">Dashboard</span>
            </button>
          </Link>
          
          <button 
            className="flex flex-col items-center space-y-0.5 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            data-testid="nav-transactions"
            aria-label="Transactions"
          >
            <Clipboard className="w-6 h-6" />
            <span className="text-[11px] font-medium">Transactions</span>
          </button>
          
          <button 
            onClick={onAddExpenseClick}
            className="flex flex-col items-center space-y-0.5 py-1 px-2 transition-colors"
            data-testid="nav-add-expense"
            aria-label="Add expense"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-[11px] font-medium">Add</span>
          </button>
          
          <Link href="/analytics">
            <button 
              aria-current={isActive("/analytics") ? 'page' : undefined}
              className={`flex flex-col items-center space-y-0.5 py-2 px-3 ${isActive("/analytics") ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
              data-testid="nav-analytics"
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-[11px] font-medium">Analytics</span>
            </button>
          </Link>
          
          <button 
            className="flex flex-col items-center space-y-0.5 py-2 px-3 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            data-testid="nav-budget"
            aria-label="Budget"
          >
            <Settings className="w-6 h-6" />
            <span className="text-[11px] font-medium">Budget</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
