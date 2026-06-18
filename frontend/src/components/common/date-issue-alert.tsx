import { AlertCircle, Settings2 } from "lucide-react";
import { isStandardDateFormat } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function DateIssueAlert() {
    const [isStandardDate, setIsStandardDate] = useState(true);

    useEffect(() => {
        setIsStandardDate(isStandardDateFormat());
    }, []);

    if (isStandardDate) return null;

    return (
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive mb-4 animate-in fade-in slide-in-from-top-1 duration-500">
            <div className="flex items-center gap-2.5 overflow-hidden">
                <AlertCircle className="h-4 w-4 shrink-0 opacity-80" />
                <p className="text-[13px] font-medium truncate">
                    Confusing date format (MM-DD-YYYY) detected. Use <strong>DD-MM-YYYY</strong> for accuracy.
                </p>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[12px] hover:bg-destructive/10 hover:text-destructive font-bold shrink-0 transition-all active:scale-95"
                    >
                        <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                        Fix Now
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Fixing Date Format</DialogTitle>
                        <DialogDescription>
                            Your system region settings determine how dates are shown in the browser.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">Windows</span>
                                Regional Settings
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Go to <strong>Settings &gt; Time & Language &gt; Language & Region</strong>.
                                Set "Regional format" to <strong>English (India)</strong> or <strong>English (United Kingdom)</strong>.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">macOS</span>
                                Language & Region
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Go to <strong>System Settings &gt; General &gt; Language & Region</strong>.
                                Set "Region" to <strong>India</strong> or <strong>United Kingdom</strong>.
                            </p>
                        </div>
                        <div className="pt-4 border-t text-xs text-muted-foreground italic">
                            * After changing settings, please restart your browser for the changes to take effect.
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
