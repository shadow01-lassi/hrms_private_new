// importing utilities
import { cn } from "@/lib/utils";

// importing icons
import { EyeOff } from "lucide-react";

export function AccessDenied({ className }: { className?: string }) {
    return (
        <>
            <div className={cn("flex flex-col items-center justify-center p-12 space-y-4 border rounded-lg bg-muted/20", className)}>
                <div className="p-4 bg-destructive/10 rounded-full text-destructive">
                    <EyeOff className="h-12 w-12" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Access Denied</h3>
                    <p className="text-sm text-muted-foreground">You do not have permission to view this data.</p>
                </div>
            </div>
        </>
    );
}