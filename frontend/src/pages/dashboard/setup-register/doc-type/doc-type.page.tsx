// importing from react
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// importing components
import { JSONNewDataTable } from "@/components/tables/json-new-data-table";

// importing constants, session and more
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";

export default function DocTypePage() {
    const navigate = useNavigate();
    const [data, setData] = useState<Record<string, string | number | boolean | Date>[]>([]);

    return (
        <>
            <div className="space-y-6">
                <h1 className="heading">
                    Document Types
                </h1>

                <JSONNewDataTable
                    getData={{
                        api: "/master/doc-types",
                        apiMethod: "get",
                        headers: {},
                        params: {},
                        body: {}
                    }}
                    data={data}
                    setData={setData}
                    addButtonText={"Add"}
                    addButtonLink={`${APP_SIDEBAR_PARENT_LINK}/setup-registers/doc-types/add`}
                    editButtonLink={`${APP_SIDEBAR_PARENT_LINK}/setup-registers/doc-types/edit/`}
                    search={true}
                    reload={true}
                    master_id={"dt_id"}
                    columns={[
                        {
                            key: "dt_id",
                            value: "Id",
                            type: "text",
                        },
                        {
                            key: "dt_name",
                            value: "Document Name",
                            type: "text",
                        },
                        {
                            key: "dt_charge",
                            value: "Charge (₹)",
                            type: "text",
                        },
                        {
                            key: "dt_proof_req",
                            value: "Proof Required",
                            type: "badge",
                            colorMap: [
                                {
                                    value: "true",
                                    printValue: "Yes",
                                    bgColor: "#10b981",
                                    foregroundColor: "#ffffff"
                                },
                                {
                                    value: "false",
                                    printValue: "No",
                                    bgColor: "#ef4444",
                                    foregroundColor: "#ffffff"
                                },
                            ]
                        },
                    ]}
                    customActions={[]}
                    onRowClick={(rowData: any) => {
                        navigate(`${APP_SIDEBAR_PARENT_LINK}/setup-registers/doc-types/edit/${rowData?.dt_id}`);
                    }}
                />
            </div>
        </>
    );
}