// importing from next
import { Link, useLocation, matchPath } from "react-router-dom";

// importing shadcn components
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { MenuItemType, SidebarItemsType } from "@/lib/types";
import { nestMenuData, cn } from "@/lib/utils";

// importing icons
import { ChevronRight } from "lucide-react";
import { DynamicIcon } from "./dynamic-icon";

// importing constants
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";
import { useEffect, useState } from "react";

export function NavMain({ sidebar }: { sidebar: SidebarItemsType[] }) {
    const sidebarData = nestMenuData(sidebar);
    const location = useLocation();
    const { setOpenMobile } = useSidebar();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    // Helper to check if a specific item is active
    const isItemActive = (item: MenuItemType, parentPath = "") => {
        const currentItemPath = `${parentPath.toLowerCase()}/${item.mm_name.toLowerCase()}`.replace(/\/+/g, "/");
        const fullPath = (APP_SIDEBAR_PARENT_LINK + currentItemPath).replace(/\/+/g, "/");
        return matchPath({ path: fullPath, end: true }, location.pathname);
    };

    // Helper to check if any child (recursively) is active
    const hasActiveChild = (item: MenuItemType, parentPath = ""): boolean => {
        if (!item.children || item.children.length === 0) return false;
        const currentItemPath = `${parentPath.toLowerCase()}/${item.mm_name.toLowerCase()}`.replace(/\/+/g, "/");
        return item.children.some(child => {
            if (isItemActive(child, currentItemPath)) return true;
            if (child.children && child.children.length > 0) {
                return hasActiveChild(child, currentItemPath);
            }
            return false;
        });
    };

    // Auto-open parent menus when location changes
    useEffect(() => {
        const updateOpenMenus = () => {
            const newOpenMenus = { ...openMenus };
            const traverse = (items: MenuItemType[], pPath = "") => {
                items.forEach(item => {
                    const cPath = `${pPath.toLowerCase()}/${item.mm_name.toLowerCase()}`.replace(/\/+/g, "/");
                    if (hasActiveChild(item, pPath)) {
                        newOpenMenus[cPath] = true;
                    }
                    if (item.children) traverse(item.children, cPath);
                });
            };
            traverse(sidebarData);
            setOpenMenus(newOpenMenus);
        };
        updateOpenMenus();
    }, [location.pathname, sidebar]);

    const renderItemContent = (item: MenuItemType, currentPath: string, isActive: boolean, isSub: boolean) => {
        const Button = isSub ? SidebarMenuSubButton : SidebarMenuButton;

        return (
            <Button asChild isActive={isActive}
                className={cn(
                    "transition-all duration-200",
                    isActive && "bg-white! text-black! hover:bg-primary/90 font-bold shadow-sm"
                )}
            >
                <Link
                    to={{
                        pathname: APP_SIDEBAR_PARENT_LINK + currentPath,
                        search: location.search,
                        hash: location.hash,
                    }}
                    onClick={() => setOpenMobile(false)}
                    className="font-medium flex items-center gap-2"
                >
                    {item.mm_icon && <DynamicIcon name={item.mm_icon as string} className="w-4 h-4" />}
                    <span className="text-sm">{item.mm_label}</span>
                </Link>
            </Button>
        );
    };

    const renderMenuItems = (items: MenuItemType[], parentPath = "", depth = 0) => {
        return items.map((item) => {
            const currentPath = `${parentPath.toLowerCase()}/${item.mm_name.toLowerCase()}`.replace(/\/+/g, "/");
            const isActive = isItemActive(item, parentPath);
            const isParentOfActive = hasActiveChild(item, parentPath);
            const hasChildren = item.children && item.children.length > 0;
            const isSub = depth > 0;

            if (hasChildren) {
                const ItemWrapper = isSub ? SidebarMenuSubItem : SidebarMenuItem;
                const SubWrapper = SidebarMenuSub;
                const TriggerButton = isSub ? SidebarMenuSubButton : SidebarMenuButton;

                return (
                    <Collapsible
                        key={currentPath}
                        open={openMenus[currentPath]}
                        onOpenChange={(isOpen) => setOpenMenus(prev => ({ ...prev, [currentPath]: isOpen }))}
                        className="group/collapsible"
                    >
                        <ItemWrapper>
                            <CollapsibleTrigger asChild>
                                <TriggerButton
                                    {...(!isSub ? { tooltip: item.mm_label } : {})}
                                    className={cn(
                                        "transition-colors duration-200",
                                        isParentOfActive && "text-primary font-bold underline underline-offset-4 decoration-2"
                                    )}
                                >
                                    {item.mm_icon && <DynamicIcon name={item.mm_icon as string} className="w-4 h-4" />}
                                    <span className="text-sm font-medium">{item.mm_label}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </TriggerButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SubWrapper className={cn("ml-2 border-l border-background pl-2")}>
                                    {renderMenuItems(item.children!, currentPath, depth + 1)}
                                </SubWrapper>
                            </CollapsibleContent>
                        </ItemWrapper>
                    </Collapsible>
                );
            }

            const ItemWrapper = isSub ? SidebarMenuSubItem : SidebarMenuItem;
            return (
                <ItemWrapper key={currentPath}>
                    {renderItemContent(item, currentPath, !!isActive, isSub)}
                </ItemWrapper>
            );
        });
    };

    return (
        <SidebarGroup>
            <SidebarMenu className="gap-1">{renderMenuItems(sidebarData)}</SidebarMenu>
        </SidebarGroup>
    );
}
