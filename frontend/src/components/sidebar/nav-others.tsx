// importing react
import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";

// importing shadcn components
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MenuItemType, SidebarItemsType } from "@/lib/types";
import { nestMenuData, cn } from "@/lib/utils";

// importing icons
import { Ellipsis, Loader2 } from "lucide-react";
import { DynamicIcon } from "./dynamic-icon";

// Lazy loading page components
const HelpPage = lazy(() => import("@/pages/help/help.page"));
const ReportIssuePage = lazy(() => import("@/pages/report-issue/report-issue.page"));
const FeedbackPage = lazy(() => import("@/pages/give-feedback/feedback.page"));
const KeyboardShortcutsPage = lazy(() => import("@/pages/keyboard-shortcuts/keyboard-shortcuts.page"));

export function NavOthers({ sidebar, mainSidebar }: { sidebar: SidebarItemsType[]; mainSidebar: SidebarItemsType[] }) {
    const sidebarData = nestMenuData(sidebar);
    const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const navigate = useNavigate();

    const handleItemClick = (item: MenuItemType) => {
        // If it's a parent with children, the trigger handles it.
        // If it's a leaf node, decide whether to navigate or open dialog.
        if (!item.children || item.children.length === 0) {
            if (item.mm_name === "settings") {
                navigate("/dashboard/settings");
            } else {
                setSelectedItem(item);
                setIsDialogOpen(true);
            }
        }
    };

    const renderSelectedComponent = () => {
        if (!selectedItem) return null;

        switch (selectedItem.mm_name) {
            case "help":
                return <HelpPage sidebarData={mainSidebar} />;
            case "report-issue":
                return <ReportIssuePage />;
            case "give-feedback":
                return <FeedbackPage onClose={() => setIsDialogOpen(false)} />;
            case "keyboard-shortcuts":
                return <KeyboardShortcutsPage />;
            default:
                return <div className="p-4 text-center text-muted-foreground">Content for {selectedItem.mm_label} coming soon...</div>;
        }
    };

    const renderMenuItems = (items: MenuItemType[]) => {
        return items.map((item) => {
            return (
                <DropdownMenu key={item.mm_id}>
                    <SidebarMenuItem>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                tooltip={item.mm_label}
                                onClick={() => handleItemClick(item)}
                            >
                                {item.mm_icon && <DynamicIcon name={item.mm_icon as string} className="w-4 h-4" />}
                                <span className="text-sm font-semibold">{item.mm_label}</span>
                                {item.children?.length ? <Ellipsis className="ml-auto" /> : null}
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>

                        {item.children?.length ? (
                            <DropdownMenuContent side="right" align="start" className="min-w-56 rounded-lg">
                                {item.children.map((subItem) => (
                                    <DropdownMenuItem
                                        key={subItem.mm_id}
                                        onClick={() => handleItemClick(subItem)}
                                        className="cursor-pointer"
                                    >
                                        {subItem.mm_icon && <DynamicIcon name={subItem.mm_icon as string} className="w-4 h-4" />}
                                        <span className="text-sm font-semibold">{subItem.mm_label}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        ) : null}
                    </SidebarMenuItem>
                </DropdownMenu>
            );
        });
    };

    const getDialogWidth = () => {
        if (!selectedItem) return "max-w-md";
        switch (selectedItem.mm_name) {
            case "help":
                return "max-w-[95vw] min-w-[80vw]"; // Full width for help
            case "keyboard-shortcuts":
                return "max-w-7xl min-w-3xl"; // Wide for shortcuts
            case "give-feedback":
            case "report-issue":
                return "max-w-xl min-w-[80vw]"; // Compact for forms
            default:
                return "max-w-7xl min-w-2xl";
        }
    };

    return (
        <SidebarGroup>
            <SidebarMenu>{renderMenuItems(sidebarData)}</SidebarMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className={cn(
                    "h-[85vh] flex flex-col p-0 overflow-hidden border-muted-foreground transition-all duration-300",
                    getDialogWidth()
                )}>
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-2">
                            {selectedItem?.mm_icon && <DynamicIcon name={selectedItem.mm_icon as string} className="w-4 h-4" />} {selectedItem?.mm_label}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 pt-2">
                        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}>
                            {renderSelectedComponent()}
                        </Suspense>
                    </div>
                </DialogContent>
            </Dialog>
        </SidebarGroup>
    );
}
