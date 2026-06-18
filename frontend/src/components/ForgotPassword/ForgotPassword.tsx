// importing client
import api from "@/lib/api";

// importing from react
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// importing icons
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { ModeToggle } from "@/components/navbar/toggle-theme";

// Schemas
const emailSchema = z.object({
    email: z.string().min(1, "Email/Username/Mobile is required"),
});

const otpSchema = z.object({
    otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

const resetSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ForgotPassword() {
    const [step, setStep] = useState<"email" | "otp" | "reset" | "success">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const resetForm = useForm<z.infer<typeof resetSchema>>({
        resolver: zodResolver(resetSchema),
        defaultValues: { password: "" },
    });

    // Step 1: Send OTP to Email
    const handleSendOTP = async (values: z.infer<typeof emailSchema>) => {
        setLoading(true);
        try {
            const response = await api.post("/password/forgot-password", {
                email: values.email
            });

            if (response.status === 200) {
                setEmail(values.email);
                setStep("otp");
                toast.success(response.data.message || "OTP sent successfully");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error sending OTP");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (values: z.infer<typeof otpSchema>) => {
        setLoading(true);
        try {
            const response = await api.post("/password/verify-otp", { email, otp: values.otp });
            setOtp(values.otp);
            setStep("reset");
            toast.success(response.data.message);
        } catch (error: any) {
            otpForm.setError("otp", { message: error.response?.data?.message || "Invalid OTP" });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (values: z.infer<typeof resetSchema>) => {
        setLoading(true);
        try {
            const response = await api.post("/password/reset-password", {
                email,
                otp,
                newPassword: values.password,
            });
            toast.success(response.data.message);
            setStep("success");
        } catch (error: any) {
            resetForm.setError("password", { message: error.response?.data?.message || "Error updating password" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center gap-6 bg-background">
            <div className="flex flex-col gap-4 w-full min-w-sm max-w-md mx-auto">
                {step !== "success" && (
                    <Button onClick={() => navigate("/login")} variant={"ghost"} className="w-fit">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                )}

                <Card className="w-full md:min-w-sm max-w-md bg-transparent border-none shadow-none mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="heading">
                            {step === "email" && "Forgot Password"}
                            {step === "otp" && "Verify OTP"}
                            {step === "reset" && "Reset Password"}
                            {step === "success" && "Success!"}
                        </CardTitle>
                        <CardDescription>
                            {step === "email" && "Enter your email/username/mobile to receive a recovery OTP"}
                            {step === "otp" && `We've sent a 6-digit code to ${email}`}
                            {step === "reset" && "Choose a new secure password for your account"}
                            {step === "success" && "Your password has been reset successfully."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === "email" && (
                            <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="grid gap-6">
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email/Username/Mobile:</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="name@example.com"
                                                        {...field}
                                                        disabled={loading}
                                                        autoFocus
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            "Send OTP"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {step === "otp" && (
                            <Form {...otpForm}>
                                <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="grid gap-6">
                                    <FormField
                                        control={otpForm.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>One-Time Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter 6-digit code"
                                                        {...field}
                                                        disabled={loading}
                                                        autoFocus
                                                        maxLength={6}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            "Verify OTP"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {step === "reset" && (
                            <Form {...resetForm}>
                                <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="grid gap-6">
                                    <FormField
                                        control={resetForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter new password"
                                                            {...field}
                                                            disabled={loading}
                                                            className="pr-10"
                                                            autoFocus
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
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {step === "success" && (
                            <div className="flex flex-col items-center gap-6 py-4">
                                <div className="rounded-full bg-success/10 p-3">
                                    <CheckCircle2 className="h-12 w-12 text-success" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-semibold">Password Reset Successful</h3>
                                    <p className="text-muted-foreground">
                                        You can now sign in with your new password.
                                    </p>
                                </div>
                                <Button onClick={() => navigate("/login")} className="w-full">
                                    Back to Login
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {step !== "success" && (
                    <div className="text-sm text-center">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="underline underline-offset-4 hover:text-primary font-medium"
                        >
                            Login here
                        </Link>
                    </div>
                )}
            </div>

            <ModeToggle />
        </div>
    );
}