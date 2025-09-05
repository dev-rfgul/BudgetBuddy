import { Card, CardContent } from "@/components/ui/card";
import { type CategoryWithAllocation } from "@shared/schema";
import { ShoppingCart, Car, FileText, Zap, Smile } from "lucide-react";

interface CategoryTileProps {
  category: CategoryWithAllocation;
}

const iconMap = {
  "shopping-cart": ShoppingCart,
  "car": Car,
  "file-text": FileText,
  "zap": Zap,
  "smile": Smile,
};

const colorMap = {
  "#2ECC71": "bg-green-100 text-green-600",
  "#3498DB": "bg-blue-100 text-blue-600",
  "#E74C3C": "bg-red-100 text-red-600", 
  "#F39C12": "bg-yellow-100 text-yellow-600",
  "#9B59B6": "bg-purple-100 text-purple-600",
};

export default function CategoryTile({ category }: CategoryTileProps) {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Smile;
  const iconClasses = colorMap[category.color as keyof typeof colorMap] || "bg-gray-100 text-gray-600";
  
  const spentPercentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
  const isOverspent = category.spent > category.allocated;
  
  return (
    <Card className="shadow-sm border border-border" data-testid={`category-tile-${category.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClasses}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium" data-testid={`category-name-${category.id}`}>
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground" data-testid={`category-transactions-${category.id}`}>
                {category.transactionCount} transactions
              </p>
            </div>
          </div>
          <div className="text-right">
            <p 
              className={`font-semibold ${isOverspent ? 'text-destructive' : 'text-foreground'}`}
              data-testid={`category-spent-${category.id}`}
            >
              ${category.spent.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              of <span data-testid={`category-allocated-${category.id}`}>
                PKR {category.allocated.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverspent ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            data-testid={`category-progress-${category.id}`}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm mt-2">
          <span className="text-muted-foreground">
            {Math.round(spentPercentage)}% used
          </span>
          <span 
            className={`font-medium ${
              isOverspent ? 'text-destructive' : 'text-primary'
            }`}
            data-testid={`category-remaining-${category.id}`}
          >
            {isOverspent 
              ? `PKR${Math.abs(category.remaining).toLocaleString()} over`
              : `PKR${category.remaining.toLocaleString()} left`
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
