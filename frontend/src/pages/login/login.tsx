// importing client
import api from "@/lib/api";

// importing from react
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, Navigate } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AuthCheckSkeleton from "@/components/prompts/auth-check-skeleton";

// importing icons
import { Loader2, Eye, EyeOff, ArrowUpRight, Check, X } from "lucide-react";
import { ModeToggle } from "@/components/navbar/toggle-theme";
import {
    REDIRECT_WHEN_JWT_EXISTS,
    USER_PRIVACY_POLICY,
    USER_TERMS_OF_SERVICE
} from "@/lib/constants";

// importing utilities
import { getAndSetCompanies, getAndSetFinYear, getAndSetSidebar } from "@/lib/utils";
import { getSession } from "@/lib/authentication";
import { getFromStorage, putIntoStorage } from "@/lib/storage";

// Password requirements type
type PasswordRequirement = {
    text: string;
    validator: (password: string) => boolean;
};

// Password requirements with validators
const passwordRequirements: PasswordRequirement[] = [
    {
        text: "8-32 characters",
        validator: (pwd) => pwd.length >= 8 && pwd.length <= 32
    },
    {
        text: "Uppercase letter",
        validator: (pwd) => /[A-Z]/.test(pwd)
    },
    {
        text: "Lowercase letter",
        validator: (pwd) => /[a-z]/.test(pwd)
    },
    {
        text: "Number",
        validator: (pwd) => /[0-9]/.test(pwd)
    },
    {
        text: "Special character",
        validator: (pwd) => /[^a-zA-Z0-9]/.test(pwd)
    }
];

// Define validation schema with Zod
const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be less than 32 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

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

type FormValues = z.infer<typeof formSchema>;
type ResetValues = z.infer<typeof resetPasswordSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [phase, setPhase] = useState<"credentials" | "otp" | "reset_password" | "register">("credentials");
    const [otpData, setOtpData] = useState<{
        userId: number;
        email: string;
        verificationToken: string;
        deviceId: string;
    } | null>(null);
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [otpValue, setOtpValue] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
        mode: "onChange",
    });

    const resetForm = useForm<ResetValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    const registerForm = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            mobile: "",
            password: "",
            role: "Employee",
        },
        mode: "onChange",
    });

    const { isSubmitting } = form.formState;
    const isResetting = resetForm.formState.isSubmitting;
    const isRegistering = registerForm.formState.isSubmitting;

    const onSubmit = async (values: FormValues) => {
        try {
            let deviceId = getFromStorage("device-id") as string;
            if (!deviceId) {
                deviceId = window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(7);
                putIntoStorage("device-id", deviceId);
            }

            console.log(`[Auth] Active Device ID: ${deviceId}`);

            const response = await api.post("/login", {
                username: values.username,
                password: values.password,
                device_id: deviceId,
                device_name: navigator.userAgent.split(') ')[0].split(' (')[1] || "Web Browser",
                device_type: "web"
            });

            if (response.data.type === "otp_required") {
                setOtpData({
                    userId: response.data.userId,
                    email: response.data.email,
                    verificationToken: response.data.verificationToken,
                    deviceId: deviceId
                });
                setPhase("otp");
                toast.info("Verification code sent to your email");
                return;
            }

            if (response.data.type === "success") {
                handleLoginSuccess(response.data);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Login failed");
        }
    };

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
                toast.success("Registration successful! Please login with your credentials.");
                registerForm.reset();
                setPhase("credentials");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Registration failed");
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpData || otpValue.length < 6) return;

        setIsVerifying(true);
        try {
            const response = await api.post("/verify-otp", {
                userId: otpData.userId,
                deviceId: otpData.deviceId,
                otp: otpValue,
                verificationToken: otpData.verificationToken
            });

            if (response.data.type === "reset_password_required") {
                setResetToken(response.data.resetToken);
                setPhase("reset_password");
                toast.info("Security update: Please set a new strong password");
                return;
            }

            if (response.data.type === "success") {
                handleLoginSuccess(response.data);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSetPassword = async (values: ResetValues) => {
        if (!resetToken) return;

        try {
            const response = await api.put("/set-password", {
                resetToken,
                newPassword: values.newPassword
            });

            if (response.data.type === "success") {
                handleLoginSuccess(response.data);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to set password");
        }
    };

    const handleResendOtp = async () => {
        if (!otpData || resendTimer > 0) return;

        try {
            const response = await api.post("/resend-otp", {
                userId: otpData.userId,
                deviceId: otpData.deviceId
            });

            if (response.data.type === "success") {
                setResendTimer(60);
                toast.success("New code sent!");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to resend code");
        }
    };

    const handleLoginSuccess = async (data: any) => {
        // SETTING TOKENS
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;
        const payload = data.data || {};

        putIntoStorage("session", accessToken);
        if (refreshToken) {
            putIntoStorage("refreshToken", refreshToken);
        }

        // Handle default values robustly
        const societyId = payload.societyId !== undefined && payload.societyId !== null ? payload.societyId : 0;
        const username = payload.name || "User";
        const accessType = payload.accessType || "AD";
        const permissions = payload.permissions || [];

        putIntoStorage("company", societyId);
        putIntoStorage("username", username);
        putIntoStorage("access", accessType);
        putIntoStorage("permissions", permissions);

        await getAndSetCompanies();
        await getAndSetFinYear();
        await getAndSetSidebar();

        toast.success("Login successful!");
        navigate(REDIRECT_WHEN_JWT_EXISTS);
    };

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [resendTimer]);

    // const handleGoogleLogin = () => {
    //     window.location.href = AUTH_URL_GOOGLE as string;
    // };

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        async function sessionGet() {
            const session = await getSession();
            if (session) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        }
        sessionGet();
    }, []);

    if (isAuthenticated === null) {
        return (
            <>
                <AuthCheckSkeleton />
            </>
        );
    }

    return isAuthenticated ? (
        <>
            <Navigate to={REDIRECT_WHEN_JWT_EXISTS} />
        </>
    ) : (
        <>
            <div className="flex flex-col justify-center items-center gap-6 bg-background">
                <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                    <Card className="w-full max-w-md bg-transparent border-none shadow-none">
                        <CardHeader className="text-center">
                            <CardTitle className="heading">
                                {phase === "register" ? "Create an account" : "Welcome back"}
                            </CardTitle>
                            <CardDescription>
                                {phase === "register" ? "Sign up to get started" : "Login with your Google account"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {phase === "credentials" ? (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                                        <div className="grid gap-4">
                                            <FormField
                                                control={form.control}
                                                name="username"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Mobile/Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your mobile number/email address"
                                                                {...field}
                                                                disabled={isSubmitting}
                                                                autoFocus={true}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Password</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Enter your password"
                                                                    {...field}
                                                                    disabled={isSubmitting}
                                                                    className="pr-10"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                >
                                                                    {showPassword ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                    <span className="sr-only">
                                                                        {showPassword ? "Hide password" : "Show password"}
                                                                    </span>
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button type="submit" className="w-full shadow-md shadow-primary/10" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Logging in...
                                                    </>
                                                ) : (
                                                    "Login"
                                                )}
                                            </Button>

                                            <div className="text-sm text-center text-muted-foreground mt-2">
                                                Don't have an account?{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => setPhase("register")}
                                                    className="underline underline-offset-4 hover:text-primary font-semibold text-foreground cursor-pointer"
                                                >
                                                    Register here
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            ) : phase === "register" ? (
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
                                                            placeholder="Enter your full name"
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
                                                            placeholder="Enter your email"
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
                                                            placeholder="Enter your mobile number"
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

                                        <Button type="submit" className="w-full mt-4 shadow-md shadow-primary/10" disabled={isRegistering}>
                                            {isRegistering ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Registering account...
                                                </>
                                            ) : (
                                                "Register Account"
                                            )}
                                        </Button>

                                        <div className="text-sm text-center mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setPhase("credentials")}
                                                className="underline underline-offset-4 hover:text-primary font-medium cursor-pointer"
                                            >
                                                Back to login
                                            </button>
                                        </div>
                                    </form>
                                </Form>
                            ) : phase === "otp" ? (
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <div className="text-sm font-medium">Verify your device</div>
                                        <div className="text-xs text-muted-foreground">
                                            Enter the 6-digit code sent to <span className="font-semibold text-foreground">{otpData?.email}</span>
                                        </div>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                            value={otpValue}
                                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                                            className="text-center text-lg tracking-[0.5em] font-mono h-12"
                                            autoFocus
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto text-xs"
                                                onClick={() => setPhase("credentials")}
                                                disabled={isVerifying}
                                            >
                                                Back to login
                                            </Button>
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto text-xs"
                                                onClick={handleResendOtp}
                                                disabled={isVerifying || resendTimer > 0}
                                            >
                                                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifying || otpValue.length !== 6}
                                    >
                                        {isVerifying ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            "Confirm Device"
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <Form {...resetForm}>
                                    <form onSubmit={resetForm.handleSubmit(handleSetPassword)} className="space-y-4 text-left">
                                        <FormField
                                            control={resetForm.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>New Strong Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showNewPassword ? "text" : "password"}
                                                                placeholder="••••••••"
                                                                {...field}
                                                                disabled={isResetting}
                                                                className="pr-10"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                            >
                                                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <div className="text-xs text-muted-foreground mt-2 grid grid-cols-2 gap-1">
                                                        {passwordRequirements.map((req, index) => {
                                                            const isValid = req.validator(resetForm.watch("newPassword") || "");
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
                                            control={resetForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                            disabled={isResetting}
                                                        />
                                                    </FormControl>
                                                    {resetForm.watch("newPassword") && resetForm.watch("confirmPassword") && (
                                                        <div className="flex items-center gap-2 text-xs mt-1">
                                                            {resetForm.watch("confirmPassword") === resetForm.watch("newPassword") ? (
                                                                <div className="flex items-center gap-1 text-green-600">
                                                                    <Check className="h-3 w-3" /> Passwords match
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-destructive">
                                                                    <X className="h-3 w-3" /> Passwords don't match
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" className="w-full mt-4" disabled={isResetting}>
                                            {isResetting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Updating password...
                                                </>
                                            ) : (
                                                "Secure Account"
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </CardContent>

                        <Link
                            to="/reset-password"
                            className="text-sm text-center underline underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </Link>

                        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
                            By clicking continue, you agree to our <Link target="_blank" to={USER_TERMS_OF_SERVICE}>Terms of Service</Link>{" "} and <Link target="_blank" to={USER_PRIVACY_POLICY}>Privacy Policy</Link>.
                        </div>

                        <div className="p-6">
                            <Button className="w-full border border-primary/40" variant={"secondary"} disabled={isSubmitting} asChild>
                                <Link to="/onboard">
                                    Onboard your society <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </Card>

                </div>

                <ModeToggle />
            </div>
        </>
    );
}