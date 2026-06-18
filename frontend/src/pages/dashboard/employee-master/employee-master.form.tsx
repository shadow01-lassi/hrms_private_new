import api from "@/lib/api";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { EmployeeMasterType } from "@/lib/types";

const FormSchema = z.object({
    em_cm_id: z.coerce.number().min(1, { message: "Please select a company." }),
    em_employee_id: z.string().min(1, { message: "Employee ID is required." }),
    em_first_name: z.string().min(1, { message: "First name is required." }),
    em_last_name: z.string().min(1, { message: "Last name is required." }),
    em_gender: z.string().min(1, { message: "Gender is required." }),
    em_date_of_birth: z.string().min(1, { message: "Date of birth is required." }),
    em_mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits." }),
    em_work_email: z.string().email({ message: "Invalid work email address." }),
    em_hire_date: z.string().min(1, { message: "Hire date is required." }),
    em_personal_email: z.string().email({ message: "Invalid personal email address." }).optional().or(z.literal("")),
    em_address_line1: z.string().optional().or(z.literal("")),
    em_address_line2: z.string().optional().or(z.literal("")),
    em_address_line3: z.string().optional().or(z.literal("")),
    em_join_date: z.string().optional().or(z.literal("")),
    em_designation: z.string().optional().or(z.literal("")),
    em_status: z.boolean(),
});

type FormValues = z.infer<typeof FormSchema>;

function formatDateForInput(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
    } catch {
        return "";
    }
}

export function EmployeeMasterForm({
    action,
    prepopulatedData
}: {
    action: "add" | "edit";
    prepopulatedData: EmployeeMasterType | null;
}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<{ value: number; label: string }[]>([]);

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const res = await api.get("/master/company-master/dropdown");
                if (res.data.type === "success") {
                    setCompanies(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching company list for dropdown:", error);
            }
        }
        fetchCompanies();
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            em_cm_id: prepopulatedData?.em_cm_id || 0,
            em_employee_id: prepopulatedData?.em_employee_id || "",
            em_first_name: prepopulatedData?.em_first_name || "",
            em_last_name: prepopulatedData?.em_last_name || "",
            em_gender: prepopulatedData?.em_gender || "",
            em_date_of_birth: formatDateForInput(prepopulatedData?.em_date_of_birth),
            em_mobile: prepopulatedData?.em_mobile || "",
            em_work_email: prepopulatedData?.em_work_email || "",
            em_hire_date: formatDateForInput(prepopulatedData?.em_hire_date),
            em_personal_email: prepopulatedData?.em_personal_email || "",
            em_address_line1: prepopulatedData?.em_address_line1 || "",
            em_address_line2: prepopulatedData?.em_address_line2 || "",
            em_address_line3: prepopulatedData?.em_address_line3 || "",
            em_join_date: formatDateForInput(prepopulatedData?.em_join_date),
            em_designation: prepopulatedData?.em_designation || "",
            em_status: prepopulatedData?.em_status !== undefined ? prepopulatedData.em_status : true,
        },
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        const payload = {
            ...values,
            em_personal_email: values.em_personal_email || null,
            em_address_line1: values.em_address_line1 || null,
            em_address_line2: values.em_address_line2 || null,
            em_address_line3: values.em_address_line3 || null,
            em_join_date: values.em_join_date || null,
            em_designation: values.em_designation || null,
        };

        try {
            let response;
            if (action === "add") {
                response = await api.post("/master/employees", payload);
            } else {
                response = await api.put(`/master/employees/${prepopulatedData?.em_id}`, payload);
            }

            const { type, message } = response.data;
            if (type === "success") {
                toast.success(message);
                navigate(-1);
            } else {
                toast.error(message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-card border rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="em_cm_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company *</FormLabel>
                                <FormControl>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    >
                                        <option value="" disabled>Select Company</option>
                                        {companies.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_employee_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employee ID *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. EMP001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. John" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender *</FormLabel>
                                <FormControl>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}
                                    >
                                        <option value="" disabled>Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_date_of_birth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date of Birth *</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_mobile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile Number *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 9876543210" {...field} maxLength={15} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_work_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Work Email *</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. john.doe@company.com" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_personal_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Personal Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. john.doe@gmail.com" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_designation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_hire_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hire Date *</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="em_join_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Join Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-sm">Address Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <FormField
                            control={form.control}
                            name="em_address_line1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Line 1</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Flat, House No., Building" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="em_address_line2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Line 2</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Street, Sector, Area" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="em_address_line3"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Line 3</FormLabel>
                                    <FormControl>
                                        <Input placeholder="City, State, Pincode" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="em_status"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Is Active?</FormLabel>
                                <FormDescription>
                                    Uncheck to set status as inactive.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="cursor-pointer">
                        {loading ? "Saving..." : action === "add" ? "Create Employee" : "Update Employee"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} className="cursor-pointer">
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
