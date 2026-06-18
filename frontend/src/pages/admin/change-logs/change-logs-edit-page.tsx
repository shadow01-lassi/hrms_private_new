import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import api from "@/lib/api";
import { ChangeLogType } from "@/lib/types";
import { getSearchParams } from "@/lib/utils";
import { ChangeLogsForm } from "./change-logs.form";

import { usePermission } from "@/hooks/use-permissions";
import { AccessDenied } from "@/components/prompts/access-denied";

export default function ChangeLogsEditPage() {
    const editPermission = usePermission("changelog.update");
    const [changeLog, setChangeLog] = useState<ChangeLogType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = getSearchParams();
    const id = params.get("id");

    useEffect(() => {
        if (!id) return;
        fetchChangeLog();
    }, [id]);

    const fetchChangeLog = async () => {
        try {
            if (!editPermission) {
                toast.error("You do not have permission to edit change logs");
                return;
            }

            const res = await api.get(`/open/change-log/${id}`);
            if (res.data.type === "success") {
                setChangeLog(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load change log");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!changeLog) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold">Change Log Not Found</h2>
                <p className="text-muted-foreground">The requested change log could not be located.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <h1 className="heading">Edit Change Log [#{id}]</h1>
            {editPermission ? (
                <ChangeLogsForm
                    mode="edit"
                    initialData={changeLog}
                />
            ) : (
                <AccessDenied />
            )}
        </div>
    );
}
