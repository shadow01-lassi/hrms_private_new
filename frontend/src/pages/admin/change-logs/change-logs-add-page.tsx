import { ChangeLogsForm } from "./change-logs.form";

import { usePermission } from "@/hooks/use-permissions";
import { AccessDenied } from "@/components/prompts/access-denied";

export default function ChangeLogsAddPage() {
    const createPermission = usePermission("changelog.create");

    return (
        <div className="container mx-auto py-10 space-y-6">
            <h1 className="heading">Add New Change Log</h1>
            {createPermission ? (
                <ChangeLogsForm mode="add" />
            ) : (
                <AccessDenied />
            )}
        </div>
    );
}
