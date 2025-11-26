import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModeToggle } from "@/components/mode-toggle";
import DataManagement from "@/components/data-management";
import BottomNavigation from "@/components/bottom-navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const CURRENCIES = [
    { code: "PKR", symbol: "PKR", name: "Pakistani Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export default function Settings() {
    const { data: settings } = useSettings();
    const updateSettings = useUpdateSettings();

    const handleCurrencyChange = (value: string) => {
        updateSettings.mutate({ currency: value });
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-card border-b border-border sticky top-0 z-40">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/">
                        <ArrowLeft className="w-6 h-6 cursor-pointer" />
                    </Link>
                    <h1 className="font-semibold text-lg">Settings</h1>
                </div>
            </header>

            <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>Customize your experience</CardDescription>
                        </div>
                        <ModeToggle />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select
                                value={settings?.currency || "PKR"}
                                onValueChange={handleCurrencyChange}
                            >
                                <SelectTrigger id="currency">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map((c) => (
                                        <SelectItem key={c.code} value={c.code}>
                                            {c.name} ({c.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <DataManagement />
            </div>

            <BottomNavigation />
        </div>
    );
}
