import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { JSONNewDataTable, ColumnConfig } from "@/components/tables/json-new-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Eye, CalendarDays, User, Mail, Phone, Briefcase, MapPin, Building } from "lucide-react";
import { EmployeeMasterType } from "@/lib/types";

export default function EmployeeMasterPage() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<EmployeeMasterType[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMasterType | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleRowClick = (rowData: any) => {
        const id = Number(rowData.em_id);
        const emp = employees.find(e => e.em_id === id);
        if (emp) {
            setSelectedEmployee(emp);
            setIsSheetOpen(true);
        }
    };

    const formatDateSafe = (dateStr: string | null | undefined) => {
        if (!dateStr) return "N/A";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "N/A";
            return format(d, "dd MMM yyyy");
        } catch {
            return "N/A";
        }
    };

    const tableColumns: ColumnConfig[] = [
        { key: "em_employee_id", value: "Employee ID", type: "text", className: "font-mono font-bold text-primary" },
        { key: "employee_name", value: "Employee Name", type: "text", className: "font-semibold" },
        { key: "company_name", value: "Company", type: "text" },
        { key: "em_work_email", value: "Work Email", type: "text" },
        { key: "em_mobile", value: "Mobile", type: "text" },
        { key: "em_hire_date", value: "Hire Date", type: "date" },
        {
            key: "em_status",
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
        }
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="heading">Employee Master</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => navigate("/dashboard/registers/employee-master/add")} className="gap-1 cursor-pointer w-full sm:w-auto">
                        Add Full Employee
                    </Button>
                    <Button onClick={() => navigate("/dashboard/registers/employee-master/quick-add")} variant="outline" className="gap-1 cursor-pointer w-full sm:w-auto">
                        Quick Add Employee
                    </Button>
                </div>
            </div>

            <JSONNewDataTable
                getData={{
                    api: "/master/employees",
                    apiMethod: "get",
                    params: {},
                    headers: {},
                    body: {}
                }}
                data={employees}
                setData={setEmployees as any}
                columns={tableColumns}
                customActions={customActions}
                onRowClick={handleRowClick}
                search={true}
                reload={true}
                addButtonLink=""
                addButtonText=""
                editButtonLink="/dashboard/registers/employee-master/edit/"
                master_id="em_id"
                fileName="Employee_Master"
            />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto w-[400px] sm:w-[540px] p-0">
                    <SheetHeader className="p-6 border-b bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-primary font-mono font-bold border-primary/20 bg-primary/5">
                                {selectedEmployee?.em_employee_id}
                            </Badge>
                            {selectedEmployee?.em_status ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</Badge>
                            ) : (
                                <Badge className="bg-destructive/10 text-destructive border border-destructive/20">Inactive</Badge>
                            )}
                        </div>
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <User className="w-6 h-6 text-muted-foreground" />
                            {selectedEmployee?.employee_name || `${selectedEmployee?.em_first_name} ${selectedEmployee?.em_last_name}`}
                        </SheetTitle>
                        <SheetDescription className="text-sm pt-1">
                            {selectedEmployee?.em_designation || "No Designation"}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedEmployee && (
                        <div className="p-6 space-y-6">
                            {/* Personal Details Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <User className="w-4 h-4" /> Personal Info
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-muted/10 border rounded-xl p-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground text-xs block">Gender</span>
                                        <span className="font-medium">{selectedEmployee.em_gender || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs block">Date of Birth</span>
                                        <span className="font-medium">{formatDateSafe(selectedEmployee.em_date_of_birth)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" /> Contact Info
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-muted/10 border rounded-xl p-4 text-sm">
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground text-xs block flex items-center gap-1"><Phone className="w-3 h-3" /> Mobile Number</span>
                                        <span className="font-medium">{selectedEmployee.em_mobile || "N/A"}</span>
                                    </div>
                                    <div className="col-span-2 border-t pt-2 mt-2">
                                        <span className="text-muted-foreground text-xs block flex items-center gap-1"><Mail className="w-3 h-3" /> Work Email</span>
                                        <span className="font-medium text-primary font-mono">{selectedEmployee.em_work_email || "N/A"}</span>
                                    </div>
                                    {selectedEmployee.em_personal_email && (
                                        <div className="col-span-2 border-t pt-2 mt-2">
                                            <span className="text-muted-foreground text-xs block flex items-center gap-1"><Mail className="w-3 h-3" /> Personal Email</span>
                                            <span className="font-medium font-mono">{selectedEmployee.em_personal_email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Employment Details Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" /> Employment Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-muted/10 border rounded-xl p-4 text-sm">
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground text-xs block flex items-center gap-1"><Building className="w-3 h-3" /> Company</span>
                                        <span className="font-medium">{selectedEmployee.company_name || "N/A"}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <span className="text-muted-foreground text-xs block">Hire Date</span>
                                        <span className="font-medium">{formatDateSafe(selectedEmployee.em_hire_date)}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2">
                                        <span className="text-muted-foreground text-xs block">Join Date</span>
                                        <span className="font-medium">{formatDateSafe(selectedEmployee.em_join_date)}</span>
                                    </div>
                                    <div className="col-span-2 border-t pt-2 mt-2">
                                        <span className="text-muted-foreground text-xs block">Designation</span>
                                        <span className="font-medium">{selectedEmployee.em_designation || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Address Details Section */}
                            {(selectedEmployee.em_address_line1 || selectedEmployee.em_address_line2 || selectedEmployee.em_address_line3) && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" /> Address Info
                                    </h4>
                                    <div className="bg-muted/10 border rounded-xl p-4 text-sm space-y-1">
                                        {selectedEmployee.em_address_line1 && <div className="font-medium">{selectedEmployee.em_address_line1}</div>}
                                        {selectedEmployee.em_address_line2 && <div className="text-muted-foreground">{selectedEmployee.em_address_line2}</div>}
                                        {selectedEmployee.em_address_line3 && <div className="text-muted-foreground text-xs">{selectedEmployee.em_address_line3}</div>}
                                    </div>
                                </div>
                            )}

                            {/* Audit Log Section */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Audit Log</h4>
                                <div className="space-y-2 bg-muted/10 border rounded-xl p-4 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Created Date</span>
                                        <span className="font-medium">{selectedEmployee.em_created_at ? format(new Date(selectedEmployee.em_created_at), 'dd MMM yyyy hh:mm a') : "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> Created By</span>
                                        <span className="font-medium">{selectedEmployee.em_created_by || "admin"}</span>
                                    </div>
                                    {selectedEmployee.em_update_date && (
                                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                                            <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Last Updated Date</span>
                                            <span className="font-medium">{format(new Date(selectedEmployee.em_update_date), 'dd MMM yyyy hh:mm a')}</span>
                                        </div>
                                    )}
                                    {selectedEmployee.em_update_by && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground flex items-center gap-1"><User className="w-3.5 h-3.5" /> Last Updated By</span>
                                            <span className="font-medium">{selectedEmployee.em_update_by}</span>
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
