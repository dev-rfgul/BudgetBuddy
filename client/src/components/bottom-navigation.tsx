import { Plus, Settings, Receipt } from "lucide-react";

interface BottomNavigationProps {
  onAddExpenseClick: () => void;
  onManageBudgetClick?: () => void;
  onTransactionsClick?: () => void;
}

export default function BottomNavigation({ onAddExpenseClick, onManageBudgetClick, onTransactionsClick }: BottomNavigationProps) {
  return (
    // Bottom navigation with Add Expense, Transactions, and Settings buttons
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg" data-testid="bottom-navigation" role="navigation" aria-label="Bottom navigation">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-around py-2.5">
          {/* Add Expense Button */}
          <button 
            onClick={onAddExpenseClick}
            className="flex flex-col items-center space-y-1 py-1.5 px-3 transition-all hover:scale-105 active:scale-95"
            data-testid="nav-add-expense"
            aria-label="Add expense"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-foreground">Add</span>
          </button>
          
          {/* Transactions Button */}
          <button 
            onClick={() => onTransactionsClick?.()}
            className="flex flex-col items-center space-y-1 py-1.5 px-3 transition-all hover:scale-105 active:scale-95"
            data-testid="nav-transactions"
            aria-label="Transactions"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-foreground">Transactions</span>
          </button>
          
          {/* Settings Button */}
          <button 
            onClick={() => onManageBudgetClick?.()}
            className="flex flex-col items-center space-y-1 py-1.5 px-3 transition-all hover:scale-105 active:scale-95"
            data-testid="nav-settings"
            aria-label="Settings"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-foreground">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
