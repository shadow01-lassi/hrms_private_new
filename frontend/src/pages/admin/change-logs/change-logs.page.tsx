// importing from react
import { useState } from "react";
import { format } from "date-fns";

// importing components
import { JSONNewDataTable, ColumnConfig } from "@/components/tables/json-new-data-table";

// importing shadcn components
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

// importing icons
import {
    Eye,
    CalendarDays,
    Info,
    CheckCircle2,
    Zap
} from "lucide-react";

// importing types
import { ChangeLogType } from "@/lib/types";

export default function ChangeLogsPage() {
    const [changeLogs, setChangeLogs] = useState<ChangeLogType[]>([]);
    const [selectedLog, setSelectedLog] = useState<ChangeLogType | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleRowClick = (rowData: any) => {
        const id = Number(rowData.c_id);
        const log = changeLogs.find(l => l.c_id === id);
        if (log) {
            setSelectedLog(log);
            setIsSheetOpen(true);
        }
    };

    const tableColumns: ColumnConfig[] = [
        // { key: "c_id", value: "ID", type: "text" },
        { key: "c_version", value: "Version", type: "text", className: "font-bold text-primary" },
        { key: "c_title", value: "Title", type: "text", className: "font-medium" },
        { key: "c_date", value: "Release Date", type: "date" },
    ];

    const customActions = [
        {
            id: "view",
            label: "Details",
            icon: () => <Eye className="w-4 h-4 text-primary" />,
            onClick: handleRowClick
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="heading">Change Log History</h1>
            </div>

            <JSONNewDataTable
                getData={{
                    api: "/open/change-log",
                    apiMethod: "get",
                    params: {},
                    headers: {},
                    body: {}
                }}
                data={changeLogs}
                setData={setChangeLogs as any}
                columns={tableColumns}
                customActions={customActions}
                onRowClick={handleRowClick}
                search={true}
                reload={true}
                addButtonLink="/dashboard/admin-tools/change-logs/add"
                addButtonText="Add Change Log"
                editButtonLink="/dashboard/admin-tools/change-logs/edit?id="
                master_id="c_id"
                fileName="Change_Logs"
                permissions={{
                    read: "changelog.read",
                    create: "changelog.create",
                    update: "changelog.update",
                    exportCsv: "",
                    exportExcel: "",
                    exportPdf: "",
                    exportEmail: "",
                }}
            />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto w-[400px] sm:w-[540px] p-0">
                    <SheetHeader className="p-6 border-b bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-primary font-bold border-primary/20 bg-primary/5">
                                {selectedLog?.c_version}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {selectedLog?.c_date && format(new Date(selectedLog.c_date), 'dd MMM yyyy')}
                            </span>
                        </div>
                        <SheetTitle className="text-2xl font-bold">{selectedLog?.c_title}</SheetTitle>
                        <SheetDescription className="text-sm leading-relaxed pt-2">
                            {selectedLog?.c_description}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedLog && (
                        <div className="p-6 space-y-8">
                            <Section
                                title="Improvements"
                                icon={<Zap className="w-4 h-4 text-blue-500" />}
                                items={selectedLog.c_improvements}
                                colorClass="bg-blue-50/50 border-blue-100"
                            />
                            <Section
                                title="Fixes"
                                icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                items={selectedLog.c_fixes}
                                colorClass="bg-emerald-50/50 border-emerald-100"
                            />
                            <Section
                                title="Patches"
                                icon={<Info className="w-4 h-4 text-amber-500" />}
                                items={selectedLog.c_patches}
                                colorClass="bg-amber-50/50 border-amber-100"
                            />
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    items: string[];
    colorClass: string;
}

function Section({ title, icon, items, colorClass }: SectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-4">
            <h4 className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-muted-foreground">
                {icon} {title} ({items.length})
            </h4>
            <div className={`p-4 border rounded-xl space-y-3 ${colorClass}`}>
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-sm leading-snug">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/20 shrink-0" />
                        <p className="text-foreground/80">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
