import React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicIconProps {
    name: string;
    className?: string;
}

export const DynamicIcon = ({ name, className }: DynamicIconProps) => {
    // If name is already a React node (for backward compatibility), return it
    if (React.isValidElement(name)) return name;
    
    const Icon = (LucideIcons as any)[name];
    if (!Icon) return <LucideIcons.HelpCircle className={cn("w-4 h-4", className)} />;
    return <Icon className={cn("w-4 h-4", className)} />;
};
