// importing from react
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// importing shadcn components
import { JSONNewDataTable } from "@/components/tables/json-new-data-table";
import { Badge } from "@/components/ui/badge";

// importing utilities
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";
import { CATEGORY_STYLES } from "@/lib/constants";

// importing icons
import { Play, X } from "lucide-react";

// importing permissions
import { usePermission } from "@/hooks/use-permissions";
import { AccessDenied } from "@/components/prompts/access-denied";


export default function Reports() {
    const viewPermission = usePermission("reports.read");
    const executePermission = usePermission("reports.execute");

    const navigate = useNavigate();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Extract unique categories and assign colors
    // const categories = useMemo(() => {
    //     const uniqueCats = Array.from(new Set(reports.map(r => r.qr_category || "Uncategorized"))).sort();
    //     return uniqueCats.map((cat, index) => ({
    //         name: cat,
    //         style: CATEGORY_STYLES[index % CATEGORY_STYLES.length]
    //     }));
    // }, [reports]);

    // Filter reports based on selected categories
    const filteredReports = useMemo(() => {
        if (selectedCategories.length === 0) return reports;
        return reports.filter(r => selectedCategories.includes(r.qr_category || "Uncategorized"));
    }, [reports, selectedCategories]);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h1 className="heading">Standard Reports</h1>

                {/* Category Filters */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-medium">Categories:</h2>
                        {CATEGORY_STYLES.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {CATEGORY_STYLES.map((cat) => {
                                    const isSelected = selectedCategories.includes(cat.value);
                                    return (
                                        <Badge
                                            key={cat.value}
                                            variant="outline"
                                            style={{ backgroundColor: cat.bgColor }}
                                            className={`cursor-pointer transition-all px-3 border-0 text-sm font-medium flex items-center gap-1.5 rounded-full text-white ${cat.bgColor}`}
                                            onClick={() => toggleCategory(cat.value)}
                                        >
                                            {cat.printValue}
                                            {isSelected && <X className="h-3 w-3" />}
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="text-xs italic text-muted-foreground">
                        You can toggle categories to filter reports.
                    </div>
                </div>
            </div>

            {viewPermission ? (
                <JSONNewDataTable
                    storageKey="reports"
                    getData={{
                        api: "/report/standard",
                        apiMethod: "get",
                        params: {},
                        headers: {},
                        body: {},
                    }}
                    data={filteredReports}
                    setData={setReports}
                    loading={loading}
                    setLoading={setLoading}
                    addButtonText=""
                    addButtonLink=""
                    editButtonLink="/"
                    reload={true}
                    search={true}
                    master_id=""
                    columns={[
                        { key: "qr_id", value: "ID", type: "text" },
                        { key: "qr_name", value: "Report Name", type: "text" },
                        { key: "qr_desc", value: "Description", type: "text" },
                        { key: "qr_category", value: "Category", type: "text" },
                        { key: "qr_type", value: "Type", type: "text" },
                        { key: "qr_category", value: "Category", type: "badge", colorMap: CATEGORY_STYLES },
                    ]}
                    customActions={[
                        {
                            id: "run",
                            label: "Run",
                            icon: executePermission ? <Play className="h-4 w-4" /> : null,
                            onClick: (row) => { if (executePermission) navigate(`${APP_SIDEBAR_PARENT_LINK}/reports/execute?id=${row.qr_id}`); }
                        }
                    ]}
                    onRowClick={(row) => { if (executePermission) navigate(`${APP_SIDEBAR_PARENT_LINK}/reports/execute?id=${row.qr_id}`); }}
                />
            ) : (
                <AccessDenied />
            )}
        </div>
    );
}