// importing from react
import { useEffect, useState } from "react";

// importing shadcn components
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// importing components
import { NavMain } from "@/components/sidebar/nav-main";

// importing constants and types
import { SidebarItemsType } from "@/lib/types";

// importing session
import { NavMenu } from "../navbar/nav-menu";
import { getAndSetSidebar } from "@/lib/utils";
import { NavSearch } from "./nav-search";

export function AppSidebar() {
    const [sidebar, setSidebar] = useState<SidebarItemsType[]>([]);

    useEffect(() => {
        async function fetchSidebar() {
            const data = await getAndSetSidebar();
            if (data && data.length > 0) {
                setSidebar(data);
            }
        }
        fetchSidebar();
    }, []);

    return (
        <Sidebar
            variant="inset"
            className="border-none bg-sidebar text-sidebar-foreground"
        >
            <SidebarHeader className="bg-sidebar">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <NavMenu />
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <NavSearch
                        sidebar={sidebar}
                    />
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent
                className="flex flex-col justify-between py-0 bg-sidebar"
            >
                <NavMain
                    sidebar={sidebar}
                />
            </SidebarContent>
        </Sidebar>
    )
}
