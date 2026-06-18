import { useState } from "react";
import { format } from "date-fns";
import { JSONNewDataTable, ColumnConfig } from "@/components/tables/json-new-data-table";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Eye, CalendarDays, User, Building2, CreditCard, PowerOff } from "lucide-react";
import { CompanyMasterType } from "@/lib/types";

export default function CompanyMasterPage() {
    const [companies, setCompanies] = useState<CompanyMasterType[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyMasterType | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleRowClick = (rowData: any) => {
        const id = Number(rowData.cm_id);
        const comp = companies.find(c => c.cm_id === id);
        if (comp) {
            setSelectedCompany(comp);
            setIsSheetOpen(true);
        }
    };

    const tableColumns: ColumnConfig[] = [
        { key: "cm_code", value: "Company Code", type: "text", className: "font-mono font-bold text-primary" },
        { key: "cm_name", value: "Company Name", type: "text", className: "font-semibold" },
        { key: "cm_registration_no", value: "Registration No", type: "text" },
        {
            key: "cm_status",
            value: "Status",
            type: "badge",
            colorMap: [
                {
                    value: "true",
                    printValue: "Active",
                    bgColor: "rgba(16, 185, 129, 0.1)",
                    foregroundColor: "#10b981"
                },
                {
                    value: "false",
                    printValue: "Inactive",
                    bgColor: "rgba(239, 68, 68, 0.1)",
                    foregroundColor: "#ef4444"
                }
            ]
        },
        { key: "cm_create_date", value: "Created Date", type: "date" }
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
                <h1 className="heading">Company Master</h1>
            </div>

            <JSONNewDataTable
                getData={{
                    api: "/master/company-master",
                    apiMethod: "get",
                    params: {},
                    headers: {},
                    body: {}
                }}
                data={companies}
                setData={setCompanies as any}
                columns={tableColumns}
                customActions={customActions}
                onRowClick={handleRowClick}
                search={true}
                reload={true}
                addButtonLink="/dashboard/registers/company-master/add"
                addButtonText="Add Company"
                editButtonLink="/dashboard/registers/company-master/edit/"
                master_id="cm_id"
                fileName="Company_Master"
            />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto w-[400px] sm:w-[540px] p-0">
                    <SheetHeader className="p-6 border-b bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-primary font-mono font-bold border-primary/20 bg-primary/5">
                                {selectedCompany?.cm_code || `COMP-${String(selectedCompany?.cm_id).padStart(3, '0')}`}
                            </Badge>
                            {selectedCompany?.cm_status ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</Badge>
                            ) : (
                                <Badge className="bg-destructive/10 text-destructive border border-destructive/20">Inactive</Badge>
                            )}
                            {selectedCompany?.cm_is_deactivated && (
                                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                                    <PowerOff className="w-3 h-3" /> Deactivated
                                </Badge>
                            )}
                        </div>
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                            {selectedCompany?.cm_name}
                        </SheetTitle>
                        <SheetDescription className="text-sm pt-1">
                            Full Company Details and Configurations.
                        </SheetDescription>
                    </SheetHeader>

                    {selectedCompany && (
                        <div className="p-6 space-y-6">
                            {/* General Details Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">General Info</h4>
                                <div className="grid grid-cols-2 gap-4 bg-muted/10 border rounded-xl p-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground text-xs block">Registration No</span>
                                        <span className="font-medium">{selectedCompany.cm_registration_no || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs block">Company Code</span>
                                        <span className="font-medium font-mono">{selectedCompany.cm_code || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details Section */}
                            {(selectedCompany.cm_acc_name || selectedCompany.cm_acc_no || selectedCompany.cm_ifsc) && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        <CreditCard className="w-4 h-4" /> Bank Account Info
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 bg-muted/10 border rounded-xl p-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground text-xs block">Account Name</span>
                                            <span className="font-medium">{selectedCompany.cm_acc_name || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground text-xs block">Account Number</span>
                                            <span className="font-medium font-mono">{selectedCompany.cm_acc_no || "N/A"}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <span className="text-muted-foreground text-xs block">IFSC Code</span>
                                            <span className="font-medium font-mono">{selectedCompany.cm_ifsc || "N/A"}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <span className="text-muted-foreground text-xs block">Account Type</span>
                                            <span className="font-medium">{selectedCompany.cm_acc_type || "N/A"}</span>
                                        </div>
                                        <div className="col-span-2 border-t pt-2 mt-2">
                                            <span className="text-muted-foreground text-xs block">Branch Name</span>
                                            <span className="font-medium">{selectedCompany.cm_branch_name || "N/A"}</span>
                                        </div>
                                        {selectedCompany.cm_upi_id && (
                                            <div className="col-span-2 border-t pt-2 mt-2">
                                                <span className="text-muted-foreground text-xs block">UPI ID</span>
                                                <span className="font-medium font-mono text-primary">{selectedCompany.cm_upi_id}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* System Metadata Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Audit Log</h4>
                                <div className="space-y-2 bg-muted/10 border rounded-xl p-4 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Created Date</span>
                                        <span className="font-medium">{selectedCompany.cm_create_date ? format(new Date(selectedCompany.cm_create_date), 'dd MMM yyyy hh:mm a') : "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> Created By</span>
                                        <span className="font-medium">{selectedCompany.cm_create_by}</span>
                                    </div>
                                    {(selectedCompany.cm_update_date || selectedCompany.cm_last_update_date) && (
                                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                                            <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Last Updated Date</span>
                                            <span className="font-medium">{format(new Date(selectedCompany.cm_update_date || selectedCompany.cm_last_update_date!), 'dd MMM yyyy hh:mm a')}</span>
                                        </div>
                                    )}
                                    {(selectedCompany.cm_update_by || selectedCompany.cm_last_update_by) && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> Last Updated By</span>
                                            <span className="font-medium">{selectedCompany.cm_update_by || selectedCompany.cm_last_update_by}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
