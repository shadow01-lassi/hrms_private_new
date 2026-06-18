import React from "react";
import { useBanner } from "@/contexts/banner-context";
import { X, Info, AlertTriangle, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const GlobalBanner: React.FC = () => {
    const { currentBanner, hideBanner } = useBanner();

    if (!currentBanner) return null;

    const { type = "info", title, actionText, onAction } = currentBanner;

    let Icon = Info;
    let bgColorClass = "bg-[#0b1f42]"; // fallback default
    let iconColorClass = "text-blue-400";

    switch (type) {
        case "warning":
            Icon = AlertTriangle;
            bgColorClass = "bg-amber-950";
            iconColorClass = "text-amber-400";
            break;
        case "error":
            Icon = AlertCircle;
            bgColorClass = "bg-red-950";
            iconColorClass = "text-red-400";
            break;
        case "update":
            Icon = RefreshCw;
            bgColorClass = "bg-[#091a38]";
            iconColorClass = "text-blue-400";
            break;
        case "success":
            Icon = CheckCircle2;
            bgColorClass = "bg-emerald-950";
            iconColorClass = "text-emerald-400";
            break;
        case "info":
        default:
            Icon = Info;
            bgColorClass = "bg-[#091a38]"; // dark blue like screenshot
            iconColorClass = "text-blue-400";
            break;
    }

    return (
        <div className={cn("w-full flex items-center px-4 py-2 shrink-0 transition-all shadow-sm", bgColorClass)}>
            <div className="flex-1 flex items-center gap-3">
                <Icon className={cn("w-5 h-5", iconColorClass)} />
                <p className="text-sm font-medium text-slate-200">
                    {title}
                </p>
            </div>
            
            <div className="flex items-center gap-3 pl-4">
                {actionText && (
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-8 bg-white/10 hover:bg-white/20 text-white border-0 shadow-none px-4 rounded"
                        onClick={() => {
                            if (onAction) onAction();
                            hideBanner();
                        }}
                    >
                        {actionText}
                    </Button>
                )}
                
                <button 
                    onClick={hideBanner} 
                    className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close banner"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
