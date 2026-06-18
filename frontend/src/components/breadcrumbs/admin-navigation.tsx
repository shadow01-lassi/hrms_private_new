// importing from react
import { useNavigate } from "react-router-dom";

// importing shadcn components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";

// importing icons
import {
    ArrowLeft,
} from "lucide-react";

// importing constants
import { SessionUserType } from "@/lib/types";
import { AvatarDropdown } from "../navbar/avatar-dropdown";
import { PageHeading } from "./page-heading";

export function AdminNavigation({
    user,
}: {
    user: SessionUserType
}) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between w-full">
            <Breadcrumb>
                <BreadcrumbList className="flex-wrap w-fit">
                    {/* BACK BUTTON */}
                    <button
                        onClick={() => { navigate(-1); }}
                        className="p-4 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    <PageHeading />

                    {/* Right-Aligned Logout Button */}
                    <BreadcrumbItem className="absolute right-10 flex gap-2">
                        <AvatarDropdown
                            username={user.name}
                            email={user.username}
                            avatar={""}
                        />
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div >
    );
}
