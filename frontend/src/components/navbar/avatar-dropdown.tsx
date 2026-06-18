// importing from react
import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// importing icons
import {
    LogOut,
    UserCircle,
    Settings,
    LifeBuoy,
    Shield,
    FileText,
    ChevronRight,
    Loader2,
    MessageSquare,
    AlertCircle,
    Keyboard,
    Ellipsis,
    Building,
    Receipt
} from "lucide-react";
import { fallback, cn } from "@/lib/utils";
import { getFromStorage } from "@/lib/storage";
import { logout } from "@/lib/authentication";
import { ModeToggle } from "./toggle-theme";
import { APP_NAME, APP_SIDEBAR_PARENT_LINK, APP_VERSION, THEME_TOGGLE_KEYBOARD_KEY } from "@/lib/constants";
import { SidebarItemsType } from "@/lib/types";

// Lazy loading support pages
const HelpPage = lazy(() => import("@/pages/help/help.page"));
const ReportIssuePage = lazy(() => import("@/pages/report-issue/report-issue.page"));
const FeedbackPage = lazy(() => import("@/pages/give-feedback/feedback.page"));
const KeyboardShortcutsPage = lazy(() => import("@/pages/keyboard-shortcuts/keyboard-shortcuts.page"));

const QUICK_LINKS = [
    { label: "View Profile", icon: UserCircle, path: "/dashboard/profile" },
    { label: "Society Profile", icon: Building, path: "/dashboard/society-profile" },
];

const BOTTOM_LINKS = [
    { label: "Settings", icon: Settings, path: "/dashboard/settings", type: "nav" },
    { label: "Billing & Plans", icon: Receipt, path: "/dashboard/billing-plans", type: "nav" },
    {
        label: "Help & Support",
        icon: LifeBuoy,
        type: "menu",
        items: [
            { label: "Help Center", icon: LifeBuoy, key: "help" },
            { label: "Report an Issue", icon: AlertCircle, key: "report-issue" },
            { label: "Give Feedback", icon: MessageSquare, key: "give-feedback" },
            { label: "Keyboard Shortcuts", icon: Keyboard, key: "keyboard-shortcuts" },
        ]
    },
    { label: "Privacy Policy", icon: Shield, path: "/privacy", type: "nav" },
    { label: "Terms of Usage", icon: FileText, path: "/terms", type: "nav" },
];

export function AvatarDropdown({ avatar, username, email }: { avatar: string; username: string; email: string }) {
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
    const [selectedHelpItem, setSelectedHelpItem] = useState<{ label: string; icon: any; key: string; title?: string } | null>(null);

    useEffect(() => {
        const handleOpenHelp = (e: CustomEvent) => {
            const { labelOrKey, title } = e.detail;
            const items = BOTTOM_LINKS.find(b => b.label === "Help & Support")?.items || [];
            const found = items.find(
                item => item.key === labelOrKey || item.label.toLowerCase() === labelOrKey.toLowerCase()
            );

            if (found) {
                setSelectedHelpItem({ ...found, title });
                setIsHelpDialogOpen(true);
            }
        };

        window.addEventListener("open-help-dialog", handleOpenHelp as EventListener);
        return () => window.removeEventListener("open-help-dialog", handleOpenHelp as EventListener);
    }, []);

    const handleHelpItemClick = (item: { label: string; icon: any; key: string }) => {
        setSelectedHelpItem(item);
        setIsHelpDialogOpen(true);
    };

    const renderSelectedHelpComponent = () => {
        if (!selectedHelpItem) return null;
        const storedSidebar = getFromStorage("sidebar") as { data: SidebarItemsType[] };
        const sidebarData = storedSidebar?.data || [];

        switch (selectedHelpItem.key) {
            case "help":
                return <HelpPage sidebarData={sidebarData} />;
            case "report-issue":
                return <ReportIssuePage initialTitle={selectedHelpItem.title} />;
            case "give-feedback":
                return <FeedbackPage onClose={() => setIsHelpDialogOpen(false)} />;
            case "keyboard-shortcuts":
                return <KeyboardShortcutsPage />;
            default:
                return <div className="p-4 text-center text-muted-foreground">Coming soon...</div>;
        }
    };

    const getDialogWidth = () => {
        if (!selectedHelpItem) return "max-w-md";
        switch (selectedHelpItem.key) {
            case "help":
                return "max-w-[95vw] min-w-[80vw]";
            case "keyboard-shortcuts":
                return "max-w-7xl min-w-3xl";
            case "give-feedback":
            case "report-issue":
                return "max-w-xl min-w-[80vw]";
            default:
                return "max-w-7xl min-w-2xl";
        }
    };

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-transparent">
                        <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
                            <AvatarImage src={avatar} alt={username} />
                            <AvatarFallback className="border bg-muted/50">{fallback(username)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-[320px] p-0 flex flex-col gap-0 border-l border-border/50">
                    <SheetHeader className="p-6 pb-5 text-center flex flex-col items-center bg-muted/20">
                        <Avatar className="h-16 w-16 ring-2 ring-primary/5 shadow-lg">
                            <AvatarImage src={avatar} alt={username} />
                            <AvatarFallback className="text-lg bg-muted">{fallback(username)}</AvatarFallback>
                        </Avatar>
                        <div className="mt-3 space-y-0.5">
                            <SheetTitle className="text-lg font-bold tracking-tight">{username}</SheetTitle>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">{email}</p>
                        </div>
                    </SheetHeader>

                    <Separator className="bg-border/30" />

                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
                        {/* Quick Links */}
                        <div className="space-y-2">
                            <h4 className="px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground opacity-70">Quick Access</h4>
                            <div className="grid gap-0.5">
                                {QUICK_LINKS.map((link) => (
                                    <Link
                                        key={link.label}
                                        to={link.path}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-[13px] font-medium transition-colors group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-md bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <link.icon className="h-3.5 w-3.5" />
                                            </div>
                                            <span>{link.label}</span>
                                        </div>
                                        <ChevronRight className="h-3 w-3 text-muted-foreground/20 group-hover:text-muted-foreground transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Links */}
                        <div className="space-y-2">
                            <h4 className="px-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground opacity-70">App & Support</h4>
                            <div className="grid gap-0.5">
                                {BOTTOM_LINKS.map((link) => (
                                    link.type === "nav" ? (
                                        <Link
                                            key={link.label}
                                            to={link.path!}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-[13px] font-medium transition-colors group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <link.icon className="h-3.5 w-3.5" />
                                                </div>
                                                <span>{link.label}</span>
                                            </div>
                                            <ChevronRight className="h-3 w-3 text-muted-foreground/20 group-hover:text-muted-foreground transition-colors" />
                                        </Link>
                                    ) : (
                                        <DropdownMenu key={link.label}>
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted text-[13px] font-medium transition-colors group outline-none">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            <link.icon className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span>{link.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Ellipsis className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
                                                        <ChevronRight className="h-3 w-3 text-muted-foreground/20 group-hover:text-muted-foreground transition-colors" />
                                                    </div>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="left" align="start" className="w-56 rounded-xl shadow-xl border-border/40 backdrop-blur-xl">
                                                {link.items?.map((subItem) => (
                                                    <DropdownMenuItem
                                                        key={subItem.label}
                                                        onClick={() => handleHelpItemClick(subItem)}
                                                        className="flex items-center gap-2.5 p-2 px-3 cursor-pointer focus:bg-primary/5 focus:text-primary rounded-lg transition-colors font-medium text-[13px]"
                                                    >
                                                        <subItem.icon className="h-3.5 w-3.5 opacity-70" />
                                                        {subItem.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-border/40 bg-muted/10">
                        <div className="flex justify-between items-center py-2">
                            <h1 className="text-sm font-semibold">
                                Toggle Theme
                            </h1>
                            <div className="flex items-center">
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">ALT&nbsp;</span>
                                    {THEME_TOGGLE_KEYBOARD_KEY.toUpperCase()}
                                </kbd>

                                <ModeToggle />
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={logout}
                            className="w-full justify-start h-10 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive text-sm font-bold transition-all p-2"
                        >
                            <div className="p-1.5 rounded-md bg-destructive/10 mr-3">
                                <LogOut className="h-3.5 w-3.5" />
                            </div>
                            Log out
                        </Button>

                        <div className="grid grid-cols-2 items-center w-full py-2 my-2 text-center text-sm bg-primary/10 rounded-md">
                            <div className="w-full">
                                {APP_NAME} Version {APP_VERSION}
                            </div>

                            <Link
                                to={`${APP_SIDEBAR_PARENT_LINK}/changelog`}
                                className="text-xs text-right px-4 underline text-primary"
                            >
                                View Changelog
                            </Link>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                <DialogContent className={cn(
                    "h-[85vh] flex flex-col p-0 overflow-hidden border-muted-foreground transition-all duration-300",
                    getDialogWidth()
                )}>
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-2">
                            {selectedHelpItem && <selectedHelpItem.icon className="h-5 w-5 text-primary" />}
                            {selectedHelpItem?.label}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 pt-2">
                        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
                            {renderSelectedHelpComponent()}
                        </Suspense>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}