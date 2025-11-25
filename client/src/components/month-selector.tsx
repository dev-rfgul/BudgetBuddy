import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, subMonths, addMonths } from "date-fns";
import { useAvailableMonths } from "@/hooks/use-budget";

interface MonthSelectorProps {
    currentMonth: string;
    onMonthChange: (month: string) => void;
    className?: string;
}

export default function MonthSelector({ currentMonth, onMonthChange, className = "" }: MonthSelectorProps) {
    const { data: availableMonths = [] } = useAvailableMonths();

    // Ensure current month is in the list if it's not already
    const months = [...availableMonths];
    if (!months.find(m => m.month === currentMonth)) {
        // This might happen if we're viewing a future month or a very old month not in the recent list
        // For now, we'll just rely on the available months from the DB
    }

    const handlePrevious = () => {
        const date = parseISO(currentMonth + "-01");
        const prevMonth = format(subMonths(date, 1), "yyyy-MM");
        onMonthChange(prevMonth);
    };

    const handleNext = () => {
        const date = parseISO(currentMonth + "-01");
        const nextMonth = format(addMonths(date, 1), "yyyy-MM");

        // Only allow going to next month if it exists in DB or is the current real-time month
        const realCurrentMonth = new Date().toISOString().slice(0, 7);
        if (nextMonth <= realCurrentMonth) {
            onMonthChange(nextMonth);
        }
    };

    const isNextDisabled = () => {
        const date = parseISO(currentMonth + "-01");
        const nextMonth = format(addMonths(date, 1), "yyyy-MM");
        const realCurrentMonth = new Date().toISOString().slice(0, 7);
        return nextMonth > realCurrentMonth;
    };

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="h-8 w-8"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select value={currentMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Select month">
                        {format(parseISO(currentMonth + "-01"), "MMMM yyyy")}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {availableMonths.map((budget) => (
                        <SelectItem key={budget.id} value={budget.month}>
                            {format(parseISO(budget.month + "-01"), "MMMM yyyy")}
                        </SelectItem>
                    ))}
                    {/* Always ensure current real-time month is an option if not in the list */}
                    {!availableMonths.find(m => m.month === new Date().toISOString().slice(0, 7)) && (
                        <SelectItem value={new Date().toISOString().slice(0, 7)}>
                            {format(new Date(), "MMMM yyyy")}
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="h-8 w-8"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
