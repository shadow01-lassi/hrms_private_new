import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { putIntoStorage } from "@/lib/storage";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Loader2,
    Building2,
    Mail,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
} from "lucide-react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";

// Schema for Society Info
const societySchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address"),
});

type SocietyFormValues = z.infer<typeof societySchema>;

const maskEmail = (email?: string) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) return email;
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
};

export default function OnboardPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState<1 | 2>(1);
    const [showNameField, setShowNameField] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [companyInfo, setCompanyInfo] = useState<{
        id: number;
        name: string;
        email: string;
        alreadyExists?: boolean;
    } | null>(null);

    // 🔥 OTP state (replaces react-hook-form)
    const [otp, setOtp] = useState("");
    const [resendCountdown, setResendCountdown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        let timer: any;
        if (resendCountdown > 0) {
            timer = setInterval(() => {
                setResendCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCountdown]);

    const societyForm = useForm<SocietyFormValues>({
        resolver: zodResolver(societySchema),
        defaultValues: { name: "", email: "" },
    });

    const onSocietySubmit = async (data: SocietyFormValues) => {
        if (showNameField && (!data.name || data.name.length < 3)) {
            societyForm.setError("name", { message: "Society name must be at least 3 characters" });
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post("/onboard/step-1", data);
            if (response.data.type === "success") {
                const { result, already_exists, name_required } = response.data.data;

                if (name_required) {
                    setShowNameField(true);
                    toast.info("Please enter your society name to continue.");
                    return;
                }

                toast.success("OTP sent to your email!");
                setCompanyInfo({
                    id: result.cm_id,
                    name: data.name || result.cm_name,
                    email: data.email,
                    alreadyExists: already_exists
                });
                setStep(2);
                setResendCountdown(30); // Start 30s countdown
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!companyInfo?.email || resendCountdown > 0) return;

        setIsResending(true);
        try {
            const response = await api.post("/onboard/step-1", {
                email: companyInfo.email,
                name: companyInfo.name
            });
            if (response.data.type === "success") {
                toast.success("OTP resent successfully!");
                setResendCountdown(30);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    // 🔥 Manual OTP submit
    const handleOTPSubmit = async () => {
        if (otp.length !== 6) {
            toast.error("OTP must be 6 digits");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post("/onboard/step-1/otp-verify", {
                email: companyInfo?.email,
                otp: otp,
            });

            if (response.data.type === "success") {
                toast.success("Email verified successfully!");
                const token = response.data.token;
                putIntoStorage("onboarding_session", token);
                putIntoStorage("company", response.data.data.id);

                const queryParam = companyInfo?.alreadyExists ? "resume=true" : "new=true";
                navigate(`/onboard/dashboard?${queryParam}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden p-4">
                <nav className="fixed top-0 w-screen flex justify-between items-center gap-4 p-4">
                    <Button onClick={() => { navigate(`/`); }} className="rounded-full px-6">
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>

                    <Button className="rounded-full px-6">
                        Who uses Conversational AI?
                    </Button>
                </nav>

                {/* Background Effects */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50 pointer-events-none" />

                <Card className="w-full max-w-lg h-full border-border/50 shadow-2xl bg-background/80 backdrop-blur-xl relative z-10 overflow-hidden py-0 gap-0">
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-muted/50">
                        <div
                            className="h-full bg-primary transition-all duration-700 ease-in-out"
                            style={{ width: step === 1 ? "50%" : "100%" }}
                        />
                    </div>

                    <CardHeader className="space-y-4 pb-6 pt-8 px-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                            {step === 1 ? (
                                <Building2 className="w-6 h-6" />
                            ) : (
                                <ShieldCheck className="w-6 h-6" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                                {step === 1 ? "Welcome to Conversational AI" : "Check your email"}
                            </CardTitle>
                            <CardDescription className="text-base">
                                {step === 1
                                    ? "Let's get your society set up in just a few minutes."
                                    : (
                                        <>
                                            We've sent a 6-digit secure code to <br />
                                            <span className="font-medium text-foreground">
                                                {maskEmail(companyInfo?.email)}
                                            </span>
                                        </>
                                    )}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        {step === 1 ? (
                            <Form {...societyForm}>
                                <form
                                    onSubmit={societyForm.handleSubmit(onSocietySubmit)}
                                    className="space-y-5"
                                >
                                    <div className="w-full bg-muted/30 rounded-xl overflow-hidden border border-border/50">
                                        <img
                                            src="/welcome-banner.png"
                                            alt="Welcome Banner"
                                            className="w-full h-[200px] object-cover"
                                        />
                                    </div>

                                    <FormField
                                        control={societyForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Admin Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                                                        <Input
                                                            className="pl-10 h-11"
                                                            type="email"
                                                            placeholder="admin@society.com"
                                                            {...field}
                                                            disabled={showNameField}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {showNameField && (
                                        <FormField
                                            control={societyForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Society Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/70" />
                                                            <Input
                                                                className="pl-10 h-11"
                                                                placeholder="e.g. Green Valley Residents"
                                                                {...field}
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {showNameField ? "Start Onboarding" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>

                                    {showNameField && !isLoading && (
                                        <Button
                                            variant="ghost"
                                            type="button"
                                            className="w-full"
                                            onClick={() => {
                                                setShowNameField(false);
                                                societyForm.setValue("name", "");
                                            }}
                                        >
                                            Change email
                                        </Button>
                                    )}
                                </form>
                            </Form>
                        ) : (
                            <div className="w-full h-full mx-auto">
                                <div className="flex flex-col items-center space-y-6">
                                    <div className="w-full bg-muted/30 rounded-xl overflow-hidden border border-border/50">
                                        <img
                                            src="/verify-otp.png"
                                            alt="Verify OTP"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={(value) => setOtp(value)}
                                        autoFocus
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} className="w-16 h-16" />
                                            <InputOTPSlot index={1} className="w-16 h-16" />
                                            <InputOTPSlot index={2} className="w-16 h-16" />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} className="w-16 h-16" />
                                            <InputOTPSlot index={4} className="w-16 h-16" />
                                            <InputOTPSlot index={5} className="w-16 h-16" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <div className="grid gap-6 py-6">
                                    <Button
                                        onClick={handleOTPSubmit}
                                        size={"lg"}
                                        className="w-full"
                                        disabled={isLoading || otp.length !== 6}
                                    >
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Verify Email
                                    </Button>

                                    <Button
                                        variant="outline"
                                        type="button"
                                        size={"lg"}
                                        className="w-full"
                                        onClick={handleResendOTP}
                                        disabled={isLoading || isResending || resendCountdown > 0}
                                    >
                                        {isResending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {resendCountdown > 0
                                            ? `Resend OTP in ${resendCountdown}s`
                                            : "Resend OTP"}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        type="button"
                                        size={"lg"}
                                        className="w-full text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            setOtp("");
                                            setStep(1);
                                            setShowNameField(false);
                                        }}
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Wrong email? Go back
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}