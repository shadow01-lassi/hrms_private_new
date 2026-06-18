import { useEffect, useState, Suspense } from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";

// importing components
import AuthCheckSkeleton from "../prompts/auth-check-skeleton";
import { ErrorBoundary } from "../error-boundary/error-boundary";
import { OnboardingUserType } from "@/lib/types";
import { NavigationHandler } from "../navigation-handler";
import { OfflineOverlay } from "../common/offline-banner";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

// importing constants, utilities, and others
import {
    APP_NAME,
    REDIRECT_WHEN_ONBOARD_JWT_EXPIRED
} from "@/lib/constants";
import { getOnboardingToken } from "@/lib/utils";
import { onboardlogout } from "@/lib/authentication";

// importing icons
import {
    LayoutDashboard,
    ShieldCheck,
    HelpCircle,
    Users,
    Building2,
    LogOut,
    Menu,
} from "lucide-react";

const SidebarContent = ({ companyName }: { companyName: string }) => {
    const location = useLocation();

    const navItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/onboard/dashboard" },
        // { name: "Contract Note", icon: FileText, path: "/onboard/contract-note" },
        { name: "Terms of Service", icon: ShieldCheck, path: "/onboard/terms-of-service" },
        { name: "Privacy Policy", icon: ShieldCheck, path: "/onboard/privacy-policy" },
        { name: "FAQ", icon: HelpCircle, path: "/onboard/faq" },
        { name: "Who Uses Conversational AI", icon: Users, path: "/onboard/who-uses-conversational-ai" },
    ];

    return (
        <div className="flex flex-col h-full bg-muted/20">
            <div className="p-6 flex items-center gap-3 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                    <Building2 className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-lg leading-tight tracking-tight">{APP_NAME}</h2>
                    <p className="text-xs text-muted-foreground truncate w-40">{companyName}</p>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-border/50">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={onboardlogout}
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default function OnboardingRoutes() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [companyInfo, setCompanyInfo] = useState<OnboardingUserType | null>(null);
    const companyName = companyInfo?.cm_name || "Your Society";

    useEffect(() => {
        const checkToken = async () => {
            const { payload } = await getOnboardingToken();
            if (payload && payload.cm_id && payload.cm_name && payload.cm_email) {
                setCompanyInfo(payload);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        };

        checkToken();
    }, []);

    if (isAuthenticated === null) {
        return <AuthCheckSkeleton />;
    }

    if (!isAuthenticated) {
        return <Navigate to={REDIRECT_WHEN_ONBOARD_JWT_EXPIRED} replace />;
    }

    return (
        <ErrorBoundary>
            <div className="flex min-h-screen bg-background text-foreground font-sans">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col w-64 border-r border-border/50 sticky top-0 h-screen">
                    <SidebarContent companyName={companyName} />
                </aside>

                {/* Mobile Header & Sidebar */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <header className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <span className="font-bold tracking-tight">{APP_NAME}</span>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72">
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Onboarding Navigation</SheetTitle>
                                </SheetHeader>
                                <SidebarContent companyName={companyName} />
                            </SheetContent>
                        </Sheet>
                    </header>

                    <main className="flex-1 relative overflow-y-auto">
                        <Suspense fallback={
                            <div className="flex flex-col items-center justify-center min-h-[40vh] w-full gap-4">
                                <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                                <p className="text-muted-foreground text-xs font-medium animate-pulse">Loading onboarding step...</p>
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    </main>
                </div>

                <NavigationHandler />
                <OfflineOverlay />
            </div>
        </ErrorBoundary>
    );
};