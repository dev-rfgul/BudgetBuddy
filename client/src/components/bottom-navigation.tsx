import { Link, useLocation } from "wouter";
import { BarChart3, Plus, Settings, Clipboard } from "lucide-react";

interface BottomNavigationProps {
  onAddExpenseClick: () => void;
}

export default function BottomNavigation({ onAddExpenseClick }: BottomNavigationProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border" data-testid="bottom-navigation">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          <Link href="/">
            <button 
              className={`flex flex-col items-center space-y-1 py-2 px-4 ${
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              } transition-colors`}
              data-testid="nav-dashboard"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>
          </Link>
          
          <button 
            className="flex flex-col items-center space-y-1 py-2 px-4 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="nav-transactions"
          >
            <Clipboard className="w-5 h-5" />
            <span className="text-xs font-medium">Transactions</span>
          </button>
          
          <button 
            onClick={onAddExpenseClick}
            className="flex flex-col items-center space-y-1 py-2 px-4 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="nav-add-expense"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium">Add</span>
          </button>
          
          <Link href="/analytics">
            <button 
              className={`flex flex-col items-center space-y-1 py-2 px-4 ${
                isActive("/analytics") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              } transition-colors`}
              data-testid="nav-analytics"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-medium">Analytics</span>
            </button>
          </Link>
          
          <button 
            className="flex flex-col items-center space-y-1 py-2 px-4 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="nav-budget"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Budget</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
