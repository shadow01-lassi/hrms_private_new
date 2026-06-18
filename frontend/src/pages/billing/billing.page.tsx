import { useEffect, useState } from "react";
import { getFromStorage } from "@/lib/storage";
import { CompanyMasterShortType } from "@/lib/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    Calendar,
    Clock,
    Building2,
    Receipt,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Wallet,
    Mail,
    MapPin,
    FileText,
    ArrowRight,
    Check,
    ChevronsUpDown
} from "lucide-react";
import { format } from "date-fns";
import { cn, getLabelFromName } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
    const [companies, setCompanies] = useState<CompanyMasterShortType[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyMasterShortType | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchCompanies = () => {
            const companyId = getFromStorage("company");
            const allCompanies = getFromStorage("companies") as CompanyMasterShortType[];

            if (allCompanies && allCompanies.length > 0) {
                setCompanies(allCompanies);
                // Try to find the company from storage, otherwise fallback to the first one
                const currentId = companyId ? Number(companyId) : null;
                const current = allCompanies.find(c => c.cm_id === currentId) || allCompanies[0];
                setSelectedCompany(current);
            }
        };
        fetchCompanies();
    }, []);

    const handleCompanyChange = (id: string) => {
        const company = companies.find(c => c.cm_id === Number(id));
        if (company) {
            setSelectedCompany(company);
        }
    };

    if (!selectedCompany) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in duration-1000">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="h-5 w-40 bg-muted rounded-md animate-pulse"></div>
                <div className="h-3 w-64 bg-muted rounded-md animate-pulse mt-2"></div>
            </div>
        );
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        try {
            return format(new Date(dateStr), "PPP");
        } catch (e) {
            return dateStr;
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/50";
            case "EXPIRED": return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-200/50";
            case "GRACE": return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200/50";
            default: return "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-200/50";
        }
    };

    const totalAmt = Number(selectedCompany.cs_total_amt) || 0;
    const paidAmt = Number(selectedCompany.cs_paid_amt) || 0;
    const balance = totalAmt - paidAmt;
    const paidPercentage = totalAmt > 0 ? Math.min(100, Math.round((paidAmt / totalAmt) * 100)) : 0;

    const hasSubscription = !!selectedCompany.cs_subscription_type;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 px-2 sm:px-6 lg:px-8">

            {/* HEADER & CONTEXT SWITCHER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
                <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-2">
                        <Receipt className="w-3.5 h-3.5" /> Billing Portal
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Society Billing</h1>
                    <p className="text-muted-foreground text-base">Manage your society's active plans and financial overview.</p>
                </div>

                <div className="w-full md:w-[320px] shrink-0">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Select Society Context
                    </label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full h-12 justify-between bg-background border-border/60 shadow-sm hover:bg-background/80 hover:border-primary/30 rounded-xl px-4 font-medium"
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                        <Building2 className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="font-semibold truncate">
                                        {selectedCompany.cm_name}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-(--radix-popover-trigger-width) p-0 rounded-xl" align="start">
                            <Command className="rounded-xl border shadow-md">
                                <CommandInput placeholder="Search society..." className="h-11" />
                                <CommandList className="max-h-[300px] scrollbar-hide">
                                    <CommandEmpty>No society found.</CommandEmpty>
                                    <CommandGroup>
                                        {companies.map((company) => (
                                            <CommandItem
                                                key={company.cm_id}
                                                value={company.cm_name}
                                                onSelect={() => {
                                                    handleCompanyChange(company.cm_id.toString());
                                                    setOpen(false);
                                                }}
                                                className="cursor-pointer py-3 px-4 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "font-medium",
                                                        selectedCompany.cm_id === company.cm_id ? "text-primary font-bold" : "text-foreground"
                                                    )}>
                                                        {company.cm_name}
                                                    </span>
                                                </div>
                                                {selectedCompany.cm_id === company.cm_id && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {hasSubscription ? (
                <>
                    {/* METRICS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* 1. Plan Details Card */}
                        <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group bg-linear-to-br from-background to-muted/20">
                            <div className="absolute -right-6 -top-6 text-primary/5 group-hover:text-primary/10 transition-colors duration-500">
                                <ShieldCheck className="w-32 h-32" />
                            </div>
                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Current Plan
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="relative z-10 pt-2">
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-3xl font-black text-foreground truncate capitalize">
                                        {selectedCompany.cs_subscription_type ? getLabelFromName(selectedCompany.cs_subscription_type as string).toLowerCase() : "No Plan"}
                                    </h3>
                                    <div>
                                        <Badge variant="outline" className={cn("px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full", getStatusColor(selectedCompany.cs_status))}>
                                            {selectedCompany.cs_status || "PENDING"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Billing Summary Card */}
                        <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-background">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-emerald-500" />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="pt-2">
                                <div className="space-y-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Outstanding Balance</p>
                                            <p className={cn("text-3xl font-black tracking-tight", balance > 0 ? "text-red-500" : "text-emerald-500")}>
                                                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Billed</p>
                                            <p className="text-lg font-bold text-foreground">₹{totalAmt.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            <span>Paid: ₹{paidAmt.toLocaleString('en-IN')}</span>
                                            <span>{paidPercentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000 ease-out", paidPercentage === 100 ? "bg-emerald-500" : "bg-primary")}
                                                style={{ width: `${paidPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Next Billing Card */}
                        <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-background">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    Service Period
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="pt-2">
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex flex-col items-center justify-center border border-blue-500/20 shrink-0">
                                        <span className="text-xs font-bold text-blue-600 uppercase">{selectedCompany.cs_expected_end_date ? format(new Date(selectedCompany.cs_expected_end_date), "MMM") : "-"}</span>
                                        <span className="text-lg font-black text-blue-700 dark:text-blue-400 leading-none">{selectedCompany.cs_expected_end_date ? format(new Date(selectedCompany.cs_expected_end_date), "dd") : "-"}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Expires On</p>
                                        <p className="text-xl font-bold text-foreground">{formatDate(selectedCompany.cs_expected_end_date)}</p>
                                        {selectedCompany.cs_status === "ACTIVE" && (
                                            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Subscription is running
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* BOTTOM SECTION */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

                        {/* Detailed Timeline (Left - Takes 2 cols) */}
                        <Card className="xl:col-span-2 shadow-sm border-border/50 bg-card overflow-hidden">
                            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Subscription Lifecycle
                                </CardTitle>
                                <CardDescription>Timeline of your current active service</CardDescription>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="relative border-l-2 border-muted pl-6 ml-3 space-y-8 py-2">

                                    {/* Start Date */}
                                    <div className="relative">
                                        <div className="absolute -left-[35px] top-1 w-6 h-6 bg-background border-2 border-primary rounded-full ring-4 ring-background flex items-center justify-center">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                        </div>
                                        <div className="bg-muted/30 border border-border/50 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Commencement</p>
                                            <h4 className="font-bold text-foreground text-base">Subscription Started</h4>
                                            <p className="text-sm font-medium text-muted-foreground mt-1">{formatDate(selectedCompany.cs_start_date)}</p>
                                        </div>
                                    </div>

                                    {/* End Date */}
                                    <div className="relative">
                                        <div className="absolute -left-[35px] top-1 w-6 h-6 bg-background border-2 border-blue-500 rounded-full ring-4 ring-background flex items-center justify-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        </div>
                                        <div className="bg-muted/30 border border-border/50 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Expiration</p>
                                            <h4 className="font-bold text-foreground text-base">Expected End Date</h4>
                                            <p className="text-sm font-medium text-muted-foreground mt-1">{formatDate(selectedCompany.cs_expected_end_date)}</p>
                                        </div>
                                    </div>

                                    {/* Grace Period (If Exists) */}
                                    {selectedCompany.cs_grace_start_date && (
                                        <div className="relative">
                                            <div className="absolute -left-[35px] top-1 w-6 h-6 bg-background border-2 border-amber-500 rounded-full ring-4 ring-background flex items-center justify-center">
                                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Extension</p>
                                                <h4 className="font-bold text-amber-700 dark:text-amber-500 text-base">Grace Period Applied</h4>
                                                <p className="text-sm font-medium text-amber-600/80 mt-1">
                                                    {formatDate(selectedCompany.cs_grace_start_date)} <ArrowRight className="inline w-3 h-3 mx-1" /> {formatDate(selectedCompany.cs_grace_end_date)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Society Profile (Right - Takes 3 cols) */}
                        <Card className="xl:col-span-3 shadow-sm border-border/50 bg-card overflow-hidden">
                            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Registered Billing Profile
                                </CardTitle>
                                <CardDescription>Official details used for tax and invoicing purposes</CardDescription>
                            </CardHeader>

                            <CardContent className="p-0">
                                {/* Profile Header Area */}
                                <div className="p-6 border-b border-border/40 bg-background flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shrink-0">
                                        {selectedCompany.cm_name?.charAt(0).toUpperCase() || "C"}
                                    </div>
                                    <div className="text-center sm:text-left space-y-1.5 pt-1">
                                        <h3 className="text-2xl font-bold tracking-tight text-foreground">{selectedCompany.cm_name}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                                            <MapPin className="w-4 h-4" /> Head Office / Registered Society
                                        </p>
                                    </div>
                                </div>

                                {/* Grid Data */}
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Mail className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email Address</p>
                                            <p className="font-semibold text-sm text-foreground">{selectedCompany.cm_email || "Not Provided"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">GSTIN Number</p>
                                            <p className="font-mono text-sm font-semibold text-foreground bg-muted px-2 py-0.5 rounded border inline-block">
                                                {selectedCompany.cm_gstin || "NOT PROVIDED"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">PAN Card Number</p>
                                            <p className="font-mono text-sm font-semibold text-foreground bg-muted px-2 py-0.5 rounded border inline-block">
                                                {selectedCompany.cm_pan || "NOT PROVIDED"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 md:col-span-2 pt-2 border-t border-border/40">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <MapPin className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Registered Address</p>
                                            <p className="font-medium text-sm text-foreground leading-relaxed max-w-2xl">
                                                {selectedCompany.cm_address || "No official address has been provided for this entity."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/60 rounded-3xl bg-muted/5 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldCheck className="w-10 h-10 text-primary/40" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">No Active Subscription Found</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm text-center px-6">
                        There are no subscription plans linked to <span className="font-bold text-foreground">{selectedCompany.cm_name}</span> at the moment.
                    </p>
                    <Button className="mt-8 rounded-xl font-bold px-8 h-11" variant="outline">
                        Contact Support for Setup
                    </Button>
                </div>
            )}
        </div>
    );
}