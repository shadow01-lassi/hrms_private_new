import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { JSONNewDataTable } from "@/components/tables/json-new-data-table";
import { ErrorLog } from "@/lib/types";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Terminal, User, Globe, Code, AlertTriangle, Bug, Server, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Extracted JsonViewer for better performance and clean structure
const JsonViewer = ({ data, label }: { data: any, label: string }) => {
    const [expanded, setExpanded] = useState(false);

    if (!data) return null;

    let parsed = data;
    if (typeof data === 'string') {
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            // If it's a string but not JSON, render it cleanly
            return (
                <div className="space-y-1.5 w-full">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{label}</span>
                    <div className="bg-slate-950 text-slate-300 p-3 rounded-md border text-xs font-mono w-full overflow-x-auto">
                        {data}
                    </div>
                </div>
            );
        }
    }

    if (typeof parsed === 'object' && parsed !== null) {
        if (Object.keys(parsed).length === 0) return null;

        const jsonString = JSON.stringify(parsed, null, 2);
        const isLong = jsonString.split('\n').length > 10;

        return (
            <div className="space-y-1.5 w-full flex flex-col max-w-full">
                <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{label}</span>
                <div className="relative rounded-md border bg-slate-950 flex flex-col w-full overflow-hidden shadow-sm">
                    <ScrollArea className={cn("w-full transition-all duration-300", expanded ? "max-h-[50vh]" : "max-h-[160px]")}>
                        <div className="p-4 w-max min-w-full">
                            <pre className="text-[11px] font-mono text-slate-300 leading-relaxed">
                                {jsonString}
                            </pre>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    {isLong && (
                        <div className="bg-slate-900 border-t border-slate-800 p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-7 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 uppercase tracking-wider font-semibold"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? (
                                    <><ChevronUp className="w-3 h-3 mr-1" /> View Less</>
                                ) : (
                                    <><ChevronDown className="w-3 h-3 mr-1" /> View Full Payload</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default function ErrorLogs() {
    const [data, setData] = useState<Record<string, any>[]>([]);
    const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 50,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.post("/error/all", {
                page: pagination.pageIndex,
                pageSize: pagination.pageSize,
            });
            setData(res.data.data || []);
            setTotalRows(res.data.rowCount || 0);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Failed to fetch error logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize]);

    const handleRowClick = (row: any) => {
        setSelectedError(row as ErrorLog);
        setSheetOpen(true);
    };

    return (
        <div className="p-6 space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                    <Bug className="h-6 w-6 text-destructive" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Error Logs</h1>
                    <p className="text-muted-foreground">Monitor and debug application errors and exceptions.</p>
                </div>
            </div>

            <JSONNewDataTable
                loading={loading}
                setLoading={setLoading}
                rowCount={totalRows}
                pagination={pagination}
                onPaginationChange={setPagination}
                data={data}
                setData={setData}
                columns={[
                    { key: "el_id", value: "ID", type: "text", className: "w-[80px]" },
                    {
                        key: "el_severity",
                        value: "Severity",
                        type: "badge",
                        colorMap: [
                            { value: "ERROR", bgColor: "#fee2e2", foregroundColor: "#991b1b", printValue: "ERROR" },
                            { value: "CRITICAL", bgColor: "#7f1d1d", foregroundColor: "#ffffff", printValue: "CRITICAL" },
                            { value: "WARNING", bgColor: "#fef3c7", foregroundColor: "#92400e", printValue: "WARNING" },
                            { value: "INFO", bgColor: "#e0f2fe", foregroundColor: "#075985", printValue: "INFO" },
                        ]
                    },
                    { key: "el_status_code", value: "Status", type: "number", className: "w-[100px]" },
                    { key: "el_http_method", value: "Method", type: "text", className: "w-[100px]" },
                    { key: "el_endpoint", value: "Endpoint", type: "text", className: "min-w-[200px] max-w-[200px] truncate" },
                    { key: "el_error_message", value: "Message", type: "text", className: "max-w-[300px] max-w-[400px] truncate" },
                    { key: "el_username", value: "User", type: "text" },
                    { key: "el_created_at", value: "Timestamp", type: "date" },
                ]}
                manualPagination={true}
                onRowClick={handleRowClick}
                storageKey="error-logs-table"
                fileName="error_logs"
                addButtonText=""
                addButtonLink=""
                editButtonLink=""
                search={true}
                reload={true}
                onReload={fetchData}
                master_id=""
                permissions={{
                    read: "error-logs.read",
                    create: "",
                    update: "",
                    delete: "",
                    exportCsv: "",
                    exportExcel: "",
                    exportPdf: "",
                    exportEmail: ""
                }}
            />

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-xl md:max-w-3xl overflow-y-auto bg-background p-0 border-l flex flex-col shadow-2xl">
                    {/* Header Section */}
                    <div className="bg-muted/30 border-b p-6 space-y-4 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 w-full pr-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant={selectedError?.el_severity === 'ERROR' || selectedError?.el_severity === 'CRITICAL' ? 'destructive' : 'default'} className="px-2 py-0.5 text-[10px] tracking-wider font-bold">
                                        {selectedError?.el_severity}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border">
                                        ID: {selectedError?.el_id}
                                    </span>
                                </div>
                                <SheetTitle className="text-lg font-bold text-foreground leading-tight wrap-break-word">
                                    {selectedError?.el_error_message}
                                </SheetTitle>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs bg-background p-2.5 rounded-md border shadow-sm w-max max-w-full overflow-x-auto">
                            <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className={cn(
                                "font-bold",
                                selectedError?.el_http_method === 'GET' ? 'text-blue-500' :
                                    selectedError?.el_http_method === 'POST' ? 'text-green-500' :
                                        selectedError?.el_http_method === 'PUT' ? 'text-orange-500' :
                                            selectedError?.el_http_method === 'DELETE' ? 'text-red-500' : 'text-foreground'
                            )}>
                                {selectedError?.el_http_method}
                            </span>
                            <span className="text-muted-foreground truncate">{selectedError?.el_endpoint}</span>
                        </div>
                    </div>

                    {/* Scrollable Body Content */}
                    <div className="p-6 space-y-8 pb-12">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="shadow-sm border-border/50 bg-background hover:border-border transition-colors gap-0 py-0">
                                <CardHeader className="p-4 pb-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Status Code</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-1">
                                    <span className={cn(
                                        "text-3xl font-black",
                                        selectedError?.el_status_code && selectedError.el_status_code >= 500 ? "text-destructive" : "text-amber-500"
                                    )}>
                                        {selectedError?.el_status_code}
                                    </span>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-border/50 bg-background hover:border-border transition-colors gap-0 py-0">
                                <CardHeader className="p-4 pb-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Triggered By</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-1 flex flex-col">
                                    <span className="text-lg font-bold truncate">{selectedError?.el_username || "Unknown"}</span>
                                    <span className="text-xs text-muted-foreground truncate">{selectedError?.el_platform || "N/A"}</span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground border-b pb-2">
                                <Server className="h-4 w-4 text-blue-500" />
                                Execution Context
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-muted/40 p-3 rounded-lg border">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Environment</p>
                                    <p className="text-sm font-semibold">{selectedError?.el_environment || "Production"}</p>
                                </div>
                                <div className="bg-muted/40 p-3 rounded-lg border">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Server Instance</p>
                                    <p className="text-sm font-mono truncate">{selectedError?.el_server_instance || "Unknown"}</p>
                                </div>
                                <div className="bg-muted/40 p-3 rounded-lg border">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Timestamp</p>
                                    <p className="text-sm font-medium">
                                        {selectedError?.el_created_at ? format(new Date(selectedError.el_created_at), "MMM d, yyyy HH:mm:ss") : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Request Data (JSON Viewers) */}
                        {(selectedError?.el_request_body || selectedError?.el_request_query) && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-foreground border-b pb-2">
                                    <Code className="h-4 w-4 text-emerald-500" />
                                    Request Payload
                                </h3>
                                <div className="space-y-4 w-full flex flex-col max-w-full">
                                    <JsonViewer label="Body Payload" data={selectedError?.el_request_body} />
                                    <JsonViewer label="Query Parameters" data={selectedError?.el_request_query} />
                                </div>
                            </div>
                        )}

                        {/* Stack Trace */}
                        {selectedError?.el_error_stack && (
                            <div className="space-y-3 w-full max-w-full">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-foreground border-b pb-2">
                                    <Terminal className="h-4 w-4 text-destructive" />
                                    Stack Trace
                                </h3>
                                <div className="rounded-md border bg-slate-950 shadow-sm overflow-hidden flex flex-col w-full max-w-full">
                                    <ScrollArea className="h-[350px] w-full">
                                        <div className="p-4 w-max min-w-full">
                                            <pre className="text-[11px] font-mono text-red-300 leading-relaxed whitespace-pre">
                                                {selectedError.el_error_stack}
                                            </pre>
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}