
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { getFromStorage } from "@/lib/storage";
import { CompanyMasterShortType } from "@/lib/types";
import { cn } from "@/lib/utils";

const ValidationIcon = ({ status }: { status?: "loading" | "available" | "taken" | "none" }) => {
    if (!status || status === "none") return null;
    if (status === "loading") return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    if (status === "available") return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    if (status === "taken") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    return null;
};

// Schema for validation
const formSchema = z.object({
    ul_username: z.string().min(2, "Username must be at least 2 characters."),
    ul_name: z.string().min(2, "Name must be at least 2 characters."),
    ul_email: z.string().email("Invalid email address."),
    ul_mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits."),
    ul_access_type: z.string().min(1, "Access type is required."),
    ul_role: z.coerce.number().min(1, "Role is required."),
    ul_flat_no: z.string().optional(),
    ul_designation: z.string().optional(),
    ul_cm_access: z.array(z.coerce.number()),
});

export type LoginCredentialFormValues = z.infer<typeof formSchema>;

interface LoginCredentialFormProps {
    defaultValues?: Partial<LoginCredentialFormValues>;
    mode: "create" | "edit";
    ul_id?: number;
    flatListApiUrl?: string;
}

export function LoginCredentialForm({
    defaultValues,
    mode,
    ul_id,
}: LoginCredentialFormProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<CompanyMasterShortType[]>([]);
    const [roles, setRoles] = useState<{ rm_id: number; rm_name: string }[]>([]);
    const [validationStatus, setValidationStatus] = useState<Record<string, "loading" | "available" | "taken" | "none">>({});

    useEffect(() => {
        const companiesFromStorage = getFromStorage("companies") as CompanyMasterShortType[];
        if (companiesFromStorage) {
            setCompanies(companiesFromStorage);
        }

        const fetchRoles = async () => {
            try {
                const response = await api.get("/role");
                if (response.data.type === "success") {
                    setRoles(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch roles", error);
            }
        };
        fetchRoles();
    }, []);

    const form = useForm<LoginCredentialFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ul_username: defaultValues?.ul_username || "",
            ul_name: defaultValues?.ul_name || "",
            ul_email: defaultValues?.ul_email || "",
            ul_mobile: defaultValues?.ul_mobile || "",
            ul_access_type: defaultValues?.ul_access_type || "AD",
            ul_role: defaultValues?.ul_role ? Number(defaultValues.ul_role) : 1,
            ul_flat_no: defaultValues?.ul_flat_no || "",
            ul_designation: defaultValues?.ul_designation || "",
            ul_cm_access: defaultValues?.ul_cm_access || [],
        },
    });

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Helper to check availability
    const checkAvailability = async (field: "ul_username" | "ul_email" | "ul_mobile", value: string, excludeId?: number | null) => {
        const key = field;

        if (!value || value.trim() === "") {
            setValidationStatus(prev => ({ ...prev, [key]: "none" }));
            return;
        }

        // Basic validation before API call
        if (field === "ul_username" && value.length < 2) return;
        if (field === "ul_email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;
        if (field === "ul_mobile" && value.length !== 10) return;

        setValidationStatus(prev => ({ ...prev, [key]: "loading" }));

        try {
            const endpoint = field === "ul_username" ? "check-username" : field === "ul_email" ? "check-email" : "check-mobile";
            const paramName = field === "ul_username" ? "username" : field === "ul_email" ? "email" : "mobile";

            // Use the onboarding endpoints as they are generic enough
            const response = await api.get(`/onboard/step-4/${endpoint}?${paramName}=${value}${excludeId ? `&excludeId=${excludeId}` : ""}`);

            if (response.data.type === "success") {
                setValidationStatus(prev => ({
                    ...prev,
                    [key]: response.data.available ? "available" : "taken"
                }));
            }
        } catch (error) {
            console.error(`Validation failed for ${field}:`, error);
            setValidationStatus(prev => ({ ...prev, [key]: "none" }));
        }
    };

    // Watch fields for changes and trigger debounced check
    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (!name || type !== "change") return;

            if (name === "ul_username" || name === "ul_email" || name === "ul_mobile") {
                const fieldValue = value[name];
                const excludeId = ul_id;

                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                debounceTimerRef.current = setTimeout(() => {
                    if (fieldValue) {
                        checkAvailability(name, fieldValue as string, excludeId);
                    }
                }, 800);
            }
        });
        return () => {
            subscription.unsubscribe();
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [form.watch, ul_id]);

    // Auto-set designation logic
    const flatNo = form.watch("ul_flat_no");
    useEffect(() => {
        if (flatNo && !form.getValues("ul_designation")) {
            form.setValue("ul_designation", "Society Member");
        }
    }, [flatNo, form]);

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                ul_username: defaultValues.ul_username || "",
                ul_name: defaultValues.ul_name || "",
                ul_email: defaultValues.ul_email || "",
                ul_mobile: defaultValues.ul_mobile || "",
                ul_access_type: defaultValues.ul_access_type || "AD",
                ul_role: defaultValues.ul_role ? Number(defaultValues.ul_role) : 1,
                ul_flat_no: defaultValues.ul_flat_no || "",
                ul_designation: defaultValues.ul_designation || "",
                ul_cm_access: defaultValues.ul_cm_access || [],
            });
        }
    }, [defaultValues, form]);

    const handleSubmit = async (values: any) => {
        // Prevent submission if any field is taken
        const takenFields = Object.entries(validationStatus).filter(([_, status]) => status === "taken");
        if (takenFields.length > 0) {
            toast.error("Please resolve duplicate credentials before saving.");
            return;
        }

        setLoading(true);
        try {
            const selectedCompanyString = localStorage.getItem("selectedCompany");
            if (!selectedCompanyString) {
                toast.error("Company not selected");
                return;
            }
            const selectedCompany = JSON.parse(selectedCompanyString);

            if (mode === "create") {
                const payload = {
                    ...values,
                    ul_cm_id: Number(selectedCompany.cm_id),
                };
                const response = await api.post("/user/login-credentials/create", payload);
                if (response.data.type === "success") {
                    toast.success("User created successfully");
                    navigate(-1);
                } else {
                    toast.error(response.data.message || "Failed to create user");
                }
            } else {
                const payload = {
                    ...values,
                    ul_id: Number(ul_id),
                    ul_cm_id: Number(selectedCompany.cm_id),
                };
                const response = await api.put("/user/login-credentials/edit", payload);
                if (response.data.type === "success") {
                    toast.success("User updated successfully");
                    navigate(-1);
                } else {
                    toast.error(response.data.message || "Failed to update user");
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || error.response?.data?.error || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="ul_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ul_username"
                        render={({ field }) => {
                            const status = validationStatus["ul_username"];
                            return (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Username</FormLabel>
                                        <ValidationIcon status={status} />
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="johndoe"
                                            {...field}
                                            className={cn(
                                                status === "taken" && "border-destructive ring-destructive/20 focus-visible:ring-destructive",
                                                status === "available" && "border-green-500/60 ring-green-500/10 focus-visible:ring-green-500/50 shadow-sm shadow-green-500/5"
                                            )}
                                        />
                                    </FormControl>
                                    {status === "taken" ? (
                                        <p className="text-[12px] font-medium text-destructive">Username already taken</p>
                                    ) : (
                                        <FormMessage />
                                    )}
                                </FormItem>
                            );
                        }}
                    />

                    <FormField
                        control={form.control}
                        name="ul_email"
                        render={({ field }) => {
                            const status = validationStatus["ul_email"];
                            return (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Email</FormLabel>
                                        <ValidationIcon status={status} />
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="john@example.com"
                                            type="email"
                                            {...field}
                                            className={cn(
                                                status === "taken" && "border-destructive ring-destructive/20 focus-visible:ring-destructive",
                                                status === "available" && "border-green-500/60 ring-green-500/10 focus-visible:ring-green-500/50 shadow-sm shadow-green-500/5"
                                            )}
                                        />
                                    </FormControl>
                                    {status === "taken" ? (
                                        <p className="text-[12px] font-medium text-destructive">Email already registered</p>
                                    ) : (
                                        <FormMessage />
                                    )}
                                </FormItem>
                            );
                        }}
                    />

                    <FormField
                        control={form.control}
                        name="ul_mobile"
                        render={({ field }) => {
                            const status = validationStatus["ul_mobile"];
                            return (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Mobile</FormLabel>
                                        <ValidationIcon status={status} />
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="9876543210"
                                            maxLength={10}
                                            {...field}
                                            className={cn(
                                                status === "taken" && "border-destructive ring-destructive/20 focus-visible:ring-destructive",
                                                status === "available" && "border-green-500/60 ring-green-500/10 focus-visible:ring-green-500/50 shadow-sm shadow-green-500/5"
                                            )}
                                        />
                                    </FormControl>
                                    {status === "taken" ? (
                                        <p className="text-[12px] font-medium text-destructive">Mobile number already in use</p>
                                    ) : (
                                        <FormMessage />
                                    )}
                                </FormItem>
                            );
                        }}
                    />

                    <FormField
                        control={form.control}
                        name="ul_access_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Access Type</FormLabel>
                                <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select access type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="AD">Admin User</SelectItem>
                                        <SelectItem value="US">Basic User</SelectItem>
                                        <SelectItem value="GK">Gatekeeper User</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ul_role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assign Role</FormLabel>
                                <Select
                                    value={field.value?.toString()}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.rm_id} value={role.rm_id.toString()}>
                                                {role.rm_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ul_flat_no"
                        render={({ field }) => (
                            <FormItem className="flex flex-col pt-2">
                                <FormControl>
                                    <Input
                                        value={field.value}
                                        onChange={(e) => { field.onChange(e.target.value) }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ul_designation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <FormControl>
                                    <Input placeholder="Secretary, Manager, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Card className="p-4 shadow-none">
                    <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                        Company Access
                        <span className="text-xs font-normal text-muted-foreground">(Select multiple)</span>
                    </h3>
                    <FormField
                        control={form.control}
                        name="ul_cm_access"
                        render={({ field }) => (
                            <FormItem>
                                <div className="grid grid-cols-1 gap-1">
                                    {companies.map((company) => (
                                        <div key={company.cm_id} className="flex flex-row items-start space-x-3 space-y-0 p-2 rounded-md hover:bg-accent/50 transition-colors">
                                            <Checkbox
                                                id={`company-${company.cm_id}`}
                                                checked={field.value?.includes(Number(company.cm_id))}
                                                onCheckedChange={(checked) => {
                                                    const currentValues = field.value || [];
                                                    const newValue = checked
                                                        ? [...currentValues, Number(company.cm_id)]
                                                        : currentValues.filter((v) => v !== Number(company.cm_id));
                                                    field.onChange(newValue);
                                                }}
                                            />
                                            <label
                                                htmlFor={`company-${company.cm_id}`}
                                                className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {company.cm_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mode === "edit" ? "Update User" : "Create User"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
