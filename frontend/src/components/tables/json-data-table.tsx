import React, { useEffect, useMemo, useRef, useState, CSSProperties } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    GroupingState,
    getGroupedRowModel,
    getExpandedRowModel,
    ColumnPinningState,
    FilterFn,
    Column,
    RowSelectionState,
    PaginationState,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { format } from "date-fns";


// --- SHADCN IMPORTS ---
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// --- ICONS ---
import {
    ArrowDownAZ,
    ArrowUpAZ,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FileSpreadsheet,
    ListFilter,
    Minus,
    Pen,
    Plus,
    Search,
    X,
    HelpCircle,
    Keyboard,
} from "lucide-react";

// --- UTILS ---
import { cn, formatDateReverse } from "@/lib/utils";
import { isMac } from "@/lib/env";

// ==========================================
// 1. HELPERS & FORMATTERS
// ==========================================

const formatTo12Hour = (timeStr: string) => {
    if (!timeStr) return "-";
    try {
        const [hoursStr, minutesStr] = timeStr.split(":");
        const hours = parseInt(hoursStr, 10);
        if (isNaN(hours)) return timeStr;
        const suffix = hours >= 12 ? "PM" : "AM";
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutesStr} ${suffix}`;
    } catch (e) {
        return timeStr;
    }
};

const formatDateTimeString = (dateVal: string | Date) => {
    if (!dateVal) return "-";
    try {
        const dateObj = new Date(dateVal);
        if (isNaN(dateObj.getTime())) return String(dateVal);

        const datePart = formatDateReverse(dateObj);
        const timePart = dateObj.toLocaleTimeString("en-IN", {
            hour: 'numeric', minute: '2-digit', hour12: true
        });
        return `${datePart} ${timePart}`;
    } catch (e) {
        return String(dateVal);
    }
};

const getCommonPinningStyles = (column: Column<any, any>): CSSProperties => {
    const isPinned = column.getIsPinned();
    const isLastLeft = isPinned === "left" && column.getIsLastColumn("left");
    const isFirstRight = isPinned === "right" && column.getIsFirstColumn("right");

    return {
        boxShadow: isLastLeft
            ? "-4px 0 4px -4px hsl(var(--border)) inset"
            : isFirstRight
                ? "4px 0 4px -4px hsl(var(--border)) inset"
                : undefined,
        left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
        right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
        opacity: 1,
        position: isPinned ? "sticky" : "relative",
        width: column.getSize(),
        zIndex: isPinned ? 10 : 0,
    };
};

// ==========================================
// 2. TYPES
// ==========================================

type RowData = Record<string, any>;

interface FilterCondition {
    operator: string;
    value: string | number | [number, number] | [Date, Date] | boolean;
    type: "condition";
}

interface FilterValues {
    selected: Set<string>;
    type: "values";
}

interface CustomColumnFilterValue {
    condition?: FilterCondition;
    values?: FilterValues;
}

interface InternalColumnConfig {
    key: string;
    value: string;
    type: "text" | "number" | "boolean" | "date" | "datetime" | "time";
}

interface JSONDataTableProps {
    data: RowData[];
    className?: string;
    addButtonText?: string;
    addButtonLink?: string;
    editButtonLink?: string;
    master_id?: string;
    columns?: Record<string, string>;
    fileName?: string;
    storageKey?: string;
    defaultGrouping?: string[];
    dropdown?: boolean;
    renderDropdownContent?: (rowData: RowData, rowIndex: number) => React.ReactNode;
    onRowClick?: (rowData: RowData, rowIndex: number) => void;

    // --- NEW SERVER-SIDE / MANUAL CONTROL PROPS ---

    // If true, pagination logic is handled externally (table won't slice data)
    manualPagination?: boolean;

    // Total number of rows in the database (required for manual pagination to calculate page count)
    rowCount?: number;

    // The current pagination state (if controlled by parent)
    pagination?: PaginationState;

    // Callback when page index or page size changes
    onPaginationChange?: (pagination: PaginationState) => void;

    // Callback when global search changes
    onSearchChange?: (term: string) => void;

    // Default page size for pagination
    defaultPageSize?: number;
}

// ==========================================
// 3. SUB-COMPONENTS (FILTERS)
// ==========================================
// (Kept exactly the same as previous version for brevity - insert NumberConditionFilter, TextConditionFilter, ValuesListFilter, TableColumnHeader here)

const NumberConditionFilter = ({ currentCondition, onApply, onClear }: {
    currentCondition?: FilterCondition,
    onApply: (c: FilterCondition) => void,
    onClear: () => void
}) => {
    const [operator, setOperator] = useState(currentCondition?.operator || "equals");
    const [value1, setValue1] = useState<string>(currentCondition?.value ? String(typeof currentCondition.value === "object" ? currentCondition.value[0] : currentCondition.value) : "");
    const [value2, setValue2] = useState<string>(currentCondition?.value && Array.isArray(currentCondition.value) ? String(currentCondition.value[1]) : "");

    const handleApply = () => {
        if (operator === "between") {
            const num1 = parseFloat(value1);
            const num2 = parseFloat(value2);
            if (!isNaN(num1) && !isNaN(num2)) onApply({ operator, value: [num1, num2], type: "condition" });
        } else if (value1) {
            const numValue = parseFloat(value1);
            if (!isNaN(numValue)) onApply({ operator, value: numValue, type: "condition" });
        }
    };

    return (
        <div className="space-y-2 p-1">
            <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="greater">Greater than</SelectItem>
                    <SelectItem value="less">Less than</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                </SelectContent>
            </Select>
            {operator === "between" ? (
                <div className="flex gap-2">
                    <Input type="number" placeholder="From" className="h-8 text-sm" value={value1} onChange={(e) => setValue1(e.target.value)} />
                    <Input type="number" placeholder="To" className="h-8 text-sm" value={value2} onChange={(e) => setValue2(e.target.value)} />
                </div>
            ) : (
                <Input type="number" placeholder="Value" className="h-8 text-sm" value={value1} onChange={(e) => setValue1(e.target.value)} />
            )}
            <div className="flex gap-2 pt-2">
                {currentCondition && <Button variant="outline" size="sm" className="h-8 flex-1" onClick={onClear}>Clear</Button>}
                <Button size="sm" className="h-8 flex-1" onClick={handleApply}>Apply</Button>
            </div>
        </div>
    );
};

const TextConditionFilter = ({ currentCondition, onApply, onClear }: {
    currentCondition?: FilterCondition,
    onApply: (c: FilterCondition) => void,
    onClear: () => void
}) => {
    const [operator, setOperator] = useState<string>(currentCondition?.operator || "contains");
    const [value, setValue] = useState<string>(currentCondition?.value ? String(currentCondition.value) : "");

    return (
        <div className="space-y-2 p-1">
            <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="startsWith">Starts with</SelectItem>
                    <SelectItem value="endsWith">Ends with</SelectItem>
                </SelectContent>
            </Select>
            <Input placeholder="Text" className="h-8 text-sm" value={value} onChange={(e) => setValue(e.target.value)} />
            <div className="flex gap-2 pt-2">
                {currentCondition && <Button variant="outline" size="sm" className="h-8 flex-1" onClick={onClear}>Clear</Button>}
                <Button size="sm" className="h-8 flex-1" onClick={() => value.trim() && onApply({ operator, value, type: "condition" })}>Apply</Button>
            </div>
        </div>
    );
};

const ValuesListFilter = ({ columnId, data, selectedValues, onSelectionChange, columnType }: {
    columnId: string,
    data: RowData[],
    selectedValues: Set<string>,
    onSelectionChange: (s: Set<string>) => void,
    columnType: string
}) => {
    const [search, setSearch] = useState("");

    const uniqueValues = useMemo(() => {
        const values = data.map((row) => row[columnId]).filter((v) => v != null && v !== "").map(String);
        return Array.from(new Set(values)).sort();
    }, [data, columnId]);

    const filteredValues = useMemo(() => uniqueValues.filter(v => v.toLowerCase().includes(search.toLowerCase())), [uniqueValues, search]);

    const handleToggle = (val: string, checked: boolean) => {
        const newSet = new Set(selectedValues);
        if (checked) {
            newSet.add(val);
        } else {
            newSet.delete(val);
        }
        onSelectionChange(newSet);
    };

    return (
        <div className="p-1">
            <Input placeholder="Search..." className="h-8 text-sm mb-2" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                {filteredValues.map((val, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                        <Checkbox id={`${columnId}-${idx}`} checked={selectedValues.has(val)} onCheckedChange={(c) => handleToggle(val, c as boolean)} />
                        <label htmlFor={`${columnId}-${idx}`} className="text-xs truncate flex-1 cursor-pointer">
                            {columnType === 'date' ? formatDateReverse(new Date(val)) : val}
                        </label>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSelectionChange(new Set(filteredValues))}>Select All</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSelectionChange(new Set())}>Clear</Button>
            </div>
        </div>
    );
};

const TableColumnHeader = ({ column, config, data }: { column: Column<any, any>; config: InternalColumnConfig; data: RowData[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const filterValue = column.getFilterValue() as CustomColumnFilterValue | undefined;
    const hasActiveFilter = !!filterValue?.condition || (filterValue?.values?.selected && filterValue.values.selected.size > 0);

    const setCondition = (condition: FilterCondition | undefined) => column.setFilterValue((old: any) => ({ ...old, condition }));
    const setValues = (selected: Set<string>) => column.setFilterValue((old: any) => ({ ...old, values: selected.size > 0 ? { type: "values", selected } : undefined }));

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-1">
                <span className="truncate">{config.value}</span>
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className={cn("h-6 w-6 p-0 hover:bg-muted", hasActiveFilter ? "text-primary opacity-100" : "opacity-20 hover:opacity-100")}>
                            <ListFilter className="h-3 w-3" />
                            {hasActiveFilter && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <div className="p-2 space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase">Sort</Label>
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                    <Button variant="ghost" className="justify-start h-8 text-sm" onClick={() => { column.toggleSorting(false); setIsOpen(false); }}>
                                        <ArrowDownAZ className="mr-2 h-4 w-4" /> Asc
                                    </Button>
                                    <Button variant="ghost" className="justify-start h-8 text-sm" onClick={() => { column.toggleSorting(true); setIsOpen(false); }}>
                                        <ArrowUpAZ className="mr-2 h-4 w-4" /> Desc
                                    </Button>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase">Condition</Label>
                                {config.type === "number" ? (
                                    <NumberConditionFilter currentCondition={filterValue?.condition} onApply={setCondition} onClear={() => setCondition(undefined)} />
                                ) : (
                                    <TextConditionFilter currentCondition={filterValue?.condition} onApply={setCondition} onClear={() => setCondition(undefined)} />
                                )}
                            </div>
                            <DropdownMenuSeparator />
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase">Values</Label>
                                <ValuesListFilter columnId={config.key} data={data} columnType={config.type} selectedValues={filterValue?.values?.selected || new Set()} onSelectionChange={setValues} />
                            </div>
                        </div>
                        <div className="flex justify-between p-2 border-t bg-muted/20">
                            <Button variant="ghost" size="sm" onClick={() => { column.clearSorting(); column.setFilterValue(undefined); setIsOpen(false); }}>Reset</Button>
                            <Button size="sm" onClick={() => setIsOpen(false)}>Done</Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

// ==========================================
// 4. MAIN COMPONENT
// ==========================================

export function JSONDataTable({
    data = [],
    className,
    addButtonText,
    addButtonLink,
    editButtonLink,
    master_id,
    columns: columnsMap,
    fileName,
    storageKey = "json-data-table-state",
    defaultGrouping,
    dropdown = false,
    renderDropdownContent,
    onRowClick,
    defaultPageSize,
    pagination: controlledPagination,
    onPaginationChange,
    manualPagination
}: JSONDataTableProps) {
    const navigate = useNavigate();
    const location = useLocation();

    // --- AUTO TYPE DETECTION ---
    const columnConfigs = useMemo<InternalColumnConfig[]>(() => {
        if (!data || data.length === 0) return [];

        // Use provided keys from columnsMap or fallback to keys in the first data row
        const keys = columnsMap ? Object.keys(columnsMap) : Object.keys(data[0]);

        return keys.map((key) => {
            const label = columnsMap ? columnsMap[key] : key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

            // Check first 5 rows to infer type
            let detectedType: InternalColumnConfig["type"] = "text";
            const sampleValues = data.slice(0, 5).map(d => d[key]).filter(v => v !== null && v !== undefined && v !== "");

            if (sampleValues.length > 0) {
                const val = sampleValues[0];

                if (typeof val === "boolean") {
                    detectedType = "boolean";
                } else if (typeof val === "number") {
                    detectedType = "number";
                } else if (val instanceof Date) {
                    detectedType = "date";
                } else if (typeof val === "string") {
                    // Check for Time (HH:MM or HH:MM:SS)
                    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(val)) {
                        detectedType = "time";
                    }
                    // Check for ISO DateTime (has T and is valid date)
                    else if (!isNaN(Date.parse(val)) && val.includes("T")) {
                        detectedType = "datetime";
                    }
                    // Check for Date String (YYYY-MM-DD)
                    else if (!isNaN(Date.parse(val)) && (val.includes("-") || val.includes("/"))) {
                        detectedType = "date";
                    }
                }
            }

            return {
                key,
                value: label,
                type: detectedType
            };
        });
    }, [data, columnsMap]);

    // --- STATE MANAGEMENT ---
    const getInitialState = <T,>(key: string, defaultValue: T): T => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed[key] !== undefined ? parsed[key] : defaultValue;
            }
        } catch (e) { /* ignore parse errors – fall back to defaultValue */ }
        return defaultValue;
    };

    const [sorting, setSorting] = useState<SortingState>(() => getInitialState("sorting", []));
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => getInitialState("columnFilters", []));
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => getInitialState("columnVisibility", {}));
    const [grouping, setGrouping] = useState<GroupingState>(() => getInitialState("grouping", defaultGrouping || []));
    const [expanded, setExpanded] = useState({});
    const [globalFilter, setGlobalFilter] = useState(() => getInitialState("globalFilter", ""));
    const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>(() => getInitialState("pagination", { pageIndex: 0, pageSize: defaultPageSize || 50 }));
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ left: [], right: ["actions"] });

    const tableRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Save state on change
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify({ sorting, columnFilters, columnVisibility, grouping, globalFilter, pagination }));
    }, [sorting, columnFilters, columnVisibility, grouping, globalFilter, pagination, storageKey]);

    // --- SYNC DEFAULT PAGE SIZE IF NO SAVED STATE ---
    useEffect(() => {
        if (!defaultPageSize) return;

        const saved = localStorage.getItem(storageKey);
        let hasSavedPagination = false;
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                hasSavedPagination = parsed.pagination !== undefined;
            } catch (e) { /* ignore parse errors */ }
        }

        if (!hasSavedPagination) {
            const currentSize = controlledPagination?.pageSize || pagination.pageSize;
            if (currentSize !== defaultPageSize) {
                if (onPaginationChange) {
                    onPaginationChange({
                        pageIndex: controlledPagination?.pageIndex || pagination.pageIndex,
                        pageSize: defaultPageSize
                    });
                } else {
                    setPagination(prev => ({ ...prev, pageSize: defaultPageSize }));
                }
            }
        }
    }, [defaultPageSize, storageKey]);

    // --- FILTER FUNCTION ---
    const advancedFilterFn: FilterFn<any> = (row, columnId, filterValue: CustomColumnFilterValue) => {
        if (!filterValue) return true;
        const cellValue = row.getValue(columnId);
        const strVal = String(cellValue).toLowerCase();

        if (filterValue.condition) {
            const { operator, value } = filterValue.condition;
            const numVal = Number(cellValue);

            switch (operator) {
                case "equals": return value == cellValue;
                case "greater": return numVal > Number(value);
                case "less": return numVal < Number(value);
                case "between": return Array.isArray(value) && numVal >= Number(value[0]) && numVal <= Number(value[1]);
                case "contains": return strVal.includes(String(value).toLowerCase());
                case "startsWith": return strVal.startsWith(String(value).toLowerCase());
                case "endsWith": return strVal.endsWith(String(value).toLowerCase());
                default: return true;
            }
        }
        if (filterValue.values?.selected) {
            return filterValue.values.selected.has(String(cellValue));
        }
        return true;
    };

    // --- TABLE DEFINITION ---
    const tableColumns = useMemo<ColumnDef<RowData>[]>(() => {
        const baseCols: ColumnDef<RowData>[] = columnConfigs.map((config) => ({
            accessorKey: config.key,
            id: config.key,
            header: ({ column }) => <TableColumnHeader column={column} config={config} data={data} />,
            filterFn: advancedFilterFn,
            sortingFn: (config.type === "date" || /date/i.test(config.key)) ? (rowA, rowB, columnId) => {
                const parseDate = (val: any) => {
                    if (!val || val === "null" || val === "") return 0;
                    let d = String(val).trim();
                    if (d.includes(" ") && d.match(/^\d{2}-\d{2}-\d{4}/)) {
                        d = d.split(" ")[0];
                        const [day, month, year] = d.split("-");
                        return new Date(`${year}-${month}-${day}`).getTime();
                    } else if (d.match(/^\d{2}-\d{2}-\d{4}/)) {
                        const [day, month, year] = d.split("-");
                        return new Date(`${year}-${month}-${day}`).getTime();
                    } else if (d.includes("T") || (d.includes(" ") && d.match(/^\d{4}-\d{2}-\d{2}/))) {
                        if (d.includes("T")) d = d.split("T")[0];
                        else if (d.includes(" ")) d = d.split(" ")[0];
                        return new Date(d).getTime();
                    }
                    const time = new Date(d).getTime();
                    return isNaN(time) ? 0 : time;
                };
                const timeA = parseDate(rowA.getValue(columnId));
                const timeB = parseDate(rowB.getValue(columnId));
                return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
            } : "auto",
            cell: ({ row }) => {
                const value = row.getValue(config.key);

                if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;

                if (config.type === "text") {
                    return <div className="whitespace-normal wrap-break-word min-w-[150px]">{String(value)}</div>;
                }

                if (config.type === "number") {
                    const num = Number(value);
                    const display = isNaN(num) ? String(value) : num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
                    return <div className="text-right font-medium">{display}</div>;
                }

                if (config.type === "date") {
                    const d = new Date(String(value));
                    return <div className="text-left font-medium whitespace-nowrap">{formatDateReverse(d)}</div>;
                }

                if (config.type === "datetime") {
                    return <div className="text-left font-medium whitespace-nowrap">{formatDateTimeString(String(value))}</div>;
                }

                if (config.type === "time") {
                    return <div className="text-left font-medium whitespace-nowrap">{formatTo12Hour(String(value))}</div>;
                }

                if (config.type === "boolean") {
                    const isTrue = value === true || value === "true" || value === 1;
                    return (
                        <div className={cn(
                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium text-white",
                            isTrue ? "bg-green-600" : "bg-red-500"
                        )}>
                            {isTrue ? "True" : "False"}
                        </div>
                    );
                }

                return String(value);
            }
        }));

        if ((editButtonLink || master_id) && data.length > 0) {
            baseCols.push({
                id: "actions",
                header: () => <div className="text-center">Actions</div>,
                cell: ({ row }) => (
                    <div className="flex justify-center gap-2">
                        {master_id && editButtonLink && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            to={`${editButtonLink}${row.original[master_id]}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 hover:bg-muted rounded-full text-primary"
                                        >
                                            <Pen className="w-4 h-4" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                )
            });
        }
        return baseCols;
    }, [columnConfigs, data, editButtonLink, master_id]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            grouping,
            expanded,
            sorting,
            columnFilters,
            columnVisibility,
            columnPinning,
            globalFilter,
            rowSelection,
            pagination: controlledPagination ?? pagination,
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const next = updater(controlledPagination ?? pagination);
                if (onPaginationChange) onPaginationChange(next);
                else setPagination(next);
            } else {
                if (onPaginationChange) onPaginationChange(updater);
                else setPagination(updater);
            }
        },
        manualPagination: manualPagination,
        enablePinning: true,
        onColumnPinningChange: setColumnPinning,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });



    // --- EFFECT: SCROLL TO ROW ---
    useEffect(() => {
        if (data.length > 0 && focusedRowIndex >= 0) {
            const timer = setTimeout(() => {
                document.getElementById(`row-${focusedRowIndex}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [focusedRowIndex, data.length]);

    // --- KEYBOARD NAVIGATION ---
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!data.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedRowIndex(prev => Math.min(table.getRowModel().rows.length - 1, prev + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedRowIndex(prev => Math.max(0, prev - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const row = table.getRowModel().rows[focusedRowIndex];
            if (row) {
                if (onRowClick) onRowClick(row.original, focusedRowIndex);
                else if (dropdown) row.toggleExpanded();
                else if (editButtonLink && master_id) navigate(`${editButtonLink}${row.original[master_id]}`);
            }
        }
    };

    // --- GLOBAL SHORTCUTS ---
    useEffect(() => {
        const handleGlobal = (e: KeyboardEvent) => {
            const hasModifier = e.altKey || (isMac() && e.metaKey);
            if (!hasModifier) return;

            const key = e.key?.toLowerCase();
            const code = e.code;

            // Alt + S (Search)
            if (code === "KeyS" || key === "s" || e.key === "ß") {
                e.preventDefault();
                e.stopPropagation();
                searchInputRef.current?.focus();
                return;
            }

            // Alt + C (Add New - legacy used C, but user mentioned N)
            // Let's support both N and C for consistency
            if (code === "KeyC" || key === "c" || e.key === "ç" || code === "KeyN" || key === "n" || e.key === "˜") {
                if (addButtonLink) {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate({ pathname: addButtonLink, search: location.search });
                    return;
                }
            }

            // Alt + D (Export)
            if (code === "KeyD" || key === "d" || e.key === "∂") {
                if (data.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    downloadExcel();
                    return;
                }
            }
        };
        window.addEventListener("keydown", handleGlobal);
        return () => window.removeEventListener("keydown", handleGlobal);
    }, [addButtonLink, data, navigate, location]);

    const downloadExcel = () => {
        // Get all filtered rows (across all pages)
        const rows = table.getFilteredRowModel().rows;

        // Get only visible columns, excluding the 'actions' column
        const visibleColumns = table.getAllColumns().filter(col =>
            col.getIsVisible() && col.id !== "actions"
        );

        // Map rows to the desired export format using column labels
        const exportData = rows.map(row => {
            const rowData: Record<string, any> = {};
            visibleColumns.forEach(col => {
                const config = columnConfigs.find(c => c.key === col.id);
                const label = config?.value || col.id;

                let val = row.getValue(col.id);

                // Basic data cleanup for Excel export
                if (config?.type === "date" && val) {
                    const d = new Date(String(val));
                    if (!isNaN(d.getTime())) val = d;
                } else if (config?.type === "number") {
                    val = Number(val);
                    if (isNaN(Number(val))) val = row.getValue(col.id);
                } else if (config?.type === "boolean") {
                    val = val ? "True" : "False";
                }

                rowData[label] = val;
            });
            return rowData;
        });

        const ws = XLSX.utils.json_to_sheet(exportData, { cellDates: true });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `${fileName || "export"}_${format(new Date(), "yyyyMMdd")}.xlsx`);
    };

    return (
        <div className={cn("space-y-4 outline-none", className)} onKeyDown={handleKeyDown} tabIndex={0} ref={tableRef}>
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:max-w-md bg-background">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input ref={searchInputRef} placeholder="Global Search... (Alt + S)" value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} className="pl-9" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    {/* GROUPING */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Group <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table.getAllColumns().filter(c => c.getCanGroup()).map(c => (
                                <DropdownMenuCheckboxItem key={c.id} checked={c.getIsGrouped()} onCheckedChange={() => c.toggleGrouping()}>
                                    {columnConfigs.find(conf => conf.key === c.id)?.value || c.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* COLUMNS VISIBILITY */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Columns <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                            {table.getAllColumns().filter(c => c.getCanHide()).map(c => (
                                <DropdownMenuCheckboxItem key={c.id} checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)}>
                                    {columnConfigs.find(conf => conf.key === c.id)?.value || c.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* EXPORT */}
                    <Button variant="outline" size="sm" onClick={downloadExcel} disabled={!data.length}><FileSpreadsheet className="mr-2 h-4 w-4" /> Export</Button>

                    {/* ADD NEW */}
                    {addButtonLink && (
                        <Button size="sm" asChild>
                            <Link to={addButtonLink}><Plus className="mr-2 h-4 w-4" /> {addButtonText || "Add New"}</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* GROUPING BADGES */}
            {grouping.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-md">
                    <span className="text-sm font-medium self-center">Grouped by:</span>
                    {grouping.map(g => (
                        <div key={g} className="flex items-center bg-background border px-2 py-1 rounded text-xs shadow-sm">
                            {columnConfigs.find(c => c.key === g)?.value || g}
                            <X className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setGrouping(prev => prev.filter(i => i !== g))} />
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setGrouping([])}>Clear</Button>
                </div>
            )}

            {/* ACTIVE FILTER BADGES */}
            {columnFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-muted/30 border-t border-b mb-2">
                    <span className="text-sm font-medium self-center text-muted-foreground flex items-center gap-1">
                        <ListFilter className="h-3 w-3" /> Filters:
                    </span>
                    {columnFilters.map(filter => (
                        <div key={filter.id} className="flex items-center bg-background border px-2 py-1 rounded text-xs shadow-sm gap-1">
                            <span className="font-semibold">{columnConfigs.find(c => c.key === filter.id)?.value || filter.id}:</span>
                            <span className="truncate max-w-[150px] text-muted-foreground">Active</span>
                            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => table.getColumn(filter.id)?.setFilterValue(undefined)} />
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500" onClick={() => setColumnFilters([])}>Clear All</Button>
                </div>
            )}

            {/* TABLE RENDER */}
            <div className="rounded-md border overflow-hidden w-full bg-background">
                <div className="max-h-[60vh] overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-30 shadow-sm">
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id} className="px-0" style={{ ...getCommonPinningStyles(header.column) }}>
                                            <div className={cn("h-full flex items-center px-2", header.column.getIsPinned() && "bg-accent shadow-sm")}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row, index) => {
                                    const isFocused = focusedRowIndex === index;
                                    return (
                                        <React.Fragment key={row.id}>
                                            <TableRow
                                                id={`row-${index}`}
                                                className={cn(
                                                    "hover:bg-muted/50 transition-colors",
                                                    (onRowClick || dropdown) ? "cursor-pointer" : "",
                                                    isFocused ? "bg-primary/10 font-bold border-primary/20" : ""
                                                )}
                                                onClick={() => {
                                                    setFocusedRowIndex(index);
                                                    if (dropdown) row.toggleExpanded();
                                                    else if (onRowClick) onRowClick(row.original, index);
                                                }}
                                            >
                                                {row.getVisibleCells().map(cell => (
                                                    <TableCell key={cell.id} className="px-2 py-2" style={{ ...getCommonPinningStyles(cell.column) }}>
                                                        {cell.getIsGrouped() ? (
                                                            <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); row.toggleExpanded(); }}>
                                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                    {row.getIsExpanded() ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                                                </Button>
                                                                <span className="font-medium">{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                                                                <span className="text-muted-foreground text-xs">({row.subRows.length})</span>
                                                            </div>
                                                        ) : cell.getIsAggregated() ? null : cell.getIsPlaceholder() ? null : (
                                                            flexRender(cell.column.columnDef.cell, cell.getContext())
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            {/* DROPDOWN ROW CONTENT */}
                                            {row.getIsExpanded() && dropdown && renderDropdownContent && (
                                                <TableRow className="bg-muted/20 hover:bg-muted/20">
                                                    <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-0">
                                                        <div className="p-4 animate-in slide-in-from-top-2">
                                                            {renderDropdownContent(row.original, index)}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <TableRow><TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">No results.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* FOOTER & PAGINATION */}
                <div className="flex items-center justify-between p-4 py-2 border-t bg-background">
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        {table.getFilteredRowModel().rows.length} row(s)
                    </div>
                    <div className="flex items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><HelpCircle className="h-4 w-4" /></Button></PopoverTrigger>
                            <PopoverContent className="w-80">
                                <h4 className="font-medium flex items-center gap-2 border-b pb-2"><Keyboard className="h-4 w-4" /> Keyboard Shortcuts</h4>
                                <div className="grid gap-2 text-sm mt-2">
                                    <div className="flex justify-between"><span>Search</span><kbd className="bg-muted px-1 rounded">Alt + S</kbd></div>
                                    <div className="flex justify-between"><span>New</span><kbd className="bg-muted px-1 rounded">Alt + C</kbd></div>
                                    <div className="flex justify-between"><span>Export</span><kbd className="bg-muted px-1 rounded">Alt + D</kbd></div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Per page</span>
                            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={v => table.setPageSize(Number(v))}>
                                <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 50, 100, 200, 250, 500, 1000].map(p => <SelectItem key={p} value={`${p}`}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}