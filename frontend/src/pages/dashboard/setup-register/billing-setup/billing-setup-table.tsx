// importing client
import api from "@/lib/api";

// importing from react
import { useEffect, useState } from "react";

// importing types, utilities and others
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";
import { JSONNewDataTable } from "@/components/tables/json-new-data-table";

// importing permissions
import { usePermission } from "@/hooks/use-permissions";
import { toast } from "sonner";

export default function BillingSetupTable() {
    const readPermission = usePermission("setup.billing-head.read");

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Record<string, string | number | boolean | Date>[]>([]);
    const [_historyData, setHistoryData] = useState<Record<string, string | number | boolean | Date>[]>([]);

    async function getData() {
        try {
            if (!readPermission) {
                toast.error("You do not have permission to view this page.");
                return;
            }

            setLoading(true);

            const results = await api.get(`/billing/heads`);

            if (results.data.type === "success") {
                setData(results.data.data);
                setHistoryData(results.data.bill_head_history);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 overflow-hidden w-full">
            <div className="flex-1 min-h-0 flex flex-col gap-8">
                <div className="space-y-2">
                    <h1 className="heading shrink-0">{/*Active*/} Bill Heads</h1>
                    <p className="text-muted-foreground">Set up the heads for collection of payments in the your maintenance cycle.</p>
                </div>

                <JSONNewDataTable
                    data={data}
                    setData={setData}
                    addButtonText={"Update Bill Head"}
                    addButtonLink={`${APP_SIDEBAR_PARENT_LINK}/billings/setup/billing-setup/add-head`}
                    editButtonLink={``}
                    search={true}
                    reload={false}
                    loading={loading}
                    setLoading={setLoading}
                    master_id={"bs_bill_item"}
                    columns={[
                        { key: "bs_bill_item", value: "Bill Head", type: "text" },
                        { key: "bs_bill_item_start_date", value: "Start Date", type: "date" },
                        { key: "bs_bill_item_value", value: "Value", type: "text" },
                        {
                            key: "bs_bill_item_perc_amt", value: "Perc/Amt", type: "badge", colorMap: [
                                { value: "P", printValue: "Perc (%)", bgColor: "#90439cff", foregroundColor: "#ffffff" },
                                { value: "A", printValue: "Amt (Flat)", bgColor: "#00b3ffff", foregroundColor: "#ffffff" }
                            ]
                        },
                        { key: "bs_perc_calc_over", value: "Calc Over", type: "text" },
                        { key: "bs_remarks", value: "Remarks", type: "text" },
                        { key: "bs_create_by", value: "Created By", type: "text" },
                        { key: "bs_create_date", value: "Created Date", type: "date" },
                    ]}
                    permissions={{
                        read: "setup.billing-head.read",
                        create: "",
                        update: "",
                        delete: "",
                        exportCsv: "",
                        exportExcel: "",
                        exportPdf: "",
                        exportEmail: "",
                    }}
                />
            </div>

            {/* <div className="flex-1 min-h-0 flex flex-col gap-2">
                <h1 className="heading shrink-0">Bill Heads History</h1>
                <JSONNewDataTable
                    data={historyData}
                    setData={setHistoryData}
                    addButtonText={"Add Bill Head"}
                    addButtonLink={``}
                    editButtonLink={``}
                    search={true}
                    reload={false}
                    master_id={"bs_bill_item"}
                    columns={[
                        { key: "bs_bill_item", value: "Bill Head", type: "text" },
                        { key: "bs_bill_item_start_date", value: "Start Date", type: "date" },
                        { key: "bs_bill_item_value", value: "Value", type: "text" },
                        {
                            key: "bs_bill_item_perc_amt", value: "Perc/Amt", type: "badge", colorMap: [
                                { value: "P", printValue: "Perc (%)", bgColor: "#90439cff", foregroundColor: "#ffffff" },
                                { value: "A", printValue: "Amt (Flat)", bgColor: "#00b3ffff", foregroundColor: "#ffffff" }
                            ]
                        },
                        { key: "bs_perc_calc_over", value: "Calc Over", type: "text" },
                        { key: "bs_remarks", value: "Remarks", type: "text" },
                        { key: "bs_create_by", value: "Created By", type: "text" },
                        { key: "bs_create_date", value: "Created Date", type: "date" },
                    ]}
                    permissions={{
                        read: "setup.billing-head.read",
                        create: "",
                        update: "",
                        delete: "",
                        exportCsv: "",
                        exportExcel: "",
                        exportPdf: "",
                        exportEmail: "",
                    }}
                />
            </div> */}
        </div>
    );
}