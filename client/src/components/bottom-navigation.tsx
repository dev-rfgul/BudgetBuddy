import { Plus, Settings } from "lucide-react";

interface BottomNavigationProps {
  onAddExpenseClick: () => void;
  onManageBudgetClick?: () => void;
}

export default function BottomNavigation({ onAddExpenseClick, onManageBudgetClick }: BottomNavigationProps) {
  return (
    // Bottom navigation with only Add Expense and Settings buttons
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg" data-testid="bottom-navigation" role="navigation" aria-label="Bottom navigation">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-around py-3">
          {/* Add Expense Button */}
          <button 
            onClick={onAddExpenseClick}
            className="flex flex-col items-center space-y-1 py-2 px-6 transition-all hover:scale-105 active:scale-95"
            data-testid="nav-add-expense"
            aria-label="Add expense"
          >
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold text-foreground">Add Expense</span>
          </button>
          
          {/* Settings Button */}
          <button 
            onClick={() => onManageBudgetClick?.()}
            className="flex flex-col items-center space-y-1 py-2 px-6 transition-all hover:scale-105 active:scale-95"
            data-testid="nav-settings"
            aria-label="Settings"
          >
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <Settings className="w-7 h-7 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold text-foreground">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
