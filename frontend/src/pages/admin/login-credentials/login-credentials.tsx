// importing client
import api from "@/lib/api";

// importing from react
import { useState, useEffect, useMemo } from "react";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// importing components
import { ColumnConfig, JSONNewDataTable } from "@/components/tables/json-new-data-table";
import { PaginationState } from "@tanstack/react-table";

// importing constants, types and others
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";
import { UserLoginType } from "@/lib/types";

// importing icons
import { Loader2, MoreHorizontal } from "lucide-react";

export default function LoginCredentials() {
    const [data, setData] = useState<UserLoginType[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // Server-side Pagination State
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 100,
    });

    // Dialog States
    const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserLoginType | null>(null);
    const [newMobile, setNewMobile] = useState("");
    const [mobileUpdateLoading, setMobileUpdateLoading] = useState(false);

    const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
    const [passwordResetLoading, setPasswordResetLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // API expects page=1 for first page, but tanstack table uses 0-index
            const page = pagination.pageIndex + 1;
            const response = await api.get(`/user/login-credentials`, {
                params: {
                    page: page,
                    pageSize: pagination.pageSize
                }
            });

            if (response.data.type === "success") {
                setData(response.data.data.data); // Assuming structure { data: { data: [...], total_count: 123 } }
                setTotalCount(response.data.data.total_count);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch user credentials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.pageIndex, pagination.pageSize]);

    // Handlers
    const handleDeactivate = async (user: UserLoginType) => {
        try {
            // Optimistic Update could go here, but strict refetch is safer for critical data
            const response = await api.post("/user/login-credentials/deactivate", {
                user: user.ul_id,
            });
            if (response.data.type === "success") {
                toast.success("User deactivated successfully");
                fetchUsers();
            } else {
                toast.error(response.data.message || "Failed to deactivate");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    const handleReactivate = async (user: UserLoginType) => {
        try {
            const response = await api.post("/user/login-credentials/reactivate", {
                user: user.ul_id,
            });
            if (response.data.type === "success") {
                toast.success("User reactivated successfully");
                fetchUsers();
            } else {
                toast.error(response.data.message || "Failed to reactivate");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    const handleUpdateMobile = async () => {
        if (!selectedUser || !newMobile) return;
        setMobileUpdateLoading(true);
        try {
            const response = await api.put("/user/login-credentials/update-mobile", {
                userId: selectedUser.ul_id,
                newMobile: newMobile
            });
            if (response.data.type === "success") {
                toast.success("Mobile number updated");
                setMobileDialogOpen(false);
                fetchUsers();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update mobile");
        } finally {
            setMobileUpdateLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;
        setPasswordResetLoading(true);
        try {
            const response = await api.post("/user/login-credentials/reset-password", {
                userId: selectedUser.ul_id,
            });
            if (response.data.type === "success") {
                toast.success("Password reset to default successfully");
                setPasswordResetDialogOpen(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to reset password");
        } finally {
            setPasswordResetLoading(false);
        }
    };

    const columns: ColumnConfig[] = useMemo(() => [
        { key: "ul_flat_no", value: "Flat No", type: "text" },
        { key: "ul_name", value: "Name", type: "text" },
        { key: "ul_mobile", value: "Mobile", type: "text" },
        {
            key: "ul_access_type", value: "Access Type", type: "badge", colorMap: [
                { value: "AD", printValue: "Admin", bgColor: "#009721ff", foregroundColor: "#ffffffff" },
                { value: "US", printValue: "User", bgColor: "#ff0000ff", foregroundColor: "#ffffffff" },
                { value: "GK", printValue: "Gatekeeper", bgColor: "#fee000", foregroundColor: "#000000ff" }
            ]
        },
        {
            key: "ul_status", value: "Status", type: "badge", colorMap: [
                { value: "true", printValue: "Active", bgColor: "#009721ff", foregroundColor: "#ffffffff" },
                { value: "false", printValue: "Inactive", bgColor: "#ff0000ff", foregroundColor: "#ffffffff" }
            ]
        },
    ], []);

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="sub-heading">
                        Login Credentials
                    </h1>
                    <p className="para">Manage system users, their access, and credentials.</p>
                </div>

                <JSONNewDataTable
                    data={data}
                    setData={setData as any}
                    loading={loading}
                    setLoading={setLoading}
                    columns={columns}
                    addButtonText="New Login"
                    addButtonLink={`${APP_SIDEBAR_PARENT_LINK}/registers/login-credentials/create`}
                    editButtonLink={`${APP_SIDEBAR_PARENT_LINK}/registers/login-credentials/edit?id=`}
                    search={true}
                    master_id="ul_id"
                    customActions={[
                        {
                            id: "actions",
                            label: "Quick Actions",
                            icon: (rowData: any) => (
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="hover:bg-muted p-2 rounded-full">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {rowData.ul_status ? (
                                            <DropdownMenuItem
                                                onClick={() => handleDeactivate(rowData)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                Deactivate User
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem
                                                onClick={() => handleReactivate(rowData)}
                                                className="text-green-600 focus:text-green-600"
                                            >
                                                Reactivate User
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedUser(rowData);
                                            setPasswordResetDialogOpen(true);
                                        }}>
                                            Reset Password
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedUser(rowData);
                                            setNewMobile(rowData.ul_mobile || "");
                                            setMobileDialogOpen(true);
                                        }}>
                                            Update Phone Number
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )
                        }
                    ]}

                    // Server Side Pagination Props
                    manualPagination={true}
                    rowCount={totalCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                />
            </div>

            {/* Mobile Update Dialog */}
            <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Mobile Number</DialogTitle>
                        <DialogDescription>
                            Enter the new mobile number for {selectedUser?.ul_username}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mobile" className="text-right">
                                Mobile
                            </Label>
                            <Input
                                id="mobile"
                                value={newMobile}
                                onChange={(e) => setNewMobile(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleUpdateMobile} disabled={mobileUpdateLoading}>
                            {mobileUpdateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Reset Confirmation Dialog */}
            <Dialog open={passwordResetDialogOpen} onOpenChange={setPasswordResetDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reset the password for <strong>{selectedUser?.ul_username}</strong>?
                            <br /><br />
                            It will be reset to the default system password.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordResetDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleResetPassword} disabled={passwordResetLoading}>
                            {passwordResetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Reset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}