// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// importing icons
import { LogOut } from "lucide-react";
import { AvatarDropdown } from "../navbar/avatar-dropdown";
import { logout } from "@/lib/authentication";

export function NavUser({ name, userId, flat_no }: { name: string, userId: string, flat_no: string; avatar: string }) {
    return (
        <SidebarMenu>
            <SidebarMenuItem className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AvatarDropdown
                        avatar=""
                        username={userId}
                        email={name}
                    />

                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                            {name}
                        </span>
                        <span className="truncate text-xs">
                            {userId} - ({flat_no})
                        </span>
                    </div>
                </div>

                <Button
                    onClick={logout}
                    variant={"ghost"}
                    size={"icon"}
                >
                    <LogOut />
                </Button>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
