// importing client
import api from "@/lib/api";

// importing from react
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// importing components
import { JSONNewDataTable } from "@/components/tables/json-new-data-table";

// importing icons
import {
    Check,
    ChevronsUpDown,
    Loader2
} from "lucide-react";

// importing utilities
import { cn } from "@/lib/utils";
import {
    AccountMasterDisplayType,
    BillingSetupData
} from "@/lib/types";
import { BILLING_HEADS_PERC_CALC_OVER } from "@/lib/constants";

const formatDateForInput = (date: string): string => {
    if (!date) return "";

    // Directly return if it's in correct format
    if (date.includes('-') && date.length === 10) {
        return date;
    }

    // For other date formats, try to extract YYYY-MM-DD
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return "";
};

// Form validation schema
const formSchema = z.object({
    bs_bill_item: z.string().min(1, "Bill head item is required").max(50, "Bill head item cannot exceed 50 characters"),
    bs_am_id: z.coerce.number().min(1, "Account is required"), // Use coerce.number()
    bs_bill_item_perc_amt: z.enum(["P", "A"], {
        required_error: "Please select percentage or amount",
    }),
    bs_bill_item_value: z.coerce.number().min(0, "Value must be at least 0"), // Use coerce.number()
    bs_start_date: z.string().min(1, "Start date is required"),
    bs_remarks: z.string().optional(),
    bs_perc_calc_over: z.string().optional().nullable(),
    bs_gst_yn: z.boolean(),
    bs_gst_perc: z.coerce.number().min(0).max(100),
}).superRefine((data, ctx) => {
    if (data.bs_bill_item_perc_amt === "P") {
        if (data.bs_bill_item_value > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.too_big,
                maximum: 100,
                type: "number",
                inclusive: true,
                message: "Percentage cannot exceed 100%",
                path: ["bs_bill_item_value"],
            });
        }
        if (!Number.isInteger(data.bs_bill_item_value)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Percentage must be a whole number",
                path: ["bs_bill_item_value"],
            });
        }
        if (!data.bs_perc_calc_over) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select on what this percentage is calculated",
                path: ["bs_perc_calc_over"],
            });
        }
    } else {
        if (data.bs_bill_item_value > 100000000) {
            ctx.addIssue({
                code: z.ZodIssueCode.too_big,
                maximum: 100000000,
                type: "number",
                inclusive: true,
                message: "Amount cannot exceed ₹10,00,00,000",
                path: ["bs_bill_item_value"],
            });
        }
    }
});

export function BillingSetupForm({
    billHeadItems,
    accountMasterItems, // Add this prop
    editingData,
}: {
    billHeadItems: string[];
    accountMasterItems: AccountMasterDisplayType[]; // Add this prop
    editingData?: BillingSetupData;
}) {
    const navigate = useNavigate();
    const [historyData, setHistoryData] = useState<Record<string, string | number | boolean | Date>[]>([]);

    const [loading, setLoading] = useState(false);
    const [billItemOpen, setBillItemOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false); // Add this state
    const [selectedBillItem, setSelectedBillItem] = useState<string | null>(
        editingData ? billHeadItems.find(item => item === editingData.bs_bill_item) || null : null
    );
    const [selectedAccount, setSelectedAccount] = useState<AccountMasterDisplayType | null>(
        editingData ? accountMasterItems.find(item => String(item.am_id) === String(editingData.bs_am_id)) || null : null
    );
    const [calcOverOpen, setCalcOverOpen] = useState(false);
    const [selectedCalcOver, setSelectedCalcOver] = useState<string | null>(
        editingData ? editingData.bs_perc_calc_over || null : null
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: editingData ? {
            bs_bill_item: editingData.bs_bill_item || "",
            bs_bill_item_perc_amt: editingData.bs_bill_item_perc_amt || "P",
            bs_bill_item_value: Number(editingData.bs_bill_item_value) || 0,
            bs_am_id: editingData.bs_am_id || 0,
            bs_start_date: formatDateForInput(String(editingData.bs_start_date)) || "",
            bs_remarks: editingData.bs_remarks || "",
            bs_perc_calc_over: editingData.bs_perc_calc_over || null,
            bs_gst_yn: editingData.bs_gst_yn || false,
            bs_gst_perc: Number(editingData.bs_gst_perc) || 0,
        } : {
            bs_bill_item: "",
            bs_bill_item_perc_amt: "P",
            bs_bill_item_value: 0,
            bs_am_id: 0,
            bs_start_date: "",
            bs_remarks: "",
            bs_perc_calc_over: null,
            bs_gst_yn: false,
            bs_gst_perc: 0,
        },
    });


    const watchType = form.watch("bs_bill_item_perc_amt");

    useEffect(() => {
        if (editingData) {
            form.reset({
                bs_bill_item: editingData.bs_bill_item,
                bs_bill_item_perc_amt: editingData.bs_bill_item_perc_amt,
                bs_bill_item_value: editingData.bs_bill_item_value,
                bs_am_id: editingData.bs_am_id,
                bs_start_date: formatDateForInput(String(editingData.bs_start_date)),
                bs_remarks: editingData.bs_remarks ?? "",
                bs_perc_calc_over: editingData.bs_perc_calc_over || null,
                bs_gst_yn: editingData.bs_gst_yn || false,
                bs_gst_perc: Number(editingData.bs_gst_perc) || 0,
            });

            const item = billHeadItems.find(item => item === editingData.bs_bill_item);
            setSelectedBillItem(item || null);

            const account = accountMasterItems.find(item =>
                Number(item.am_id) === Number(editingData.bs_am_id)
            );
            setSelectedAccount(account || null);

            if (editingData.bs_perc_calc_over) {
                const calcOver = billHeadItems.find(item => item === editingData.bs_perc_calc_over);
                setSelectedCalcOver(calcOver || null);
            }
        }
    }, [editingData, billHeadItems, accountMasterItems, form]);

    const watchBillHead = form.watch("bs_bill_item");
    const watchValue = form.watch("bs_bill_item_value");
    const watchCalcOver = form.watch("bs_perc_calc_over");

    useEffect(() => {
        async function getData() {
            try {
                const results = await api.get(`/billing/heads`, {
                    params: {
                        bs_id: watchBillHead
                    },
                });

                if (results.data.type === "success") {
                    setHistoryData(results.data.bill_head_history);
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (watchBillHead && watchBillHead.length > 0) {
            getData();
        }
    }, [watchBillHead]);

    async function handleSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);

        const submitData: BillingSetupData = {
            bs_bill_item: values.bs_bill_item,
            bs_bill_item_perc_amt: values.bs_bill_item_perc_amt,
            bs_bill_item_value: Number(values.bs_bill_item_value), // Ensure number
            bs_am_id: Number(values.bs_am_id), // Ensure number
            bs_start_date: values.bs_start_date,
            bs_remarks: values.bs_remarks ?? "",
            bs_perc_calc_over: values.bs_bill_item_perc_amt === "P" ? values.bs_perc_calc_over as string : "",
            bs_gst_yn: values.bs_gst_yn,
            bs_gst_perc: values.bs_gst_yn ? Number(values.bs_gst_perc) : 0,
        };

        try {
            // POST API CALL (Always create new version)
            const results = await api.post(`/billing/heads`, {
                ...submitData,
            });

            if (results.data.type === "success") {
                toast.success(results.data.message);
                navigate(-1);
            } else {
                toast.error(results.data.message);
            }
        } catch (error) {
            console.log("Error in the form: ", error);
            toast.error("Some unexpected error occured!");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="md:grid lg:grid-cols-2 gap-4 space-y-4 bg-background p-6 rounded-lg border col-span-1 md:col-span-2">
                        {/* Bill Head Item Selection */}
                        <FormField
                            control={form.control}
                            name="bs_bill_item"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Bill Head Item</FormLabel>
                                    <Popover open={billItemOpen} onOpenChange={setBillItemOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {selectedBillItem
                                                        ? selectedBillItem
                                                        : "Select bill head item..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                                            <Command>
                                                <CommandInput placeholder="Search bill head items..." />
                                                <CommandList>
                                                    <CommandEmpty>No bill head item found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {billHeadItems.map((item) => (
                                                            <CommandItem
                                                                value={item}
                                                                key={item}
                                                                onSelect={() => {
                                                                    form.setValue("bs_bill_item", item);
                                                                    setSelectedBillItem(item);
                                                                    setBillItemOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        String(field.value) === item
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {item}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Account Selection */}
                        <FormField
                            control={form.control}
                            name="bs_am_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Account</FormLabel>
                                    <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {selectedAccount ? `${selectedAccount.am_name}` : 'Select account...'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>

                                        <PopoverContent align="start" className="min-w-(--radix-popover-trigger-width) p-0">
                                            <Command>
                                                <CommandInput placeholder="Search accounts..." />
                                                <CommandList>
                                                    <CommandEmpty>No account found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {accountMasterItems.map((account) => (
                                                            <CommandItem
                                                                value={account.am_name}
                                                                key={account.am_id}
                                                                onSelect={() => {
                                                                    form.setValue("bs_am_id", Number(account.am_id));
                                                                    setSelectedAccount(account);
                                                                    setAccountOpen(false);
                                                                }}
                                                                className="w-full justify-between"
                                                            >
                                                                {account.am_id} - {account.am_name}

                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        String(field.value) === String(account.am_id)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bs_start_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            className="bg-background"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Percentage/Amount Toggle */}
                        <FormField
                            control={form.control}
                            name="bs_bill_item_perc_amt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Charge Type</FormLabel>
                                    <FormControl>
                                        <Tabs
                                            defaultValue={field.value}
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value as "P" | "A")}
                                            className="w-fit"
                                        >
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="P">Perc (%)</TabsTrigger>
                                                <TabsTrigger value="A">Flat Amt (₹)</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Value Input */}
                        <FormField
                            control={form.control}
                            name="bs_bill_item_value"
                            render={({ field }) => {
                                // Convert the value to a string for the input, but maintain number type in form
                                const stringValue = field.value === 0 ? "0" : String(field.value);

                                return (
                                    <FormItem>
                                        <FormLabel>
                                            {watchType === "P" ? "Percentage Value (0-100%)" : "Amount Value"}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder={
                                                    watchType === "P"
                                                        ? "Enter percentage (0-100)"
                                                        : "Enter amount"
                                                }
                                                min={0.00}
                                                max={watchType === "P" ? 100 : 100000000}
                                                step={0.01}
                                                value={stringValue}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Convert empty string to 0, otherwise parse as number
                                                    const numericValue = value === "" ? 0 : parseFloat(value);
                                                    field.onChange(numericValue);
                                                }}
                                                onBlur={(e) => {
                                                    // Ensure we have a valid number on blur
                                                    if (e.target.value === "") {
                                                        field.onChange(0);
                                                    }
                                                }}
                                                className="bg-background text-right"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        {watchType === "P" && (
                            <FormField
                                control={form.control}
                                name="bs_perc_calc_over"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Percentage Calculation Over</FormLabel>
                                        <Popover open={calcOverOpen} onOpenChange={setCalcOverOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {selectedCalcOver
                                                            ? selectedCalcOver
                                                            : "Select bill head item..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="min-w-full sm:w-sm p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search bill head items..." />
                                                    <CommandList>
                                                        <CommandEmpty>No bill head item found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {BILLING_HEADS_PERC_CALC_OVER.map((item) => (
                                                                <CommandItem
                                                                    value={item}
                                                                    key={item}
                                                                    onSelect={() => {
                                                                        form.setValue("bs_perc_calc_over", item);
                                                                        setSelectedCalcOver(item);
                                                                        setCalcOverOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            String(field.value) === item
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {item}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="bs_gst_yn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Collect GST</FormLabel>
                                        <FormControl>
                                            <Tabs
                                                value={field.value ? "yes" : "no"}
                                                onValueChange={(value) => {
                                                    const isYes = value === "yes";
                                                    field.onChange(isYes);
                                                    if (isYes && form.getValues("bs_gst_perc") === 0) {
                                                        form.setValue("bs_gst_perc", 18);
                                                    }
                                                }}
                                                className="w-full"
                                            >
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="no">No</TabsTrigger>
                                                    <TabsTrigger value="yes">Yes</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {form.watch("bs_gst_yn") && (
                                <FormField
                                    control={form.control}
                                    name="bs_gst_perc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GST (0-100%)</FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="18"
                                                        min={0}
                                                        max={100}
                                                        step={0.01}
                                                        value={field.value === 0 ? "" : field.value}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const numericValue = value === "" ? 0 : parseFloat(value);
                                                            field.onChange(numericValue);
                                                        }}
                                                        className="bg-background pr-10 text-right"
                                                    />
                                                </FormControl>
                                                <span className="absolute right-3 top-2 text-sm text-muted-foreground">%</span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>


                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="bs_remarks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Remarks</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="bg-background resize-none"
                                                placeholder="Enter your remarks here..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {(watchBillHead && watchValue !== undefined && watchValue !== null) && (
                            <div className="bg-primary/5 text-primary p-3 rounded-md text-sm border border-primary/20 italic col-span-2">
                                <strong className="text-foreground">Summary: </strong>
                                <br />
                                "{watchBillHead}" will be charged as{" "}
                                {watchType === "P" ? (
                                    <span className="font-semibold">{watchValue}% of {watchCalcOver ? `"${watchCalcOver}"` : "..."}</span>
                                ) : (
                                    <span className="font-semibold">a flat amount of ₹{watchValue}</span>
                                )}.
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-fit"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingData ? "Update Billing Setup" : "Save Billing Setup"}
                        </Button>
                    </form>
                </Form>

                <div className="border rounded-xl p-4 bg-background/80 lg:col-span-1 h-fit">
                    <h1 className="page-heading text-lg">Important Instructions:</h1>
                    <ul className="list-disc ml-5 mt-2 space-y-2 text-sm text-muted-foreground">
                        <li>Ensure the <strong>Bill Head Item</strong> is correctly selected. It represents the fee category (e.g., Maintenance).</li>
                        <li><strong>Percentage</strong> calculations require a base bill head to calculate over (e.g., 10% of Basic).</li>
                        <li><strong>Amount (Flat)</strong> is charged as a fixed value, irrespective of other charges.</li>
                        <li>The <strong>Start Date</strong> determines when this billing rule becomes active in the system. Changing the rule will preserve history logs.</li>
                    </ul>
                </div>
            </div>

            <hr />

            {(watchBillHead && historyData) ? (
                <>
                    <h1 className="small-heading">Change Log: [{watchBillHead}]</h1>
                    <JSONNewDataTable
                        data={historyData}
                        setData={setHistoryData}
                        loading={loading}
                        setLoading={setLoading}
                        addButtonText={"Add Bill Head"}
                        addButtonLink={``}
                        editButtonLink={``}
                        search={true}
                        reload={false}
                        master_id={""}
                        columns={[
                            { key: "bs_bill_item", value: "Bill Head", type: "text" },
                            { key: "bs_bill_item_start_date", value: "Start Date", type: "date" },
                            { key: "bs_bill_item_end_date", value: "End Date", type: "date" },
                            {
                                key: "bs_bill_item_perc_amt", value: "Perc/Amt", type: "badge", colorMap: [
                                    { value: "P", printValue: "Perc (%)", bgColor: "#90439cff", foregroundColor: "#ffffff" },
                                    { value: "A", printValue: "Amt (Flat)", bgColor: "#00b3ffff", foregroundColor: "#ffffff" }
                                ]
                            },
                            { key: "bs_bill_item_value", value: "Value", type: "text" },
                            { key: "bs_remarks", value: "Remarks", type: "text" },
                            { key: "bs_create_by", value: "Created By", type: "text" },
                            { key: "bs_create_date", value: "Created Date", type: "date" },
                        ]}
                    />
                </>
            ) : (
                <>
                    <h1 className="small-heading text-center italic text-muted-foreground">Select a bill head to view change log</h1>
                </>
            )}
        </>
    );
}