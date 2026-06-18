// importing from react
import { useState } from "react";

// importing components
import { JSONNewDataTable } from "@/components/tables/json-new-data-table";

// importing constants and session
import { RoleType } from "@/lib/types";
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";

export default function UserRolePage() {

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RoleType[]>([]);

    return (
        <div className="space-y-4">
            <h1 className="sub-heading">
                User Roles
            </h1>

            <JSONNewDataTable
                getData={{
                    api: "/role",
                    apiMethod: "get",
                    headers: {},
                    params: {},
                }}
                data={data as any}
                setData={setData as any}
                loading={loading}
                setLoading={setLoading}
                addButtonText="Create User Role"
                addButtonLink={APP_SIDEBAR_PARENT_LINK + "/admin-tools/user-roles/permissions"}
                editButtonLink={APP_SIDEBAR_PARENT_LINK + "/admin-tools/user-roles/permissions?id="}
                search={true}
                reload={true}
                master_id="rm_id"
                columns={[
                    { key: "rm_id", value: "Role Id", type: "text" },
                    { key: "rm_name", value: "Role Name", type: "text", className: "capitalize" },
                ]}
                permissions={{
                    read: "user-roles.read",
                    create: "user-roles.create",
                    update: "user-roles.update",
                    delete: "user-roles.delete",
                    exportCsv: "",
                    exportExcel: "",
                    exportPdf: "",
                    exportEmail: ""
                }}
            />
        </div>
    );
}