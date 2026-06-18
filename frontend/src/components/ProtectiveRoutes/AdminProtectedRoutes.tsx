import { useEffect, useRef, useState, Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";

// importing shadcn components
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";

// importing components
import { AppSidebar } from "../sidebar/app-sidebar";
import { AdminNavigation } from "../breadcrumbs/admin-navigation";
import AuthCheckSkeleton from "../prompts/auth-check-skeleton";
import { IdleTimeWrapper } from "@/components/idletimer-provider";
import { KeyboardHandlers } from "@/components/keyboard-handlers";
import { NavigationHandler } from "@/components/navigation-handler";
import { OfflineOverlay } from "@/components/common/offline-banner";
import { ErrorBoundary } from "@/components/error-boundary/error-boundary";
import { BannerProvider } from "@/contexts/banner-context";
import { GlobalBanner } from "../ui/global-banner";
import { AccountDeactivated } from "@/components/prompts/account-deactivated";

// importing utilities, storage, types and others
import { decodeJWT } from "@/lib/utils";
import { getFromStorage } from "@/lib/storage";
import {
    CompanyMasterShortType,
    SessionUserType
} from "@/lib/types";

const MOBILE_BREAKPOINT = 768;

const AdminProtectedRoutes = () => {
    const [open, setOpen] = useState(true);
    // State to track if the screen is considered "mobile"
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

    const contentRef = useRef<HTMLDivElement>(null);

    // Effect to update content width based on sidebar state and screen size
    useEffect(() => {
        if (contentRef.current) {
            let newMaxWidth = '';

            if (isMobile) {
                // On mobile, always use 96vw regardless of the sidebar's 'open' state 
                // because the sidebar is typically an overlay or off-screen.
                newMaxWidth = '96vw';
            } else {
                // On desktop/tablet, adjust width based on sidebar 'open' state
                newMaxWidth = open ? '80vw' : '94vw';
            }

            contentRef.current.style.maxWidth = newMaxWidth;
        }
    }, [open, isMobile]);

    // Effect to listen for window resize and update 'isMobile' state
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty dependency array means this runs only on mount and unmount

    const [user, setUser] = useState<SessionUserType | null>(null);
    const [currentCompany, setCurrentCompany] = useState<CompanyMasterShortType | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const handleRefreshShortcut = (e: KeyboardEvent) => {
            // Intercept Ctrl+R, Cmd+R, and F5
            if (
                ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") ||
                e.key === "F5"
            ) {
                e.preventDefault();

                // Check if any overlays (modals, dialogs, sheets) are open
                // Using broader selectors matching NavigationHandler for better detection
                const activeOverlays = document.querySelectorAll(
                    '[role="dialog"][data-state="open"], [data-radix-portal], [data-radix-popper-content-wrapper], .fixed.inset-0'
                );

                if (activeOverlays.length > 0 || document.body.hasAttribute("data-scroll-locked")) {
                    console.log(`Closing active overlays before refresh.`);
                    // Dispatch a synthetic Escape key event to close open overlays
                    const escEvent = new KeyboardEvent("keydown", {
                        key: "Escape",
                        code: "Escape",
                        keyCode: 27,
                        which: 27,
                        bubbles: true,
                        cancelable: true,
                    });

                    // Dispatch multiple times to different targets to ensure it hits Radix/Shadcn listeners
                    window.dispatchEvent(escEvent);
                    document.dispatchEvent(escEvent);
                    if (document.activeElement) document.activeElement.dispatchEvent(escEvent);

                    // Give a small delay to allow the modal closing state to propagate
                    setTimeout(() => {
                        console.log("Selective refresh triggered after modal close!");
                        setRefreshKey(prev => prev + 1);
                    }, 100);
                } else {
                    console.log("Selective refresh triggered (no overlays)!");
                    setRefreshKey(prev => prev + 1);
                }
            }
        };

        window.addEventListener("keydown", handleRefreshShortcut);
        return () => window.removeEventListener("keydown", handleRefreshShortcut);
    }, []);

    useEffect(() => {
        const checkToken = async () => {
            const session = getFromStorage("session");
            if (!session) {
                setIsAuthenticated(false);
                return;
            }

            const decodedUser = await decodeJWT(session as string);
            if (decodedUser) {
                setUser(decodedUser);

                // Fetch current company details
                const companyId = getFromStorage("company");
                const companies = getFromStorage("companies") as CompanyMasterShortType[];
                if (companyId !== null && companyId !== undefined && companies) {
                    const current = companies.find(c => c.cm_id === Number(companyId));
                    if (current) {
                        setCurrentCompany(current);
                    }
                }

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

    return isAuthenticated ? (
        <>
            <div className="bg-background/80 dark:bg-background/90">
                <ErrorBoundary>
                    <IdleTimeWrapper>
                        <BannerProvider>
                            <SidebarProvider
                                open={open}
                                onOpenChange={setOpen}
                            >
                                <AppSidebar />

                                <SidebarInset className="bg-background/80 dark:bg-background/90 backdrop-blur-xs border border-primary">
                                    <GlobalBanner />

                                    <header className="flex h-16 shrink-0 items-center gap-2">
                                        <div className="flex items-center justify-between gap-2 px-4 w-full">
                                            <div className="flex items-center gap-2">
                                                <SidebarTrigger className="-ml-1" />

                                                <Separator orientation="vertical" className="mr-2 h-4" />

                                                {user && (
                                                    <AdminNavigation
                                                        user={user}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </header>

                                    <div
                                        key={refreshKey}
                                        ref={contentRef}
                                        className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-7xl w-full mx-auto"
                                    >
                                        {currentCompany?.cm_is_deactivated ? (
                                            <AccountDeactivated company={currentCompany} />
                                        ) : (
                                            <Suspense fallback={
                                                <div className="flex flex-col items-center justify-center min-h-[40vh] w-full gap-4">
                                                    <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                                                    <p className="text-muted-foreground text-xs font-medium animate-pulse">Loading view...</p>
                                                </div>
                                            }>
                                                <Outlet />
                                            </Suspense>
                                        )}
                                    </div>

                                    <NavigationHandler />
                                    <KeyboardHandlers />
                                    <OfflineOverlay />
                                </SidebarInset>
                            </SidebarProvider>
                        </BannerProvider>
                    </IdleTimeWrapper>
                </ErrorBoundary>
            </div>
        </>
    ) : (
        <>
            <Navigate to="/login" />
        </>
    );
};

export default AdminProtectedRoutes;