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

const FormSchema = z.object({
    em_cm_id: z.coerce.number().min(1, { message: "Please select a company." }),
    em_employee_id: z.string().min(1, { message: "Employee ID is required." }),
    em_first_name: z.string().min(1, { message: "First name is required." }),
    em_last_name: z.string().min(1, { message: "Last name is required." }),
    em_date_of_birth: z.string().min(1, { message: "Date of birth is required." }),
    em_mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits." }),
    em_work_email: z.string().email({ message: "Invalid work email address." }),
    em_hire_date: z.string().min(1, { message: "Hire date is required." }),
    em_designation: z.string().optional().or(z.literal("")),
    em_status: z.boolean(),
    el_username: z.string().min(3, { message: "Username must be at least 3 characters." }),
    el_password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    el_role: z.coerce.number().min(1, { message: "Role is required." })
});

type FormValues = z.infer<typeof FormSchema>;

export default function EmployeeMasterQuickAddPage() {
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
            em_cm_id: 0,
            em_employee_id: "",
            em_first_name: "",
            em_last_name: "",
            em_date_of_birth: "",
            em_mobile: "",
            em_work_email: "",
            em_hire_date: "",
            em_designation: "",
            em_status: true,
            el_username: "",
            el_password: "",
            el_role: 3, // Default to Employee (3)
        },
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        const payload = {
            ...values,
            em_designation: values.em_designation || null,
        };

        try {
            const response = await api.post("/master/employees/quick-create", payload);
            const { type, message } = response.data;
            if (type === "success") {
                toast.success(message);
                navigate("/dashboard/registers/employee-master");
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
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="heading">Quick Employee Setup</h1>
                <p className="text-muted-foreground text-sm">Create an employee profile and user login account simultaneously.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl bg-card border rounded-xl p-6 shadow-sm">
                    {/* Section 1: Basic Profile Details */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm border-b pb-2 text-primary">1. Basic Profile Details</h3>
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
                        </div>
                    </div>

                    {/* Section 2: Basic Required Details (NOT NULL Compliance) */}
                    <div className="space-y-4 pt-4">
                        <h3 className="font-semibold text-sm border-b pb-2 text-primary">2. Basic Required Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        </div>
                    </div>

                    {/* Section 3: Login Credentials */}
                    <div className="space-y-4 pt-4">
                        <h3 className="font-semibold text-sm border-b pb-2 text-primary">3. Login Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="el_username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. john.doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="el_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="••••••••" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="el_role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>System Role *</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            >
                                                <option value={3}>Employee</option>
                                                <option value={2}>Manager</option>
                                                <option value={1}>Admin</option>
                                            </select>
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
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Is Active?</FormLabel>
                                    <FormDescription>
                                        Allow this employee to log in and set their status to active.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4 pt-2">
                        <Button type="submit" disabled={loading} className="cursor-pointer">
                            {loading ? "Saving..." : "Create Employee Quick Setup"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => navigate(-1)} className="cursor-pointer">
                            Cancel
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
