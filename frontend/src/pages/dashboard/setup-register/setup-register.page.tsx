// importing from react
import React, { useState } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";

// importing icons
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    AlertCircle,
} from "lucide-react";

// importing utilities, constants and others
import { cn, openHelpDialog } from "@/lib/utils";
import { APP_SIDEBAR_PARENT_LINK, SETUP_ROUTES } from "@/lib/constants";

// importing permissions
import { usePermission } from "@/hooks/use-permissions";

interface SetupRegisterLayoutProps {
    children?: React.ReactNode;
    category?: string;
}

export const SetupRegisterLayout = ({ children, category = "general" }: SetupRegisterLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();

    const isExpanded = !isCollapsed || isHovered;

    const filteredRoutes = category === "all"
        ? SETUP_ROUTES
        : SETUP_ROUTES.filter(route => route.category?.includes(category));

    const activeRouteName = SETUP_ROUTES.find(r => location.pathname.startsWith(r.path))?.name || "Setup Registers";

    return (
        <>
            <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-2 md:p-4 border-b bg-card shadow-sm">
                    <span className="font-semibold text-sm">{activeRouteName}</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Sidebar Overlay (Mobile) */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    onMouseEnter={() => isCollapsed && setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={cn(
                        "fixed md:relative inset-y-0 left-0 border-r z-50 transform transition-all duration-300 ease-in-out bg-card sm:bg-transparent",
                        isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
                        !isMobileMenuOpen && (isCollapsed ? (isHovered ? "w-64 absolute shadow-2xl" : "w-16") : "w-64")
                    )}
                >
                    <div className="p-2 relative h-full flex flex-col justify-between">
                        {/* Collapse Toggle Button (Desktop Only) */}
                        <button
                            onClick={() => {
                                setIsCollapsed(!isCollapsed);
                                setIsHovered(false);
                            }}
                            className="hidden md:flex absolute -right-3 top-10 h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-muted transition-colors z-50"
                        >
                            {isCollapsed && !isHovered ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                        </button>

                        <div className={cn("flex flex-col h-fit", !isExpanded && "items-center")}>
                            <h2 className={cn(
                                "text-lg font-bold tracking-tight mb-6 px-2 transition-all duration-300 whitespace-nowrap overflow-hidden",
                                !isExpanded ? "opacity-0 w-0" : "opacity-100 w-full"
                            )}>
                                {isExpanded ? "Setup Registers" : ""}
                            </h2>

                            <nav className="space-y-1 flex-1">
                                {filteredRoutes.map((route) => (
                                    usePermission(route.permission) &&
                                    <NavLink
                                        key={route.path}
                                        to={APP_SIDEBAR_PARENT_LINK + "/" + category + "/setup/" + route.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group relative",
                                            isActive
                                                ? "bg-muted text-primary shadow-md"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                            !isExpanded && "justify-center px-0 w-10 mx-auto"
                                        )}
                                        title={!isExpanded ? route.name : ""}
                                    >
                                        <div className="shrink-0">
                                            <route.icon className="w-5 h-5" />
                                        </div>
                                        <span className={cn(
                                            "transition-all duration-300 whitespace-nowrap overflow-hidden",
                                            !isExpanded ? "opacity-0 w-0" : "opacity-100 w-full"
                                        )}>
                                            {route.name}
                                        </span>
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="p-3 border-t mt-4 bg-muted/20 rounded-lg w-full">
                                <button
                                    onClick={() => openHelpDialog("Report an Issue", { title: `Request a change in ${activeRouteName}` })}
                                    className={cn(
                                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-all shadow-xs group",
                                        !isExpanded && "justify-center px-0 w-10 mx-auto"
                                    )}
                                    title={!isExpanded ? "Request a change / Report an issue" : ""}
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className={cn(
                                        "transition-all duration-300 whitespace-nowrap overflow-hidden text-left",
                                        !isExpanded ? "opacity-0 w-0" : "opacity-100 w-full"
                                    )}>
                                        Request a change
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-0 md:p-6 bg-background rounded-xl">
                    {children || <Outlet />}
                </main>
            </div>
        </>
    );
};

export default SetupRegisterLayout;