// importing client
import api from "@/lib/api";

// importing from react
import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";
import { useSearchParams, useNavigate } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { toast } from "sonner";

// importing icons
import {
    Check,
    ChevronsUpDown,
    ArrowLeft,
    Loader2
} from "lucide-react";

// importing utilities
import { cn } from "@/lib/utils";
import { JSONDataTable } from "@/components/tables/json-data-table";
import { PaginationState } from "@tanstack/react-table"; //

interface Report {
    qr_id: number;
    qr_name: string;
    qr_desc: string;
    qr_type: string;
    qr_sql_query: string;
    [key: `qr_label${number}`]: string | null;
    [key: `qr_dt${number}`]: string | null;
    [key: `qr_lov${number}`]: string | null;
    lov_data?: any[];
}

// =================================================================================================
// COMPONENT: ExecuteReport
// Purpose: Fetches report definition by ID, renders dynamic parameter form, executes query, 
//          and displays results using both a legacy table and the new JSONDataTable.
// =================================================================================================
export default function ExecuteReport() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reportId = searchParams.get("id");

    // --- STATE MANAGEMENT ---

    // Core Report State
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reportData, setReportData] = useState<Record<string, string>[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);

    // Pagination State (Legacy/Sync)
    // We maintain 'offset' and 'noOfItem' for backward compatibility and API params.
    const [offset, setOffset] = useState(0);
    const [noOfItem, setNoOfItem] = useState(50);

    // New: JSONDataTable Pagination State
    // 'totalRows' is estimated or exact from backend to support server-side pagination.
    const [totalRows, setTotalRows] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50
    });

    const [loadingLov, _setLoadingLov] = useState<Record<number, boolean>>({});

    // Form Handling
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();

    // --- EFFECT: SYNC PAGINATION STATE ---
    // Ensures that changes in the old pagination controls (if used) invoke updates 
    // to the unified 'pagination' state object for the new table.
    useEffect(() => {
        setPagination({
            pageIndex: Math.floor(offset / noOfItem),
            pageSize: noOfItem
        });
    }, [offset, noOfItem]);

    // --- FETCH REPORT DEFINITION ---
    // Retrieves the report metadata (SQL query, parameter labels, LOV configs)
    const fetchReportDetails = async (id: string) => {
        try {
            setLoadingReport(true);
            const response = await api.get(`/report/standard`, { params: { qr_id: id } });

            if (response.data.type === "success") {
                // Process LOV data: Normalize array/object responses into standard {label, value} format
                const processedReport = {
                    ...response.data.data,
                    lov_data: response.data.data.lov_data?.map((lovArray: any) =>
                        (lovArray || []).map((item: any) => {
                            if (Array.isArray(item)) {
                                return {
                                    value: String(item[0] ?? ''),
                                    label: String(item[1] ?? item[0] ?? '')
                                };
                            }
                            return {
                                value: String(item.key ?? ''),
                                label: String(item.value ?? item.value ?? '')
                            };
                        }).filter((item: any) => item.value && item.value.trim() !== '')
                    ) || []
                };

                setSelectedReport(processedReport);
            }
        } catch (error) {
            console.error("Error fetching report details:", error);
            toast.error("Failed to load report details. Please try again.");
        } finally {
            setLoadingReport(false);
        }
    };

    useEffect(() => {
        if (reportId) {
            fetchReportDetails(reportId);
        }
    }, [reportId]);

    // --- EXECUTE REPORT ---
    // Submits the form data and pagination params to the backend to run the report query.
    const executeReport = async (data: any) => {
        if (!selectedReport) return;

        try {
            setLoading(true);

            // Sanitize data: Ensure all defined parameters have a value (default to empty string)
            const cleanedData: Record<string, string> = {};
            for (let i = 1; i <= 10; i++) {
                const labelKey = `qr_label${i}` as keyof Report;
                const paramKey = `param${i}`;

                // If the parameter is defined in the report metadata
                if (selectedReport[labelKey]) {
                    const val = data[paramKey];
                    // Use the form value if valid, otherwise defaulted to ""
                    cleanedData[paramKey] = (val !== undefined && val !== null) ? String(val) : "";
                }
            }

            const response = await api.post(`/report/standard/${selectedReport.qr_id}/execute`, {
                data: cleanedData,
                limit: noOfItem,
                offset: offset,
                id: reportId
            });

            const fetchedData = response.data.data || [];
            setReportData(fetchedData);

            // --- PAGINATION / TOTAL COUNT LOGIC ---
            // 1. If API returns a specific total count, we use it directly.
            if (response.data.count !== undefined) {
                setTotalRows(response.data.count);
            }
            // 2. Fallback: If no count is returned (common in some legacy APIs), we estimate.
            //    If we received a full page of data (fetchedData.length === pageSize), 
            //    we assume there's at least one more record to allow the 'Next' button to function.
            else {
                const currentCount = offset + fetchedData.length;
                if (fetchedData.length === noOfItem) {
                    setTotalRows(currentCount + 1); // Trick: Set count > current to enable 'Next'
                } else {
                    setTotalRows(currentCount); // reached end of data
                }
            }

        } catch (error) {
            console.error("Error executing report:", error);
            toast.error("Failed to execute report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- EFFECT: AUTO-EXECUTE ON PAGINATION CHANGE ---
    // Triggers report re-execution when page offset or size changes.
    // Checks 'reportData.length > 0' to prevent execution on initial load before manual run.
    useEffect(() => {
        if (selectedReport && Object.keys(reportData).length > 0) {
            handleSubmit(executeReport)();
        }
    }, [offset, noOfItem]);

    // --- HANDLER: JSON TABLE PAGINATION ---
    // Bridge to update local state from the JSONDataTable's onPaginationChange callback.
    const onPaginationChange = (updaterOrValue: any) => {
        const newPagination = typeof updaterOrValue === 'function'
            ? updaterOrValue(pagination)
            : updaterOrValue;

        // Update local pagination state
        setPagination(newPagination);

        // Update existing state variables (which triggers api call via the useEffect above)
        setNoOfItem(newPagination.pageSize);
        setOffset(newPagination.pageIndex * newPagination.pageSize);
    };

    // --- SEARCH / LOV STATE ---
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("")
    const [searchData, setSearchData] = useState<Record<string, string>[]>([])
    const [query, setQuery] = useState("");

    // Cache results of LOV queries to minimize API calls
    const [lovCache, setLovCache] = useState<Record<string, Record<string, string>[]>>({});

    const getTheDataFromSearch = useCallback((queryVal: string, searchVal: string) => {
        setSearchLoading(true);

        if (!searchVal && lovCache[queryVal]) {
            setSearchData(lovCache[queryVal]);
            setSearchLoading(false);
            return;
        }

        api.get("/report/get-by-query", { params: { value: searchVal, query: queryVal } }).then((res) => {
            const data = res.data.data;
            setSearchData(data);

            if (!searchVal) {
                setLovCache(prev => ({ ...prev, [queryVal]: data }));
            }
        }).catch(() => {
            toast.error("Something went wrong!");
            setSearchData([]);
        }).finally(() => {
            setSearchLoading(false);
        });
    }, [lovCache]);

    const debouncedSearch = useMemo(() => {
        return debounce((q: string, s: string) => getTheDataFromSearch(q, s), 500);
    }, [getTheDataFromSearch]);

    useEffect(() => {
        if (searchTerm.length === 0) {
            return;
        }
        debouncedSearch(query, searchTerm);
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, query, debouncedSearch]);

    const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);

    // --- RENDER PARAMETER INPUT ---
    // Dynamically renders form inputs based on the report definition.
    // Logic:
    // - Label ends with '*' -> Required field
    // - Label starts with '_' -> Searchable LOV (List of Values) handled via Popover/Command
    // - Has LOV query but no underscore -> Standard Select
    // - No LOV -> Standard Text/Number/Date Input
    const renderParameterInput = (index: number) => {
        if (!selectedReport) return null;

        const labelKey = `qr_label${index}` as keyof Report;
        const dtKey = `qr_dt${index}` as keyof Report;
        const lovKey = `qr_lov${index}` as keyof Report;

        const label = selectedReport[labelKey] as string | null;
        const dataType = selectedReport[dtKey] as string | null;
        const lov = selectedReport[lovKey] as string | null;
        const lovItems = selectedReport.lov_data?.[index - 1];

        if (!label) return null;

        const isRequired = label.endsWith("*");
        const hasUnderscorePrefix = label.startsWith("_");

        let cleanLabel = label;
        if (isRequired) cleanLabel = cleanLabel.slice(0, -1);
        if (hasUnderscorePrefix) cleanLabel = cleanLabel.slice(1);

        const inputName = `param${index}`;
        const registerOptions = { required: isRequired ? `${cleanLabel} is required` : false };

        if (lov && lovItems) {
            if (hasUnderscorePrefix) {
                return (
                    <div key={index} className="mb-4">
                        <Label className="block text-sm font-medium mb-1">
                            {cleanLabel}
                            {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        {loadingLov[index] ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Popover
                                open={openPopoverIndex === index}
                                onOpenChange={(isOpen) => {
                                    if (isOpen) {
                                        setOpenPopoverIndex(index);
                                        setQuery(lov);
                                        setSearchTerm("");
                                        if (lovCache[lov]) {
                                            setSearchData(lovCache[lov]);
                                        } else {
                                            setSearchData([]);
                                            getTheDataFromSearch(lov, "");
                                        }
                                    } else {
                                        setOpenPopoverIndex(null);
                                    }
                                }}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        {watch(inputName) ? watch(inputName)?.split("::")[1] : `Select ${cleanLabel}`}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command shouldFilter={false}>
                                        <Input
                                            placeholder={`Search ${cleanLabel}...`}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchLoading && (
                                            <div className="flex items-center justify-center p-4">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        )}
                                        {!searchLoading && searchData.length === 0 && (
                                            <CommandEmpty>No item found.</CommandEmpty>
                                        )}
                                        <CommandGroup>
                                            {searchData?.map((item: any) => (
                                                <CommandItem
                                                    key={item.key}
                                                    value={item.key}
                                                    onSelect={() => {
                                                        setValue(inputName, item.key + "::" + item.value);
                                                        setOpenPopoverIndex(null);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            watch(inputName) === item.key ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {item.value}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                        {errors[inputName] && (
                            <p className="text-sm text-destructive mt-1">{errors[inputName]?.message as string}</p>
                        )}
                    </div>
                );
            } else {
                return (
                    <div key={index} className="mb-4">
                        <Label className="block text-sm font-medium mb-1">
                            {cleanLabel}
                            {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        {loadingLov[index] ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select onValueChange={(val) => setValue(inputName, val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={`Select ${cleanLabel}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {lovItems
                                        .filter((item: any) => {
                                            if (!item) return false;
                                            const value = item.value ?? item[0];
                                            return value !== null && value !== undefined && value !== '' && String(value).trim() !== '';
                                        })
                                        .map((item: any, idx: number) => {
                                            const value = String(item.value ?? item[0] ?? `item-${idx}`);
                                            const label = String(item.label ?? item[1] ?? value);
                                            return (
                                                <SelectItem key={value} value={String(value)}>
                                                    {label}
                                                </SelectItem>
                                            );
                                        })}
                                </SelectContent>
                            </Select>
                        )}
                        {errors[inputName] && (
                            <p className="text-sm text-destructive mt-1">{errors[inputName]?.message as string}</p>
                        )}
                    </div>
                );
            }
        }

        return (
            <div key={index} className="mb-4">
                <Label className="block text-sm font-medium mb-1">
                    {cleanLabel}
                    {isRequired && <span className="text-destructive">*</span>}
                </Label>
                <Input
                    type={dataType || "text"}
                    {...register(inputName, registerOptions)}
                    placeholder={`Enter ${cleanLabel}`}
                />
                {errors[inputName] && (
                    <p className="text-sm text-destructive mt-1">{errors[inputName]?.message as string}</p>
                )}
            </div>
        );
    };

    if (loadingReport) {
        return (
            <div className="container mx-auto p-4 space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <Card>
                    <CardHeader><CardTitle>Loading Report...</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!selectedReport) {
        return (
            <div className="container mx-auto p-4 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Report not found or invalid ID.</p>
                            <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{selectedReport.qr_name}</CardTitle>
                    {selectedReport.qr_desc && (
                        <p className="text-sm text-muted-foreground">{selectedReport.qr_desc}</p>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(executeReport)}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {[...Array(10)].map((_, i) => renderParameterInput(i + 1))}
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Running Report..." : "Run Report"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* --- NEW JSON DATA TABLE IMPLEMENTATION --- */}
            {reportData && reportData.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-lg font-semibold text-primary">Report Data</Label>
                    <JSONDataTable
                        storageKey={`execute-report-${selectedReport.qr_id}`}
                        data={reportData}
                        fileName={`${selectedReport.qr_name}_${new Date().toISOString()}`}

                        // Manual Pagination Wiring
                        manualPagination={true}
                        rowCount={totalRows}
                        pagination={pagination}
                        onPaginationChange={onPaginationChange}
                    />
                    <div className="w-full h-1 bg-border my-8" />
                </div>
            )}
        </div>
    );
}