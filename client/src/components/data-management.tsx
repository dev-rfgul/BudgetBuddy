import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { storageService } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Loader2 } from "lucide-react";

export default function DataManagement() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const json = await storageService.exportData();
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `budget-buddy-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: "Your data has been downloaded.",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Could not export data.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const text = await file.text();
            await storageService.importData(text);

            toast({
                title: "Import Successful",
                description: "Your data has been restored. Reloading...",
            });

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            toast({
                title: "Import Failed",
                description: "Invalid backup file or import error.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            // Reset input
            event.target.value = '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Backup or restore your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                    <Button onClick={handleExport} disabled={loading} variant="outline" className="w-full justify-start">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Export Data
                    </Button>

                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={loading}
                        />
                        <Button disabled={loading} variant="outline" className="w-full justify-start">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Import Data
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
