// importing client
import api from "@/lib/api";

// importing from react
import React, { useEffect, useMemo, useRef, useState } from "react";
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
    PaginationState,
    RowSelectionState,
    OnChangeFn,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
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
    TableFooter as ShadcnTableFooter,
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

// importing icons
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
    RotateCw,
    Search,
    X,
    HelpCircle,
    Keyboard,
    FileText,
    FileJson,
    FileArchive,
    FileType,
    Group,
    EyeOff,
    Mail,
    Loader2,
    File,
    FileSliders,
} from "lucide-react";
import { cn, formatDateReverse } from "@/lib/utils";
import { getFromStorage } from "@/lib/storage";
import { usePermission } from "@/hooks/use-permissions";
import { LottieLoading } from "../loading/lottie-loading";
import { format } from "date-fns";

export type TablePermissions = {
    read?: string;
    create?: string;
    update?: string;
    delete?: string;
    exportExcel?: string;
    exportCsv?: string;
    exportPdf?: string;
    exportEmail?: string;
}

// --- HELPERS FOR PINNING STYLES ---
import { CSSProperties } from "react";
import { toast } from "sonner";

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

// --- TYPES & INTERFACES ---

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

export interface ColumnConfig {
    key: string;
    value: string;
    type: string;
    help?: string;
    specific?: string;
    symbol?: string;
    colorMap?: {
        value: string;
        printValue?: string;
        bgColor: string;
        foregroundColor: string;
    }[];
    className?: string;
    customRender?: (value: any, rowData: any, rowIndex: number) => React.ReactNode;
    style?: (rowData: any) => React.CSSProperties;
}

interface JSONDataTableProps {
    getData?: {
        api: string;
        apiMethod: "get" | "post" | "put" | "patch" | "delete";
        params: Record<string, string | number | boolean | Date>;
        body?: Record<string, string | number | boolean | Date>;
        headers: Record<string, string | number | boolean | Date>;
        onFailure?: () => void;
        onSuccess?: (data: any) => void;
    };
    exportApiString?: string;
    data: Record<string, any>[];
    setData: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
    loading?: boolean;
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
    className?: string;
    addButtonText: string;
    addButtonLink: string;
    editButtonLink: string;
    search: boolean;
    master_id: string;
    columns: ColumnConfig[];
    fileName?: string;
    total_row?: string[];
    share?: boolean;
    storageKey?: string;
    reload?: boolean;
    onReload?: () => void;
    defaultGrouping?: string[];
    customActions?: {
        id: string;
        label: string;
        help?: string;
        permission?: string;
        icon?:
        | React.ReactNode
        | ((
            rowData: Record<string, any>,
            rowIndex: number
        ) => React.ReactNode);
        onClick?: (
            rowData: Record<string, any>,
            rowIndex: number
        ) => void;
        requiredColumns?: string[];
        showCondition?: (
            rowData: Record<string, any>
        ) => boolean;
    }[];
    leftPinning?: string[];
    rightPinning?: string[];
    dropdown?: boolean;
    renderDropdownContent?: (rowData: any, rowIndex: number) => React.ReactNode;
    columnFocus?: boolean;
    onRowClick?: (rowData: any, rowIndex: number) => void;
    preventActionClickRowExpansion?: boolean;
    // Export Props
    printOptions?: ("excel" | "csv" | "pdf")[];
    printHeader?: string;
    pdfSettings?: {
        orientation?: "portrait" | "landscape";
        unit?: "pt" | "mm" | "cm" | "in";
        format?: string;
        margins?: { top: number; right: number; bottom: number; left: number };
    };
    // Server Side / Manual Control Props
    manualPagination?: boolean;
    manualFiltering?: boolean,
    rowCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    onSearchChange?: (term: string) => void;
    onExport?: (type: "excel" | "csv" | "pdf", mode: "raw" | "filtered") => void;
    CRUD?: { create: boolean, update: boolean, read: boolean, delete: boolean };
    diff_columns?: [string, string][];
    diff_title?: string[];
    defaultExpanded?: boolean;
    // Mobile Toolbar Visibility Props
    showGroupByMobile?: boolean;
    showExportMobile?: boolean;
    showColumnsMobile?: boolean;
    showReloadMobile?: boolean;
    saveSearch?: boolean;
    isRowDeleted?: (rowData: any) => boolean;
    emailPermission?: string;
    permissions?: TablePermissions;
    defaultPageSize?: number;
    tableHeight?: string;
}

// --- EXTRACTED HELP COMPONENT ---
const ActionHelpItem = ({ action }: { action: any }) => {
    const hasPerm = !action.permission || usePermission(action.permission);
    if (!hasPerm || !action.help) return null;
    return (
        <div className="mb-4">
            <h5 className="font-semibold text-sm">{action.label}</h5>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">{action.help}</p>
        </div>
    );
};

// --- EXTRACTED FILTER COMPONENTS ---

const NumberConditionFilter = ({
    currentCondition,
    onApply,
    onClear,
}: {
    columnId: string;
    currentCondition?: FilterCondition;
    onApply: (condition: FilterCondition) => void;
    onClear: () => void;
}) => {
    const [operator, setOperator] = useState(
        currentCondition?.operator || "equals"
    );
    const [value1, setValue1] = useState<string>(
        currentCondition?.value
            ? String(
                typeof currentCondition.value === "object"
                    ? currentCondition.value[0]
                    : currentCondition.value
            )
            : ""
    );
    const [value2, setValue2] = useState<string>(
        currentCondition?.value && Array.isArray(currentCondition.value)
            ? String(currentCondition.value[1])
            : ""
    );

    const handleApply = () => {
        if (operator === "between") {
            const num1 = parseFloat(value1);
            const num2 = parseFloat(value2);
            if (!isNaN(num1) && !isNaN(num2)) {
                onApply({ operator, value: [num1, num2], type: "condition" });
            }
        } else if (value1) {
            const numValue = parseFloat(value1);
            if (!isNaN(numValue)) {
                onApply({ operator, value: numValue, type: "condition" });
            }
        }
    };

    return (
        <div className="space-y-2 p-1">
            <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="greater">Greater than</SelectItem>
                    <SelectItem value="less">Less than</SelectItem>
                    <SelectItem value="greaterEqual">Greater than or equal</SelectItem>
                    <SelectItem value="lessEqual">Less than or equal</SelectItem>
                    <SelectItem value="between">Between</SelectItem>
                    <SelectItem value="notEqual">Not equal to</SelectItem>
                </SelectContent>
            </Select>

            {operator === "between" ? (
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="From"
                        className="h-8 text-sm"
                        value={value1}
                        onChange={(e) => setValue1(e.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="To"
                        className="h-8 text-sm"
                        value={value2}
                        onChange={(e) => setValue2(e.target.value)}
                    />
                </div>
            ) : (
                <Input
                    type="number"
                    placeholder="Enter value"
                    className="h-8 text-sm"
                    value={value1}
                    onChange={(e) => setValue1(e.target.value)}
                />
            )}

            <div className="flex gap-2 pt-2">
                {currentCondition && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm flex-1"
                        onClick={onClear}
                    >
                        Clear
                    </Button>
                )}
                <Button
                    size="sm"
                    className="h-8 text-sm flex-1"
                    onClick={handleApply}
                    disabled={!value1 || (operator === "between" && !value2)}
                >
                    Apply
                </Button>
            </div>
        </div>
    );
};

const ColorBadgeFilter = ({
    colorMap,
    selectedValues,
    onSelectionChange,
}: {
    colorMap: {
        value: string;
        printValue?: string;
        bgColor: string;
        foregroundColor: string;
    }[];
    selectedValues: Set<string>;
    onSelectionChange: (selected: Set<string>) => void;
}) => {
    const handleToggle = (value: string) => {
        const newSet = new Set(selectedValues);
        if (newSet.has(value)) {
            newSet.delete(value);
        } else {
            newSet.add(value);
        }
        onSelectionChange(newSet);
    };

    return (
        <div className="p-1 gap-2 flex flex-wrap">
            {colorMap.map((item, idx) => {
                const isSelected = selectedValues.has(item.value);
                return (
                    <div
                        key={idx}
                        onClick={() => handleToggle(item.value)}
                        className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer border-2 transition-all select-none flex items-center gap-1",
                            isSelected
                                ? "border-black dark:border-white opacity-100"
                                : "border-transparent opacity-60 hover:opacity-90"
                        )}
                        style={{
                            backgroundColor: item.bgColor,
                            color: item.foregroundColor,
                        }}
                    >
                        {item.printValue ?? item.value}
                        {isSelected && <span className="text-[10px]">✓</span>}
                    </div>
                );
            })}
        </div>
    );
};

const ValuesListFilter = ({
    columnId,
    data,
    selectedValues,
    onSelectionChange,
    columnType,
}: {
    columnId: string;
    data: any[];
    selectedValues: Set<string>;
    onSelectionChange: (selected: Set<string>) => void;
    columnType: string;
}) => {
    const [search, setSearch] = useState("");

    const uniqueValues = useMemo(() => {
        const values = data
            .map((row) => row[columnId])
            .filter((value) => value != null && value !== "")
            .map((value) => String(value));
        return Array.from(new Set(values)).sort();
    }, [data, columnId]);

    const filteredValues = useMemo(() => {
        if (!search) return uniqueValues;
        return uniqueValues.filter((value) =>
            value.toLowerCase().includes(search.toLowerCase())
        );
    }, [uniqueValues, search]);

    const handleToggleValue = (value: string, checked: boolean) => {
        const newSet = new Set(selectedValues);
        if (checked) newSet.add(value);
        else newSet.delete(value);
        onSelectionChange(newSet);
    };

    return (
        <div className="p-1">
            <div className="mb-2">
                <Input
                    placeholder="Search values..."
                    className="h-8 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="h-20 overflow-y-auto border rounded-md p-2 space-y-1">
                {filteredValues.length > 0 ? (
                    filteredValues.map((value, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                                id={`value-${columnId}-${index}`}
                                checked={selectedValues.has(value)}
                                onCheckedChange={(checked) =>
                                    handleToggleValue(value, checked as boolean)
                                }
                            />
                            <label
                                htmlFor={`value-${columnId}-${index}`}
                                className="text-xs font-normal truncate flex-1 cursor-pointer"
                            >
                                {columnType === "date"
                                    ? formatDateReverse(new Date(value))
                                    : value}
                            </label>
                            <span className="text-xs text-muted-foreground">
                                {data.filter((row) => String(row[columnId]) === value).length}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                        No values found
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between mt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onSelectionChange(new Set(filteredValues))}
                    disabled={filteredValues.length === 0}
                >
                    Select All
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => onSelectionChange(new Set())}
                    disabled={selectedValues.size === 0}
                >
                    Clear All
                </Button>
            </div>
        </div>
    );
};

const TextConditionFilter = ({
    currentCondition,
    onApply,
    onClear,
}: {
    columnId: string;
    currentCondition?: FilterCondition;
    onApply: (condition: FilterCondition) => void;
    onClear: () => void;
}) => {
    const [operator, setOperator] = useState<string>(
        currentCondition?.operator || "contains"
    );
    const [value, setValue] = useState<string>(
        currentCondition?.value ? String(currentCondition.value) : ""
    );

    return (
        <div className="space-y-2 p-1">
            <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="startsWith">Begins with</SelectItem>
                    <SelectItem value="endsWith">Ends with</SelectItem>
                    <SelectItem value="notContains">Does not contain</SelectItem>
                </SelectContent>
            </Select>
            <Input
                placeholder="Enter text"
                className="h-8 text-sm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
                {currentCondition && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm flex-1"
                        onClick={onClear}
                    >
                        Clear
                    </Button>
                )}
                <Button
                    size="sm"
                    className="h-8 text-sm flex-1"
                    onClick={() =>
                        value.trim() && onApply({ operator, value, type: "condition" })
                    }
                    disabled={!value.trim()}
                >
                    Apply
                </Button>
            </div>
        </div>
    );
};

// --- STABLE COLUMN HEADER COMPONENT ---
const TableColumnHeader = ({
    column,
    config,
    data,
    table,
}: {
    column: Column<any, any>;
    config: ColumnConfig;
    data: any[];
    table: any;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const columnId = config.key;
    const filterValue = column.getFilterValue() as
        | CustomColumnFilterValue
        | undefined;

    const getColumnType = ():
        | "text"
        | "number"
        | "date"
        | "boolean"
        | "badge"
        | "file" => {
        if (config.type === "number") return "number";
        if (config.type === "date") return "date";
        if (config.type === "boolean") return "boolean";
        if (config.type === "badge") return "badge";
        if (config.type === "file") return "file";
        return "text";
    };

    const columnType = getColumnType();
    const hasActiveFilter =
        !!filterValue?.condition ||
        (filterValue?.values?.selected && filterValue.values.selected.size > 0);

    const setCondition = (condition: FilterCondition | undefined) => {
        column.setFilterValue((old: CustomColumnFilterValue | undefined) => ({
            ...old,
            condition,
        }));
    };

    const setValues = (selected: Set<string>) => {
        column.setFilterValue((old: CustomColumnFilterValue | undefined) => ({
            ...old,
            values: selected.size > 0 ? { type: "values", selected } : undefined,
        }));
    };

    const clearAll = () => {
        column.setFilterValue(undefined);
        setIsOpen(false);
    };

    // Safely retrieve selected values, ensuring it's always a Set to prevent crashes
    // Explicitly cast to 'any' before checking to avoid TS Error 2339 on 'never' types
    const safeSelectedValues = useMemo<Set<string>>(() => {
        const sel = filterValue?.values?.selected as any;
        if (sel instanceof Set) return sel as Set<string>;
        if (Array.isArray(sel)) return new Set<string>(sel);
        return new Set<string>();
    }, [filterValue?.values?.selected]);

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-1">
                {config.help ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="cursor-help underline decoration-dashed underline-offset-4 decoration-muted-foreground/50">
                                <span className="truncate">{config.value}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-[250px] text-xs text-balance leading-relaxed">{config.help}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <span className="truncate">{config.value}</span>
                )}
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-6 w-6 p-0 hover:bg-muted",
                                hasActiveFilter
                                    ? "opacity-100 text-primary"
                                    : "opacity-20 group-hover:opacity-100"
                            )}
                        >
                            <ListFilter className="h-3 w-3" />
                            {hasActiveFilter && (
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={5}
                        className="w-80 max-h-[80vh] overflow-y-auto"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                        <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-popover z-10">
                            <DropdownMenuLabel className="font-semibold p-0">
                                Filter "{config.value}"
                            </DropdownMenuLabel>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-2 space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground uppercase">
                                    Sort
                                </Label>
                                <div className="grid grid-cols-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => {
                                            table.setSorting((prev: any[]) => {
                                                const newSorting = prev.filter((s: any) => s.id !== column.id);
                                                return [{ id: column.id, desc: false }, ...newSorting];
                                            });
                                            setIsOpen(false);
                                        }}
                                    >
                                        <ArrowDownAZ className="mr-2 h-4 w-4" /> {" "}
                                        {columnType === "number" ? "Small to Large" : "A to Z"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start h-8 text-sm"
                                        onClick={() => {
                                            table.setSorting((prev: any[]) => {
                                                const newSorting = prev.filter((s: any) => s.id !== column.id);
                                                return [{ id: column.id, desc: true }, ...newSorting];
                                            });
                                            setIsOpen(false);
                                        }}
                                    >
                                        <ArrowUpAZ className="mr-2 h-4 w-4" />{" "}
                                        {columnType === "number" ? "Large to Small" : "Z to A"}
                                    </Button>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            {columnType === "badge" && config.colorMap && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground uppercase">
                                            Filter by Color
                                        </Label>
                                        <ColorBadgeFilter
                                            colorMap={config.colorMap}
                                            selectedValues={safeSelectedValues}
                                            onSelectionChange={setValues}
                                        />
                                    </div>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase">
                                    Condition
                                </Label>
                                {columnType === "number" && (
                                    <NumberConditionFilter
                                        columnId={columnId}
                                        currentCondition={filterValue?.condition}
                                        onApply={setCondition}
                                        onClear={() => setCondition(undefined)}
                                    />
                                )}
                                {(columnType === "text" ||
                                    columnType === "badge" ||
                                    columnType === "file") && (
                                        <TextConditionFilter
                                            columnId={columnId}
                                            currentCondition={filterValue?.condition}
                                            onApply={setCondition}
                                            onClear={() => setCondition(undefined)}
                                        />
                                    )}
                            </div>
                            <DropdownMenuSeparator />
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase">
                                    Values
                                </Label>
                                <ValuesListFilter
                                    columnId={columnId}
                                    columnType={columnType}
                                    data={data}
                                    selectedValues={safeSelectedValues}
                                    onSelectionChange={setValues}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border-t bg-background sticky bottom-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    column.clearSorting();
                                    clearAll();
                                }}
                            >
                                Clear All
                            </Button>
                            <Button size="sm" onClick={() => setIsOpen(false)}>
                                Done
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export function JSONNewDataTable({
    getData,
    data,
    setData,
    className,
    addButtonText,
    addButtonLink,
    editButtonLink,
    search,
    master_id,
    columns: columnConfigs,
    fileName,
    total_row = [],
    exportApiString,
    // share, // removed unused prop
    storageKey = "json-data-table-state",
    reload,
    onReload,
    defaultGrouping,
    customActions,
    leftPinning = [],
    rightPinning = [],
    dropdown = false,
    renderDropdownContent,
    columnFocus = true,
    onRowClick,
    preventActionClickRowExpansion = true,
    // Export Props
    printOptions = ["excel", "csv", "pdf"],
    printHeader = "",
    pdfSettings = {
        orientation: undefined,
        unit: "pt",
        format: "a4",
        margins: { top: 40, right: 40, bottom: 40, left: 40 }
    },
    // Server Side / Manual Control Props
    manualPagination = false,
    manualFiltering = false,
    rowCount,
    pagination: controlledPagination,
    onPaginationChange,
    onSearchChange,
    onExport,
    CRUD,
    loading,
    setLoading,
    diff_columns,
    diff_title,
    defaultExpanded = false,
    showGroupByMobile = true,
    showExportMobile = true,
    showColumnsMobile = true,
    showReloadMobile = true,
    saveSearch = false,
    isRowDeleted,
    emailPermission,
    permissions,
    defaultPageSize,
    tableHeight
}: JSONDataTableProps) {

    const navigate = useNavigate();
    const location = useLocation();

    // Permissions evaluation
    const canRead = !permissions?.read || usePermission(permissions.read);
    const canCreate = !permissions?.create || usePermission(permissions.create);
    const canUpdate = !permissions?.update || usePermission(permissions.update);
    // Note: delete is handled via customActions or logic below if needed
    const canExportExcel = !permissions?.exportExcel || usePermission(permissions.exportExcel);
    const canExportCsv = !permissions?.exportCsv || usePermission(permissions.exportCsv);
    const canExportPdf = !permissions?.exportPdf || usePermission(permissions.exportPdf);
    const canExportEmail = !permissions?.exportEmail || usePermission(permissions.exportEmail);

    // DERIVE A UNIQUE STORAGE KEY IF DEFAULT IS USED
    const derivedStorageKey = useMemo(() => {
        if (storageKey !== "json-data-table-state") return storageKey;
        // Create a unique key based on the path and fileName
        const pathRef = location.pathname.replace(/\//g, "_");
        return `table_state_${pathRef}_${fileName || "default"}`;
    }, [storageKey, location.pathname, fileName]);
    const [internalLoading, setInternalLoading] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

    // Email Export State
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailAddress, setEmailAddress] = useState("");
    const [emailFormat, setEmailFormat] = useState<"pdf" | "excel" | "csv">("pdf");

    const performEmailExport = async () => {
        if (!emailAddress) {
            toast.error("Please enter an email address");
            return;
        }

        setEmailLoading(true);
        try {
            const mode = "filtered"; // Use filtered data usually for reports
            const { rows, visibleCols } = getExportData(mode);
            let content: string = "";
            let filename = `${fileName || "export"}_${format(new Date(), "yyyyMMdd")}`;

            if (emailFormat === "pdf") {
                const orientation = pdfSettings.orientation || (visibleCols.length > 8 ? "landscape" : "portrait");
                const doc = new jsPDF({ orientation, unit: pdfSettings.unit, format: pdfSettings.format });
                const headerText = stripHtml(printHeader || fileName || "Export");
                doc.setFontSize(14);
                doc.text(headerText, (doc.internal.pageSize.width / 2), 25, { align: 'center' });

                const head = [visibleCols.map(c => c.value)];
                const body = rows.map(row => visibleCols.map(c => {
                    const val = row[c.key];
                    return val !== null && val !== undefined ? String(val) : "";
                }));

                const columnStyles: Record<string, any> = {};
                visibleCols.forEach((col, index) => {
                    if (col.type === "number") columnStyles[index] = { halign: "right" };
                });

                autoTable(doc, {
                    startY: 35, head, body, styles: { fontSize: 8, cellWidth: 'auto' },
                    headStyles: { fillColor: [41, 128, 185] }, columnStyles, margin: pdfSettings.margins, theme: 'grid'
                });
                const pdfOutput = doc.output('datauristring');
                content = pdfOutput.split(',')[1] || pdfOutput;
                filename += ".pdf";
            } else if (emailFormat === "excel") {
                const excelData = rows.map((row) => {
                    const newRow: Record<string, any> = {};
                    visibleCols.forEach((col) => {
                        let val = row[col.key];
                        if (col.type === "number") {
                            if (typeof val === "string") {
                                const cleanVal = val.replace(/[^0-9.-]+/g, "");
                                const num = parseFloat(cleanVal);
                                val = isNaN(num) ? 0 : num;
                            } else val = Number(val) || 0;
                        } else if (col.type === "date" && val) {
                            const dateObj = new Date(val);
                            if (!isNaN(dateObj.getTime())) val = dateObj;
                        } else if (col.type === "boolean") val = val ? "Yes" : "No";
                        newRow[col.value] = val;
                    });
                    return newRow;
                });
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet([]);
                const headerText = stripHtml(printHeader || fileName || "Export");
                XLSX.utils.sheet_add_aoa(ws, [[headerText]], { origin: "A1" });
                XLSX.utils.sheet_add_aoa(ws, [[]], { origin: "A2" });
                XLSX.utils.sheet_add_json(ws, excelData, { origin: "A3", skipHeader: false, cellDates: true });
                if (visibleCols.length > 1) ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: visibleCols.length - 1 } }];
                XLSX.utils.book_append_sheet(wb, ws, "Data");
                content = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
                filename += ".xlsx";
            } else if (emailFormat === "csv") {
                const csvData = rows.map((row) => {
                    const newRow: Record<string, any> = {};
                    visibleCols.forEach((col) => newRow[col.value] = row[col.key]);
                    return newRow;
                });
                const ws = XLSX.utils.json_to_sheet(csvData);
                const csv = XLSX.utils.sheet_to_csv(ws);
                content = btoa(unescape(encodeURIComponent(csv))); // Handle UTF8 chars in base64
                filename += ".csv";
            }

            const response = await api.post("/email", {
                email: emailAddress,
                subject: `Data Export: ${fileName || "Table Data"}`,
                text: `Please find the attached ${emailFormat.toUpperCase()} export for ${fileName || "the table"}.`,
                attachments: [{
                    filename: filename,
                    content: content,
                    encoding: 'base64'
                }],
                permission: emailPermission
            });

            if (response.data.type === "success") {
                toast.success("Email sent successfully");
                setEmailDialogOpen(false);
                setEmailAddress("");
            } else {
                toast.error(response.data.message || "Failed to send email");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error sending email");
        } finally {
            setEmailLoading(false);
        }
    };

    // Use external loading if provided, otherwise internal
    const activeLoading = loading !== undefined ? loading : internalLoading;

    // Helper to set loading state appropriately
    const updateLoading = (isLoading: boolean) => {
        if (setLoading) {
            setLoading(isLoading);
        } else {
            setInternalLoading(isLoading);
        }
    };

    // --- STATE INITIALIZATION WITH PERSISTENCE ---
    const getInitialState = <T,>(key: string, defaultValue: T): T => {
        try {
            const saved = localStorage.getItem(derivedStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed[key] !== undefined ? parsed[key] : defaultValue;
            }
        } catch (e) {
            console.warn("Error reading state from storage", e);
        }
        return defaultValue;
    };

    const [sorting, setSorting] = useState<SortingState>(() =>
        getInitialState("sorting", [])
    );

    // SAFE HYDRATION FOR COLUMN FILTERS (Sets vs Arrays)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
        const saved = getInitialState("columnFilters", []);
        return saved.map((filter: any) => {
            // Check if selected values are stored as Array (from JSON) and convert to Set
            if (filter.value?.values?.selected) {
                const sel = filter.value.values.selected;
                return {
                    ...filter,
                    value: {
                        ...filter.value,
                        values: {
                            ...filter.value.values,
                            // If array, convert to Set. If object/empty (legacy bug), default to empty Set.
                            selected: Array.isArray(sel) ? new Set(sel) : new Set()
                        }
                    }
                }
            }
            return filter;
        });
    });

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
        getInitialState("columnVisibility", {})
    );
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [grouping, setGrouping] = useState<GroupingState>(() =>
        getInitialState("grouping", defaultGrouping || [])
    );
    const [expanded, setExpanded] = useState(() =>
        getInitialState("expanded", defaultExpanded ? true : {})
    );
    const [columnOrder, setColumnOrder] = useState<string[]>(() =>
        getInitialState("columnOrder", [])
    );
    const [globalFilter, setGlobalFilter] = useState(() =>
        saveSearch ? getInitialState("globalFilter", "") : ""
    );
    const [focusedRowIndex, setFocusedRowIndex] = useState<number>(() =>
        getInitialState("focusedRowIndex", 0)
    );

    // Internal pagination state if not controlled
    const [pagination, setPagination] = useState<PaginationState>(() =>
        getInitialState("pagination", { pageIndex: 0, pageSize: defaultPageSize || 50 })
    );

    const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
    const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const shouldScrollToRow = useRef(true);

    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
        left: leftPinning,
        right: [...rightPinning, "actions"],
    });

    const tableRef = useRef<HTMLDivElement>(null);
    const leftPinningStr = JSON.stringify(leftPinning);
    const rightPinningStr = JSON.stringify(rightPinning);

    useEffect(() => {
        setColumnPinning({
            left: leftPinning,
            right: Array.from(new Set([...rightPinning, "actions"])),
        });
    }, [leftPinningStr, rightPinningStr]);

    // --- SYNC DEFAULT PAGE SIZE IF NO SAVED STATE ---
    useEffect(() => {
        if (!defaultPageSize) return;

        const saved = localStorage.getItem(derivedStorageKey);
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
    }, [defaultPageSize, derivedStorageKey]);

    // --- DATA FETCHING ---
    async function getDataAPICall() {
        if (!getData || !getData.api) {
            return;
        }

        // --- PERMISSION CHECK ---
        if (!canRead) {
            console.warn("Permission denied for read access. API call skipped.");
            if (!getData.onSuccess) setData([]); // Clear data if no permission
            return;
        }

        try {
            updateLoading(true);
            const jwt = getFromStorage("session") as string;
            const response = await api[getData.apiMethod ?? "get"](getData.api, {
                params: { ...getData.params },
                headers: { Authorization: `Bearer ${jwt}`, ...getData.headers },
            });
            if (response.data.type === "success" || response.data.success === true) {
                if (getData.onSuccess) {
                    getData.onSuccess(response.data.data);
                } else {
                    setData(response.data.data);
                }
            }
        } catch (error) {
            toast.error(String(error));
        } finally {
            updateLoading(false);
        }
    }

    useEffect(() => {
        if (!activeLoading && columnFocus && tableContainerRef.current) {
            if (document.activeElement !== searchInputRef.current) {
                tableContainerRef.current.focus();
            }
        }
    }, [activeLoading, columnFocus]);

    useEffect(() => {
        if (getData && getData.api && (!data || data.length === 0) && !manualPagination) {
            getDataAPICall();
        }
    }, []);

    // --- STATE PERSISTENCE EFFECT ---
    useEffect(() => {
        try {
            // Serialize Sets to Arrays for columnFilters to avoid {} in localStorage
            const serializedColumnFilters = columnFilters.map((filter) => {
                const customFilter = filter.value as CustomColumnFilterValue;
                if (customFilter?.values?.selected instanceof Set) {
                    return {
                        ...filter,
                        value: {
                            ...customFilter,
                            values: {
                                ...customFilter.values,
                                selected: Array.from(customFilter.values.selected)
                            }
                        }
                    };
                }
                return filter;
            });

            const state = {
                columnOrder,
                columnVisibility,
                grouping,
                sorting,
                columnFilters: serializedColumnFilters,
                globalFilter: saveSearch ? globalFilter : "",
                expanded,
                focusedRowIndex,
                pagination: controlledPagination ?? pagination
            };
            localStorage.setItem(derivedStorageKey, JSON.stringify(state));
        } catch (error) {
            console.warn("Failed to save table state", error);
        }
    }, [
        columnOrder,
        columnVisibility,
        grouping,
        sorting,
        columnFilters,
        globalFilter,
        focusedRowIndex,
        pagination,
        controlledPagination,
        storageKey,
    ]);

    useEffect(() => {
        const initialOrder = columnConfigs.map((config) => config.key);
        // Match the conditions for adding "actions" column in baseColumns (approx line 1423)
        if ((customActions || master_id) && editButtonLink && (!CRUD || CRUD.update == true)) {
            initialOrder.push("actions");
        }

        // Compare assuming strict order is required
        if (JSON.stringify(columnOrder) !== JSON.stringify(initialOrder)) {
            setColumnOrder(initialOrder);
        }
        // Use JSON.stringify of columnConfigs keys to avoid infinite loop on ref change
    }, [JSON.stringify(columnConfigs.map(c => c.key)), customActions, master_id, editButtonLink, CRUD, columnOrder]);

    // --- AUTO SCROLL TO FOCUSED ROW ---
    useEffect(() => {
        if (!loading && data.length > 0 && focusedRowIndex >= 0 && shouldScrollToRow.current) {
            const timer = setTimeout(() => {
                const rowId = `table-row-${focusedRowIndex}`;
                const rowElement = document.getElementById(rowId);
                if (rowElement) {
                    rowElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [focusedRowIndex, activeLoading, data.length]);

    // --- EXPORT HELPERS ---
    const stripHtml = (html: string) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };

    const getExportData = (mode: "raw" | "filtered", customData?: any[]) => {
        // If customData (from API) is provided, use it directly. 
        // Note: We bypass 'filtered' mode for customData as we can't easily apply table filters to raw external data 
        // without processing it through the table instance first.
        const rows = customData
            ? customData
            : (mode === "raw" ? data : table.getFilteredRowModel().rows.map((row) => row.original));

        const visibleCols = columnConfigs.filter(
            (c) => c.key !== "actions" && columnVisibility[c.key] !== false
        );
        return { rows, visibleCols };
    };

    const performExcelExport = (mode: "raw" | "filtered" = "raw", customData?: any[]) => {
        const { rows, visibleCols } = getExportData(mode, customData);
        const headerText = stripHtml(printHeader || fileName || "Export");

        const excelData = rows.map((row) => {
            const newRow: Record<string, any> = {};
            visibleCols.forEach((col) => {
                let val = row[col.key];

                // 1. Handle Number Types
                if (col.type === "number") {
                    if (typeof val === "string") {
                        // Remove currency symbols, commas, etc., keep only numbers, dots, and minus
                        const cleanVal = val.replace(/[^0-9.-]+/g, "");
                        const num = parseFloat(cleanVal);
                        val = isNaN(num) ? 0 : num;
                    } else {
                        val = Number(val) || 0;
                    }
                }
                // 2. Handle Date Types
                else if (col.type === "date") {
                    if (val) {
                        const dateObj = new Date(val);
                        // If valid date, pass the object (SheetJS handles formatting)
                        if (!isNaN(dateObj.getTime())) {
                            val = dateObj;
                        }
                    }
                }
                // 3. Handle Booleans (optional visual improvement)
                else if (col.type === "boolean") {
                    val = val ? "Yes" : "No";
                }

                newRow[col.value] = val;
            });
            return newRow;
        });

        const wb = XLSX.utils.book_new();
        // Create sheet
        const ws = XLSX.utils.json_to_sheet([]);

        // Add Header
        XLSX.utils.sheet_add_aoa(ws, [[headerText]], { origin: "A1" });
        XLSX.utils.sheet_add_aoa(ws, [[]], { origin: "A2" }); // Empty row

        // Add Data
        // cellDates: true ensures Date objects are formatted as Excel Dates, not raw numbers
        XLSX.utils.sheet_add_json(ws, excelData, {
            origin: "A3",
            skipHeader: false,
            cellDates: true
        });

        // Merge Header
        if (visibleCols.length > 1) {
            ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: visibleCols.length - 1 } }];
        }

        // Add AutoFilter
        const ref = ws["!ref"];
        if (ref) {
            const range = XLSX.utils.decode_range(ref);
            range.s.r = 2; // Start filter at row 3 (index 2)
            ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
        }

        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `${fileName || "export"}_${format(new Date(), "yyyyMMdd")}.xlsx`);
    };

    const performCsvExport = (mode: "raw" | "filtered", customData?: any[]) => {
        const { rows, visibleCols } = getExportData(mode, customData);
        const csvData = rows.map((row) => {
            const newRow: Record<string, any> = {};
            visibleCols.forEach((col) => {
                newRow[col.value] = row[col.key];
            });
            return newRow;
        });
        const ws = XLSX.utils.json_to_sheet(csvData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName || "export"}_${format(new Date(), "yyyyMMdd")}_${mode}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const performPdfExport = (mode: "raw" | "filtered", customData?: any[]) => {
        const { rows, visibleCols } = getExportData(mode, customData);
        const orientation = pdfSettings.orientation || (visibleCols.length > 8 ? "landscape" : "portrait");

        const doc = new jsPDF({
            orientation,
            unit: pdfSettings.unit,
            format: pdfSettings.format,
        });

        const headerText = stripHtml(printHeader || fileName || "Export");
        doc.setFontSize(14);
        doc.text(headerText, (doc.internal.pageSize.width / 2), 25, { align: 'center' });

        const head = [visibleCols.map(c => c.value)];
        const body = rows.map(row => visibleCols.map(c => {
            const val = row[c.key];
            return val !== null && val !== undefined ? String(val) : "";
        }));

        const columnStyles: Record<string, any> = {};
        visibleCols.forEach((col, index) => {
            if (col.type === "number") {
                columnStyles[index] = { halign: "right" };
            }
        });

        autoTable(doc, {
            startY: 35,
            head: head,
            body: body,
            styles: { fontSize: 8, cellWidth: 'auto' },
            headStyles: { fillColor: [41, 128, 185] },
            columnStyles: columnStyles,
            margin: pdfSettings.margins,
            theme: 'grid'
        });

        doc.save(`${fileName || "export"}_${format(new Date(), "yyyyMMdd")}_${mode}.pdf`);
    };

    const handleExport = async (type: "excel" | "csv" | "pdf", mode: "raw" | "filtered" = "raw") => {
        if (onExport) {
            onExport(type, mode);
            return;
        }

        let exportData: any[] | undefined = undefined;

        if (exportApiString) {
            try {
                updateLoading(true);
                const response = await api.get(exportApiString);
                if (response.data.type === "success") {
                    exportData = response.data.data;
                } else {
                    toast.error("Failed to fetch export data");
                    updateLoading(false);
                    return;
                }
            } catch (error) {
                toast.error(String(error) || "Error fetching export data");
                updateLoading(false);
                return;
            } finally {
                updateLoading(false);
            }
        }

        if (type === "excel") performExcelExport(mode, exportData);
        if (type === "csv") performCsvExport(mode, exportData);
        if (type === "pdf") performPdfExport(mode, exportData);
    };

    // --- TABLE INSTANCE ---
    const advancedFilterFn: FilterFn<any> = (
        row,
        columnId,
        filterValue: CustomColumnFilterValue
    ) => {
        if (!filterValue) return true;
        const cellValue = row.getValue(columnId);
        const stringValue = String(cellValue).toLowerCase();

        if (filterValue.condition) {
            const { operator, value } = filterValue.condition;
            const numValue = Number(cellValue);
            const numCondValue = Number(value);

            switch (operator) {
                case "equals":
                    if (value != cellValue) return false;
                    break;
                case "greater":
                    if (numValue <= numCondValue) return false;
                    break;
                case "less":
                    if (numValue >= numCondValue) return false;
                    break;
                case "greaterEqual":
                    if (numValue < numCondValue) return false;
                    break;
                case "lessEqual":
                    if (numValue > numCondValue) return false;
                    break;
                case "between": {
                    const [min, max] = value as [number, number];
                    if (numValue < min || numValue > max) return false;
                    break;
                }
                case "notEqual":
                    if (value == cellValue) return false;
                    break;
                case "contains":
                    if (!stringValue.includes(String(value).toLowerCase())) return false;
                    break;
                case "startsWith":
                    if (!stringValue.startsWith(String(value).toLowerCase()))
                        return false;
                    break;
                case "endsWith":
                    if (!stringValue.endsWith(String(value).toLowerCase())) return false;
                    break;
                case "notContains":
                    if (stringValue.includes(String(value).toLowerCase())) return false;
                    break;
            }
        }
        if (filterValue.values?.selected) {
            // Defensive Check: Handle both Set (correct) and Array (legacy/serialized)
            // Cast to 'any' to avoid TS error: Property 'has' does not exist on type 'never'.
            const sel = filterValue.values.selected as any;
            if (sel instanceof Set) {
                if (!sel.has(String(cellValue))) return false;
            } else if (Array.isArray(sel)) {
                // Fallback for any legacy array state not caught by hydration
                if (!sel.includes(String(cellValue))) return false;
            }
        }
        return true;
    };

    const columns = useMemo<
        ColumnDef<Record<string, string | number | Date | boolean>>[]
    >(() => {
        // if (data.length === 0) return []; // Don't return empty based on data, allow columns to exist so headers show
        const baseColumns: ColumnDef<
            Record<string, string | number | Date | boolean>
        >[] = columnConfigs.map((config: ColumnConfig) => ({
            accessorKey: config.key,
            id: config.key,
            header: ({ column, table }) => (
                <TableColumnHeader column={column} config={config} data={table.options.data as any[]} table={table} />
            ),
            enableColumnFilter: true,
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
            } : (config.type === "number") ? (rowA, rowB, columnId) => {
                const valA = rowA.getValue(columnId);
                const valB = rowB.getValue(columnId);
                const cleanA = String(valA ?? "0").replace(/[^0-9.-]+/g, "");
                const cleanB = String(valB ?? "0").replace(/[^0-9.-]+/g, "");
                const numA = parseFloat(cleanA);
                const numB = parseFloat(cleanB);
                const a = isNaN(numA) ? 0 : numA;
                const b = isNaN(numB) ? 0 : numB;
                return a < b ? -1 : a > b ? 1 : 0;
            } : "auto",
            cell: ({ row }) => {
                const val = row.getValue(config.key);
                const value = val;
                const isDateColumn = config.type === "date" || /date/i.test(config.key);
                const isLinkColumn = config.type === "link";
                const isTimeColumn = config.type === "time" || /time/i.test(config.key);
                const isNumberColumn = config.type === "number";
                const isBadgeColumn = config.type === "badge";
                const isFileColumn = config.type === "file";

                if (config.customRender) {
                    return config.customRender(value, row.original, row.index);
                }

                if (isDateColumn) {
                    if (!value || value === null || value === "null" || value === "") {
                        return <div className="text-left font-medium">-</div>;
                    }
                    try {
                        let dateString = String(value).trim();
                        if (dateString.includes(" ") && dateString.match(/^\d{2}-\d{2}-\d{4}/)) {
                            dateString = dateString.split(" ")[0];
                            const [day, month, year] = dateString.split("-");
                            const dateValue = new Date(`${year}-${month}-${day}`);
                            if (!isNaN(dateValue.getTime())) return <div style={config.style?.(row.original)} className="text-left font-medium">{formatDateReverse(dateValue)}</div>;
                        }
                        else if (dateString.includes("T") || (dateString.includes(" ") && dateString.match(/^\d{4}-\d{2}-\d{2}/))) {
                            if (dateString.includes("T")) dateString = dateString.split("T")[0];
                            else if (dateString.includes(" ")) dateString = dateString.split(" ")[0];
                            const dateValue = new Date(dateString);
                            if (!isNaN(dateValue.getTime())) return <div style={config.style?.(row.original)} className="text-left font-medium">{formatDateReverse(dateValue)}</div>;
                        }
                        else {
                            const dateValue = new Date(dateString);
                            if (!isNaN(dateValue.getTime())) return <div style={config.style?.(row.original)} className="text-left font-medium">{formatDateReverse(dateValue)}</div>;
                        }
                    } catch (e) { /* ignore date parse errors */ }
                    return <div style={config.style?.(row.original)} className="text-left font-medium">-</div>;
                }
                if (isTimeColumn && value) {
                    return (
                        <div style={config.style?.(row.original)} className={cn("text-left font-medium", config.className)}>
                            {String(value).split("T")[1]?.split(".")[0] || "-"}
                        </div>
                    );
                }
                if (isLinkColumn && value) {
                    const baseUrl = config.specific || "";
                    const params = new URLSearchParams();
                    Object.entries(row.original).forEach(([key, val]) => {
                        if (val !== null && val !== undefined)
                            params.append(key, String(val));
                    });
                    const separator = baseUrl.includes("?") ? "&" : "?";
                    const finalHref = `${baseUrl}${separator}${params.toString()}`;
                    return (
                        <div style={config.style?.(row.original)} className={cn("underline text-blue-600 hover:text-blue-800 transition-colors", config.className)}>
                            <Link to={finalHref}>{String(value) || "-"}</Link>
                        </div>
                    );
                }
                if (isBadgeColumn && config.colorMap) {
                    if (value === null || value === undefined || value === "") return <div className="text-left font-medium">-</div>;
                    let displayValue = String(value);
                    if (typeof value === "boolean") displayValue = String(value);
                    const colorConfig = config.colorMap.find((item: any) => item.value === displayValue);
                    if (colorConfig) {
                        return (
                            <div className={cn("inline-flex px-2.5 py-0.5 my-2 rounded-full text-xs font-medium", config.className)}
                                style={{ ...config.style?.(row.original), backgroundColor: colorConfig.bgColor, color: colorConfig.foregroundColor }}>
                                {String(colorConfig?.printValue ?? displayValue)}
                            </div>
                        );
                    }
                    return <div style={config.style?.(row.original)} className={cn("text-left font-medium", config.className)}>{displayValue || "-"}</div>;
                }

                if (isFileColumn && value) {
                    const specific = config.specific?.toLowerCase();
                    const fileStr = String(value);
                    if (specific === "image") {
                        return (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className={cn("cursor-pointer hover:opacity-80 transition-opacity", config.className)}>
                                        <img src={fileStr} alt="Cell content" className="w-8 h-8 rounded-md object-cover border border-muted" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl p-1 bg-background border-none">
                                    <DialogClose autoFocus className="bg-muted-foreground/20 hover:bg-muted-foreground/40 rounded-full relative z-30 p-1" asChild>
                                        <X className="min-w-4 min-h-4" />
                                    </DialogClose>
                                    <img src={fileStr} alt="Preview" className="w-full h-auto rounded-lg" style={{ maxHeight: "80vh" }} />
                                </DialogContent>
                            </Dialog>
                        );
                    }
                    let Icon = FileText;
                    if (specific === "pdf") Icon = FileType;
                    else if (specific === "excel" || specific === "xlsx" || specific === "csv") Icon = FileSpreadsheet;
                    else if (specific === "json") Icon = FileJson;
                    else if (specific === "zip" || specific === "rar") Icon = FileArchive;
                    return (
                        <div className="flex items-center justify-center w-full">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Icon className={cn("w-4 h-4 text-muted-foreground hover:text-primary cursor-help", config.className)} />
                                    </TooltipTrigger>
                                    <TooltipContent><p className="text-xs">{specific?.toUpperCase()} File</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                }

                let displayValue = value !== null && value !== undefined ? String(value) : "-";
                if (isNumberColumn && config.specific === "currency" && value !== null && value !== undefined) {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) displayValue = numValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }

                return (
                    <div style={config.style?.(row.original)} className={cn("font-medium items-center", config.className, isNumberColumn && config.specific === "currency" ? "flex justify-between" : "", isNumberColumn ? "text-right" : "text-left")}>
                        {isNumberColumn && config.specific === "currency" ? (<><span>{config.symbol}</span><span className="text-right">{displayValue}</span></>) : (displayValue)}
                    </div>
                );
            },
            aggregationFn: (columnId: string, leafRows: any[]) => {
                return leafRows.reduce((sum: number, row: any) => {
                    const val = row.getValue(columnId);
                    const num = Number(val);
                    return sum + (isNaN(num) ? 0 : num);
                }, 0);
            },
            aggregatedCell: ({ cell }) => {
                if (total_row.includes(config.key) && config.type === "number") {
                    const val = cell.getValue();
                    const formatted = Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return (
                        <div className="font-bold text-blue-700 flex justify-between w-full">
                            {config.specific === "currency" ? <span>{config.symbol}</span> : <span />}
                            <span className="text-right">{formatted}</span>
                        </div>
                    );
                }
                return null;
            },
        }));

        if ((customActions || master_id) && editButtonLink && (!CRUD || CRUD.update == true) && canUpdate) {
            baseColumns.push({
                id: "actions",
                accessorKey: "actions",
                header: () => <div className="text-center">Actions</div>,
                enableHiding: false,
                cell: ({ row }) => (
                    <div className="flex items-center justify-start gap-2">
                        {master_id && editButtonLink && (!isRowDeleted || !isRowDeleted(row.original)) && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            to={editButtonLink + row.original[master_id]}
                                            onClick={(e) => {
                                                if (preventActionClickRowExpansion !== false) e.stopPropagation();
                                            }}
                                            className="p-2 hover:bg-muted rounded-full"
                                        >
                                            <Pen className="w-4 h-4" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {customActions?.map((action, idx) => {
                            if (action.permission && !usePermission(action.permission)) return null;
                            if (action.showCondition && !action.showCondition(row.original)) return null;
                            const icon = typeof action.icon === "function" ? action.icon(row.original, row.index) : action.icon;
                            const isDropdown = React.isValidElement(icon) && icon.type && (typeof icon.type === "function" ? icon.type.name === "DropdownMenu" : typeof icon.type === "object" && "name" in icon && icon.type && (icon.type as any).name === "DropdownMenu");
                            if (isDropdown) {
                                return <div key={idx} onClick={(e) => { if (preventActionClickRowExpansion !== false) e.stopPropagation(); }}>{icon}</div>;
                            }
                            return (
                                <TooltipProvider key={idx}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={(e) => {
                                                    if (preventActionClickRowExpansion !== false) e.stopPropagation();
                                                    if (action.onClick) action.onClick(row.original, row.index);
                                                }}
                                                className="hover:bg-muted rounded-full p-2"
                                            >
                                                {icon}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>{action.label}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                ),
            } as ColumnDef<Record<string, string | number | Date | boolean>>);
        }
        return baseColumns;
    }, [columnConfigs, customActions, master_id, editButtonLink, CRUD, diff_columns, isRowDeleted, preventActionClickRowExpansion, canUpdate]);

    const table = useReactTable({
        data,
        columns,
        state: {
            grouping,
            expanded,
            columnOrder,
            globalFilter,
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            columnPinning,
            pagination: controlledPagination ?? pagination,
        },
        initialState: { pagination: { pageIndex: 0, pageSize: 250 } },
        enablePinning: true,
        manualPagination,
        manualFiltering,
        rowCount,
        onColumnPinningChange: setColumnPinning,
        autoResetPageIndex: !manualPagination,
        autoResetExpanded: false,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        onColumnOrderChange: setColumnOrder,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: onPaginationChange ?? setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        filterFns: { advancedFilter: advancedFilterFn },
        getColumnCanGlobalFilter: (col) => {
            const config = columnConfigs.find((c) => c.key === col.id);
            return config ? config.type === "text" || config.type === "number" : false;
        },
    });

    // Virtualization removed for simplicity and stability as per user request

    const renderGroupTotals = (row: any) => {
        if (!row.subRows?.length || !total_row.length) return null;
        return (
            <TableRow className="bg-muted/30">
                {table.getVisibleLeafColumns().map((column) => {
                    if (column.id === table.getVisibleLeafColumns()[0].id)
                        return <TableCell key={column.id} className="font-bold text-right" colSpan={1}>Subtotal:</TableCell>;
                    if (total_row.includes(column.id)) {
                        const total = row.subRows.reduce((sum: number, r: any) => {
                            const isDeleted = isRowDeleted && isRowDeleted(r.original);
                            return isDeleted ? sum : sum + (Number(r.original[column.id]) || 0);
                        }, 0);
                        const config = columnConfigs.find((c) => c.key === column.id);
                        return (
                            <TableCell key={column.id} className="text-right font-bold text-blue-700">
                                {config?.specific === "currency" ? config.symbol : ""}{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                        );
                    }
                    return <TableCell key={column.id} />;
                })}
            </TableRow>
        );
    };

    const columnTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        if (!total_row.length) return totals;

        const rows = table.getFilteredRowModel().rows;

        total_row.forEach((key) => {
            totals[key] = rows.reduce((sum, row) => {
                const isDeleted = isRowDeleted && isRowDeleted(row.original);
                return isDeleted ? sum : sum + (Number(row.original[key]) || 0);
            }, 0);
        });
        return totals;
    }, [table.getFilteredRowModel().rows, total_row]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!columnFocus) return;
        shouldScrollToRow.current = true;
        const scrollAmount = 300; // Little bit of scroll
        const horizontalScrollAmount = 50;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedRowIndex((prev) => Math.min(table.getRowModel().rows.length - 1, prev + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedRowIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const row = table.getRowModel().rows[focusedRowIndex];
            if (row && onRowClick) onRowClick(row.original, focusedRowIndex);
        } else if (e.key === "PageUp") {
            e.preventDefault();
            if (tableRef.current) tableRef.current.scrollTop -= scrollAmount;
        } else if (e.key === "PageDown") {
            e.preventDefault();
            if (tableRef.current) tableRef.current.scrollTop += scrollAmount;
        } else if (e.key === "Home") {
            e.preventDefault();
            if (tableRef.current) {
                tableRef.current.scrollTop = 0;
                tableRef.current.scrollLeft = 0;
            }
        } else if (e.key === "End") {
            e.preventDefault();
            if (tableRef.current) {
                tableRef.current.scrollTop = tableRef.current.scrollHeight;
                tableRef.current.scrollLeft = tableRef.current.scrollWidth;
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (tableRef.current) tableRef.current.scrollLeft -= horizontalScrollAmount;
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            if (tableRef.current) tableRef.current.scrollLeft += horizontalScrollAmount;
        }
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const hasModifier = e.altKey || e.metaKey || e.ctrlKey;
            if (!hasModifier) return;

            const code = e.code;
            console.log(`Table Shortcut Triggered: code=${code}, alt=${e.altKey}, meta=${e.metaKey}, ctrl=${e.ctrlKey}`);

            // Keyboard shortcuts (Alt/Option or Cmd based)
            switch (code) {
                case "KeyN":
                    if (addButtonLink) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Table Add New triggered!");
                        navigate({ pathname: addButtonLink, search: location.search, hash: location.hash });
                    }
                    break;
                case "KeyG":
                    e.preventDefault();
                    e.stopPropagation();
                    setGroupDropdownOpen((prev) => !prev);
                    break;
                case "KeyH":
                    e.preventDefault();
                    e.stopPropagation();
                    setColumnsDropdownOpen((prev) => !prev);
                    break;
                case "KeyS":
                case "KeyF": // Some users use F for filter/search
                    e.preventDefault();
                    e.stopPropagation();
                    searchInputRef.current?.focus();
                    break;
                case "KeyR":
                    e.preventDefault();
                    e.stopPropagation();
                    if (onReload) onReload(); else getDataAPICall();
                    break;
                case "KeyD": {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Alt D triggered!");
                    // Trigger first delete button in table if exists
                    const deleteBtn = document.querySelector('button.text-destructive');
                    if (deleteBtn instanceof HTMLButtonElement) deleteBtn.click();
                    break;
                }
                default: break;
            }
        };
        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [addButtonLink, reload, data, navigate, location]);

    // Check if filters are active
    const hasActiveFilters = columnFilters.length > 0 || !!globalFilter;

    // Total rows display
    const totalRows = manualPagination ? rowCount || 0 : table.getFilteredRowModel().rows.length;

    if (!canRead) {
        return (
            <div className={cn("flex flex-col items-center justify-center p-12 space-y-4 border rounded-lg bg-muted/20", className)}>
                <div className="p-4 bg-destructive/10 rounded-full text-destructive">
                    <EyeOff className="h-12 w-12" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Access Denied</h3>
                    <p className="text-sm text-muted-foreground">You do not have permission to view this data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4 outline-none w-full max-w-full overflow-hidden flex flex-col h-full min-h-0 min-w-0", className)} onKeyDown={handleKeyDown} tabIndex={0} ref={tableContainerRef}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                {search && (
                    <div className="w-full sm:max-w-md relative bg-card rounded-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Global Search... (Alt + S)"
                            value={globalFilter ?? ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setGlobalFilter(val);
                                if (onSearchChange) onSearchChange(val);
                            }}
                            className="pl-9"
                        />
                    </div>
                )}
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    {reload && (
                        <div className={cn(!showReloadMobile && "hidden sm:block")}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button size="sm" variant="outline" onClick={onReload || getDataAPICall}><RotateCw className="h-4 w-4" /></Button></TooltipTrigger>
                                    <TooltipContent>Reload (Alt + R)</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                    <div className={cn(!showGroupByMobile && "hidden sm:block")}>
                        <DropdownMenu open={groupDropdownOpen} onOpenChange={setGroupDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><Group className="h-4 w-4" /></TooltipTrigger>
                                            <TooltipContent>Group (Alt + G)</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table.getAllColumns().filter((c) => c.getCanGroup()).map((column) => (
                                    <DropdownMenuCheckboxItem key={column.id} checked={column.getIsGrouped()} onCheckedChange={(val) => val ? column.toggleGrouping() : column.toggleGrouping()}>
                                        {columnConfigs.find((c) => c.key === column.id)?.value || column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className={cn(!showColumnsMobile && "hidden sm:block")}>
                        <DropdownMenu open={columnsDropdownOpen} onOpenChange={setColumnsDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><EyeOff className="h-4 w-4" /></TooltipTrigger>
                                            <TooltipContent>Hide/View Columns (Alt + H)</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                                {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
                                    <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(val) => column.toggleVisibility(!!val)}>
                                        {columnConfigs.find((c) => c.key === column.id)?.value || column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* EXPORT DROPDOWN */}
                    {(canExportExcel || canExportCsv || canExportPdf || canExportEmail) && (
                        <div className={cn(!showExportMobile && "hidden sm:block")}>
                            <DropdownMenu open={exportDropdownOpen} onOpenChange={setExportDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={!data.length}>
                                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {printOptions.includes("excel") && canExportExcel && (
                                        <DropdownMenuItem onClick={() => handleExport("excel")}>
                                            <FileSliders className="mr-2 h-4 w-4" />
                                            Download Excel (Raw)
                                        </DropdownMenuItem>
                                    )}
                                    {printOptions.includes("csv") && canExportCsv && (
                                        hasActiveFilters ? (
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                    Download CSV
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => handleExport("csv", "raw")}>Raw Data</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleExport("csv", "filtered")}>Filtered Data</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        ) : (
                                            <DropdownMenuItem onClick={() => handleExport("csv", "raw")}>
                                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                Download CSV
                                            </DropdownMenuItem>
                                        )
                                    )}
                                    {printOptions.includes("pdf") && canExportPdf && (
                                        hasActiveFilters ? (
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <File className="mr-2 h-4 w-4" />
                                                    Download PDF
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => handleExport("pdf", "raw")}>Raw Data</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleExport("pdf", "filtered")}>Filtered Data</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                        ) : (
                                            <DropdownMenuItem onClick={() => handleExport("pdf", "raw")}>
                                                <File className="mr-2 h-4 w-4" />
                                                Download PDF
                                            </DropdownMenuItem>
                                        )
                                    )}
                                    {canExportEmail && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Email Report
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {addButtonLink && (!CRUD || CRUD.create == true) && canCreate && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button size="sm" asChild><Link to={addButtonLink}><Plus className="mr-2 h-4 w-4" /> {addButtonText}</Link></Button></TooltipTrigger>
                                <TooltipContent>Create New (Alt + N)</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            {grouping.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-md">
                    <span className="text-sm font-medium self-center">Grouped by:</span>
                    {grouping.map((g) => (
                        <div key={g} className="flex items-center bg-background border px-2 py-1 rounded text-xs shadow-sm">
                            {columnConfigs.find((c) => c.key === g)?.value || g}
                            <X className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setGrouping((prev) => prev.filter((i) => i !== g))} />
                        </div>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setGrouping([])}>Clear</Button>
                </div>
            )}

            {(columnFilters.length > 0 || sorting.length > 0) && (
                <div className="flex flex-wrap gap-2 p-2 bg-muted/30 border-t border-b mb-2">
                    <span className="text-sm font-medium self-center text-muted-foreground flex items-center gap-1"><ListFilter className="h-3 w-3" /> Filters & Sorts:</span>
                    {sorting.map((sort) => {
                        const config = columnConfigs.find((c) => c.key === sort.id);
                        return (
                            <div key={`sort-${sort.id}`} className="flex items-center border px-2 py-1 rounded text-xs shadow-sm gap-1 animate-in fade-in zoom-in-95 duration-200 border-blue-200 bg-blue-50/30">
                                <span className="font-semibold text-primary/80">{config?.value || sort.id}:</span>
                                <span>{config?.type === "number" ? (sort.desc ? "Large to Small" : "Small to Large") : (sort.desc ? "Z to A" : "A to Z")}</span>
                                <X className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1 rounded-full hover:bg-muted" onClick={() => setSorting(prev => prev.filter(s => s.id !== sort.id))} />
                            </div>
                        );
                    })}
                    {columnFilters.map((filter) => {
                        const column = table.getColumn(filter.id);
                        const config = columnConfigs.find((c) => c.key === filter.id);
                        const filterVal = filter.value as CustomColumnFilterValue;
                        let displayValue = "";
                        if (filterVal?.condition) {
                            const opMap: Record<string, string> = { contains: "contains", equals: "=", greater: ">", less: "<", greaterEqual: ">=", lessEqual: "<=", notEqual: "!=", startsWith: "starts with", endsWith: "ends with", between: "between" };
                            const op = opMap[filterVal.condition.operator] || filterVal.condition.operator;
                            const val = Array.isArray(filterVal.condition.value) ? `${filterVal.condition.value[0]} - ${filterVal.condition.value[1]}` : String(filterVal.condition.value);
                            displayValue = `${op} "${val}"`;
                        } else if (filterVal?.values?.selected) {
                            // Defensive Check: Handle both Set (correct) and Array (legacy/serialized)
                            const sel = filterVal.values.selected as any;
                            const count = (sel instanceof Set) ? sel.size : (Array.isArray(sel) ? sel.length : 0);

                            displayValue = count > 3 ? `${count} items selected` : Array.from(sel as any).map(val => {
                                if (config?.type === "badge" && config.colorMap) {
                                    const mapping = config.colorMap.find(m => m.value === String(val));
                                    return mapping?.printValue || val;
                                }
                                return val;
                            }).join(", ");
                        }
                        if (!displayValue) return null;
                        return (
                            <div key={filter.id} className="flex items-center bg-background border px-2 py-1 rounded text-xs shadow-sm gap-1 animate-in fade-in zoom-in-95 duration-200">
                                <span className="font-semibold text-primary/80">{config?.value || filter.id}:</span>
                                <span className="max-w-[150px] truncate" title={displayValue}>{displayValue}</span>
                                <X className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1 rounded-full hover:bg-muted" onClick={() => column?.setFilterValue(undefined)} />
                            </div>
                        );
                    })}
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setColumnFilters([]); setSorting([]); }}>Clear All</Button>
                </div>
            )}

            {activeLoading ? <LottieLoading /> : (
                <div className="rounded-md border overflow-hidden relative w-full flex flex-col flex-1 min-h-0 min-w-0">
                    <div ref={tableRef} className="overflow-auto relative [&::-webkit-scrollbar-track:vertical]:mt-10 w-full max-w-full flex-1 min-h-0" style={{ maxHeight: tableHeight }}>
                        <div className="[&_div[data-slot=table-container]]:overflow-visible w-full min-w-0">
                            <Table style={{ minWidth: table.getTotalSize() }}>
                                <TableHeader className="sticky top-0 bg-background z-30 shadow-sm">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} className="px-0" style={{ ...getCommonPinningStyles(header.column), width: header.getSize() }}>
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
                                            const isFocused = columnFocus && focusedRowIndex === index;
                                            const isDeleted = isRowDeleted && isRowDeleted(row.original);
                                            return (
                                                <React.Fragment key={row.id}>
                                                    <TableRow
                                                        id={`table-row-${index}`}
                                                        data-state={row.getIsSelected() && "selected"}
                                                        className={cn(
                                                            "hover:bg-primary/20 transition-colors",
                                                            (dropdown || (columnFocus && onRowClick)) ? "cursor-pointer" : "",
                                                            isFocused ? "bg-primary/20" : "",
                                                            isDeleted ? "bg-destructive/10 hover:bg-destructive/20" : ""
                                                        )}
                                                        onClick={() => {
                                                            if (dropdown) row.toggleExpanded();
                                                            else if (columnFocus && onRowClick) {
                                                                setFocusedRowIndex(index);
                                                                onRowClick(row.original, index);
                                                            }
                                                        }}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id} className={cn("px-2 py-0", cell.column.getIsPinned() && "bg-accent/60")} style={{ ...getCommonPinningStyles(cell.column), width: cell.column.getSize() }}>
                                                                <div className={cn(isDeleted && "line-through text-muted-foreground")}>
                                                                    {cell.getIsGrouped() ? (
                                                                        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={(e) => { e.stopPropagation(); row.toggleExpanded(); }}>
                                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">{row.getIsExpanded() ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}</Button>
                                                                            <span className="font-medium">{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                                                                            <span className="text-muted-foreground text-xs">({row.subRows.length})</span>
                                                                        </div>
                                                                    ) : cell.getIsAggregated() ? (
                                                                        flexRender(cell.column.columnDef.aggregatedCell, cell.getContext())
                                                                    ) : cell.getIsPlaceholder() ? null : (
                                                                        flexRender(cell.column.columnDef.cell, cell.getContext())
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                    {row.getIsExpanded() && dropdown && renderDropdownContent && !row.getIsGrouped() && (
                                                        <TableRow className="hover:bg-muted/50 bg-muted/20">
                                                            <TableCell colSpan={columns.length} className="p-0 border-b-2 border-primary/10">
                                                                <div className="w-full p-4 animate-in slide-in-from-top-2 duration-200">{renderDropdownContent(row.original, index)}</div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                    {row.getIsExpanded() && renderGroupTotals(row)}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>
                                    )}
                                </TableBody>
                                {total_row.length > 0 && (
                                    <ShadcnTableFooter className="sticky bottom-0 bg-background border-t z-10 space-y-0 gap-y-0">
                                        <TableRow>
                                            {table.getAllColumns().filter((c) => c.getIsVisible()).map((column, idx) => (
                                                <TableCell key={column.id} style={{ ...getCommonPinningStyles(column) }} className={cn(column.getIsPinned() && "")}>
                                                    {idx === 0 && <span className="font-bold">Total</span>}
                                                    {total_row.includes(column.id) && (
                                                        <div className="flex justify-between w-full">
                                                            <span>{columnConfigs.find((c) => c.key === column.id)?.symbol}</span>
                                                            <span className="text-right font-bold">{columnTotals[column.id]?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>

                                        {diff_columns && diff_columns.length > 0 && total_row && (
                                            diff_columns.map((pair, diffIdx) => {
                                                if (pair.length !== 2 || !total_row.includes(pair[0]) || !total_row.includes(pair[1])) return null;
                                                return (
                                                    <TableRow key={`diff-${diffIdx}`} className="bg-background text-blue-700">
                                                        {table.getAllColumns().filter((c) => c.getIsVisible()).map((column, idx) => {
                                                            const diffValue = (columnTotals[pair[0]] || 0) - (columnTotals[pair[1]] || 0);
                                                            const currentTitle = diff_title && diff_title[diffIdx] ? diff_title[diffIdx] : "Difference";
                                                            return (
                                                                <TableCell key={column.id} style={{ ...getCommonPinningStyles(column) }} className={cn(column.getIsPinned() && "")}>
                                                                    {idx === 0 && <span className="font-bold">{currentTitle}</span>}
                                                                    {column.id === pair[1] && (
                                                                        <div className="flex justify-between w-full">
                                                                            <span>{columnConfigs.find((c) => c.key === column.id)?.symbol}</span>
                                                                            <span className="text-right font-bold">{diffValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </ShadcnTableFooter>
                                )}
                            </Table>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 py-2 border-t bg-background">
                        <div className="text-sm text-muted-foreground hidden sm:block">{data?.[0]?.total_count || totalRows} row(s) total</div>
                        <div className="flex items-center gap-4">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <HelpCircle className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle className="sub-heading">Column & Action Dictionary</SheetTitle>
                                    </SheetHeader>

                                    <div className="space-y-6 p-4">
                                        {columnConfigs.some(c => c.help) && (
                                            <div>
                                                <h4 className="font-bold border-b pb-2 mb-4">Columns</h4>
                                                {columnConfigs.filter(c => c.help).map((c, idx) => (
                                                    <div key={idx} className="mb-4">
                                                        <h5 className="font-semibold text-sm">{c.value}</h5>
                                                        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{c.help}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {customActions && customActions.some(a => a.help) && (
                                            <div>
                                                <h4 className="font-bold border-b pb-2 mb-4">Actions</h4>
                                                {customActions.map((action, idx) => (
                                                    <ActionHelpItem key={idx} action={action} />
                                                ))}
                                            </div>
                                        )}
                                        {!columnConfigs.some(c => c.help) && !(customActions && customActions.some(a => a.help)) && (
                                            <div className="text-center text-muted-foreground text-sm mt-10">
                                                No help descriptions available for this table.
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Popover>
                                <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Keyboard className="h-4 w-4" /></Button></PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-4">
                                        <h4 className="font-medium flex items-center gap-2 border-b pb-2"><Keyboard className="h-4 w-4" /> Keyboard Shortcuts</h4>
                                        <div className="grid gap-3 text-sm">
                                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Search</span><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Alt + S</kbd></div>
                                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Add New</span><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Alt + N</kbd></div>
                                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Row Nav</span><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">↑ / ↓ / Enter</kbd></div>
                                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Scroll</span><kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">PgUp/Dn/Home/End/←/→</kbd></div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Per page</span>
                                <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(val) => table.setPageSize(Number(val))}>
                                    <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
                                    <SelectContent side="top">
                                        {[5, 10, 20, 50, 100, 200, 250, 500, 1000].map((p) => <SelectItem key={p} value={`${p}`}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Email Report</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="email-address">Email Address</Label>
                            <Input
                                id="email-address"
                                placeholder="Enter recipient email..."
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Report Format</Label>
                            <Select value={emailFormat} onValueChange={(val: any) => setEmailFormat(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
                        <Button onClick={performEmailExport} disabled={emailLoading}>
                            {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}