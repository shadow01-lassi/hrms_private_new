import { useEffect, useState } from "react";
import DashboardSkeleton from "./components/dashboard-skeleton";
import api from "@/lib/api";
import { HRMSDashboardCountsType } from "@/lib/types";

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Users, ShieldCheck, CheckCircle, UserCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2, Check, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const registerSchema = z.object({
    name: z.string().min(2, "Full Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    role: z.enum(["Admin", "Employee", "Manager"], {
        required_error: "Role is required"
    })
});

type RegisterValues = z.infer<typeof registerSchema>;

// Password requirements with validators
const passwordRequirements = [
    { text: "8-32 characters", validator: (pwd: string) => pwd.length >= 8 && pwd.length <= 32 },
    { text: "Uppercase letter", validator: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: "Lowercase letter", validator: (pwd: string) => /[a-z]/.test(pwd) },
    { text: "Number", validator: (pwd: string) => /[0-9]/.test(pwd) },
    { text: "Special character", validator: (pwd: string) => /[^a-zA-Z0-9]/.test(pwd) }
];

export default function DashboardPage() {
    const [data, setData] = useState<HRMSDashboardCountsType | null>(null);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const registerForm = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            mobile: "",
            password: "",
            role: "Employee"
        },
        mode: "onChange"
    });

    const isRegistering = registerForm.formState.isSubmitting;

    const onRegisterSubmit = async (values: RegisterValues) => {
        try {
            const response = await api.post("/register", {
                name: values.name,
                email: values.email,
                mobile: values.mobile,
                password: values.password,
                role: values.role
            });

            if (response.data.type === "success") {
                toast.success("New user onboarded successfully!");
                registerForm.reset();
                setRegisterOpen(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to onboard user");
        }
    };

    useEffect(() => {
        async function getData() {
            try {
                const results = await api.get("/dashboard/hrms");
                if (results.data.type === "success") {
                    setData(results.data.data as HRMSDashboardCountsType);
                }
            } catch (err) {
                console.error("Error fetching dashboard counts:", err);
            }
        }
        getData();
    }, []);

    return (
        <>
            {data ? (
                <>
                    <div className="space-y-6 pb-8" >
                        {/* Dynamic styled Header Banner with Onboard CTA */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/30 backdrop-blur-md border border-primary/10 rounded-2xl p-6 shadow-sm">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">HRMS Dashboard</h1>
                                <p className="text-muted-foreground text-sm">Welcome back to the Valueye HRMS platform.</p>
                            </div>
                            <Button onClick={() => setRegisterOpen(true)} className="gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 cursor-pointer">
                                <UserPlus className="h-4 w-4" /> Onboard New User
                            </Button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Total Companies */}
                            <Card className="hover:shadow-md transition-all duration-300 border bg-gradient-to-br from-card to-background relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                                    <Building2 className="w-24 h-24 text-primary" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
                                    <Building2 className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold tracking-tight">{data.totalCompanies}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Registered in the system</p>
                                </CardContent>
                            </Card>

                            {/* Active Companies */}
                            <Card className="hover:shadow-md transition-all duration-300 border bg-gradient-to-br from-card to-background relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle className="w-24 h-24 text-emerald-500" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Companies</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold tracking-tight text-emerald-500">{data.activeCompanies}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Operational companies</p>
                                </CardContent>
                            </Card>

                            {/* Total Employees */}
                            <Card className="hover:shadow-md transition-all duration-300 border bg-gradient-to-br from-card to-background relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-24 h-24 text-indigo-500" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
                                    <Users className="h-4 w-4 text-indigo-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold tracking-tight">{data.totalEmployees}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Registered staff members</p>
                                </CardContent>
                            </Card>

                            {/* Active Employees */}
                            <Card className="hover:shadow-md transition-all duration-300 border bg-gradient-to-br from-card to-background relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                                    <UserCheck className="w-24 h-24 text-teal-500" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Employees</CardTitle>
                                    <UserCheck className="h-4 w-4 text-teal-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold tracking-tight text-teal-500">{data.activeEmployees}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Active staff members</p>
                                </CardContent>
                            </Card>

                            {/* Total Employee Login Accounts */}
                            <Card className="hover:shadow-md transition-all duration-300 border bg-gradient-to-br from-card to-background relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                                    <KeyRound className="w-24 h-24 text-amber-500" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Employee Login Accounts</CardTitle>
                                    <KeyRound className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold tracking-tight">{data.totalEmployeeLoginAccounts}</div>
                                    <p className="text-xs text-muted-foreground mt-1">System employee login credentials</p>
                                </CardContent>
                            </Card>

                            {/* Active Employee Login Accounts */}
                            <Card className="hover:shadow-md transition-all duration-300 border bg-gradient-to-br from-card to-background relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
                                    <ShieldCheck className="w-24 h-24 text-emerald-600" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Employee Login Accounts</CardTitle>
                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold tracking-tight text-emerald-600">{data.activeEmployeeLoginAccounts}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Authorized employee login accounts</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            ) : (
                <DashboardSkeleton />
            )}

            {/* User Onboarding Registration Modal Dialog */}
            <Dialog open={registerOpen} onOpenChange={(open) => {
                setRegisterOpen(open);
                if (!open) registerForm.reset();
            }}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Onboard New User</DialogTitle>
                        <DialogDescription>
                            Create a secure employee or administrator login credential.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 text-left">
                            <FormField
                                control={registerForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter full name"
                                                {...field}
                                                disabled={isRegistering}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={registerForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter email"
                                                type="email"
                                                {...field}
                                                disabled={isRegistering}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={registerForm.control}
                                name="mobile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter mobile number"
                                                {...field}
                                                disabled={isRegistering}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={registerForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                    disabled={isRegistering}
                                                    className="pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <div className="text-xs text-muted-foreground mt-2 grid grid-cols-2 gap-1">
                                            {passwordRequirements.map((req, index) => {
                                                const isValid = req.validator(registerForm.watch("password") || "");
                                                return (
                                                    <div key={index} className="flex items-center gap-1.5">
                                                        {isValid ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-destructive/50" />
                                                        )}
                                                        <span className={isValid ? "text-green-600" : "text-muted-foreground"}>
                                                            {req.text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={registerForm.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                                disabled={isRegistering}
                                            >
                                                <option value="Employee">Employee</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)} disabled={isRegistering}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isRegistering}>
                                    {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Onboard User
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}