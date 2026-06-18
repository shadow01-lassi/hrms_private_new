import React from "react";
import { ShieldAlert, Mail, Phone } from "lucide-react";
import { CompanyMasterShortType } from "@/lib/types";

interface AccountDeactivatedProps {
    company: CompanyMasterShortType;
}

export const AccountDeactivated: React.FC<AccountDeactivatedProps> = ({ company }) => {
    return (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500 min-h-[60vh]">
            <div className="bg-destructive/10 p-6 rounded-full mb-8 ring-8 ring-destructive/5">
                <ShieldAlert className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground tracking-tight">
                {company.deactivation_reason || "Account Deactivated"}
            </h1>
            <p className="text-muted-foreground max-w-lg mb-10 text-lg leading-relaxed">
                {company.deactivation_description || "Your account has been deactivated. Please contact the administrator for more information."}
            </p>

            <div className="w-full max-w-md border-t border-border pt-10 space-y-6">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Support & Reactivation</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                        href="mailto:support@valueye.in"
                        className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-colors group"
                    >
                        <Mail className="h-6 w-6 mb-2 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">support@valueye.in</span>
                    </a>
                    <a
                        href="tel:+919876543210"
                        className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-colors group"
                    >
                        <Phone className="h-6 w-6 mb-2 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">+91 98765 43210</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
