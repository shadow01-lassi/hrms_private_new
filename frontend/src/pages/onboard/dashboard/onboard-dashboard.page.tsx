import { useEffect, useState } from "react";
import {
    Check,
    ArrowRight,
    Sparkles,
    ArrowUpRight,
    Lock,
    Clock,
} from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { getOnboardingToken } from "@/lib/utils";
import { OnboardingStep, OnboardingUserType } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
import api from "@/lib/api";

// --- Mock Data (To be replaced by API) ---

const MOCK_STEPS: OnboardingStep[] = [
    {
        stepNumber: 1,
        title: "Society Verification",
        description: "Verifying email address via OTP.",
        link: "/step-1",
        status: "completed",
    },
    {
        stepNumber: 2,
        title: "Add Basic Details",
        description: "Add basic details of the society.",
        link: "/step-2",
        status: "current",
    },
    {
        stepNumber: 3,
        title: "Add Wings & Units",
        description: "Configure wings, floors, and specific flat numbers.",
        link: "/step-3",
        status: "pending",
    },
    {
        stepNumber: 4,
        title: "Invite Committee Members",
        description: "Add admins and assign specific roles to them.",
        link: "/step-4",
        status: "pending",
    },
    {
        stepNumber: 5,
        title: "Set Up Billing",
        description: "Configure maintenance charges and bank details.",
        link: "/step-5",
        status: "pending",
    },
    {
        stepNumber: 6,
        title: "Import Residents",
        description: "Upload your existing resident data via CSV.",
        link: "/step-6",
        status: "pending",
    },
    {
        stepNumber: 7,
        title: "Configure Amenities",
        description: "Set up bookable amenities like Club House or Pool.",
        link: "/step-7",
        status: "pending",
    },
    {
        stepNumber: 8,
        title: "Go Live",
        description: "Final review and activate your platform for residents.",
        link: "/live",
        status: "pending",
    },
];

const ProgressRing = ({ completed, total }: { completed: number; total: number }) => {
    const radius = 28;
    const stroke = 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const percent = total === 0 ? 0 : (completed / total) * 100;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center w-16 h-16">
                <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                    {/* Background Ring */}
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="text-muted"
                    />
                    {/* Progress Ring */}
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + " " + circumference}
                        style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="text-primary"
                    />
                </svg>
                <div className="absolute flex items-center justify-center text-xs font-bold text-foreground">
                    {completed}/{total}
                </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Steps completed</span>
        </div>
    );
};

// --- Upgraded List Item Component ---
const StepListItem = ({
    step,
    index,
    isLocked,
    isDependencyLocked,
    dependencyMessage,
    dependencyHint
}: {
    step: OnboardingStep;
    index: number;
    isLocked?: boolean;
    isDependencyLocked?: boolean;
    dependencyMessage?: string;
    dependencyHint?: string;
}) => {
    const isCompleted = step.status === "completed";
    const isCurrent = step.status === "current";
    const isVerifying = step.status === "verifying";

    const effectivelyLocked = isLocked || isDependencyLocked;

    return (
        <Link
            to={effectivelyLocked ? "#" : `/onboard/dashboard${step.link}`}
            onClick={(e) => {
                if (isLocked) {
                    e.preventDefault();
                } else if (isDependencyLocked) {
                    e.preventDefault();
                    toast.error(dependencyMessage || "This step is currently locked.");
                }
            }}
            className={`group relative flex flex-col sm:flex-row sm:items-center p-5 rounded-2xl border transition-all duration-200 ease-out animate-in slide-in-from-bottom-8 fade-in fill-mode-both ${effectivelyLocked
                ? "bg-muted/10 border-border/30 opacity-60 cursor-not-allowed grayscale-[0.5]"
                : isCompleted
                    ? "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border/20 cursor-pointer shadow-sm"
                    : isVerifying
                        ? "bg-amber-50/30 border-amber-200/50 hover:bg-amber-50/50 hover:border-amber-300/50 cursor-pointer shadow-sm"
                        : isCurrent
                            ? "bg-background border-primary/30 shadow-md shadow-primary/5 hover:-translate-y-1 hover:border-primary/60 cursor-pointer text-foreground"
                            : "bg-background border-border/50 hover:bg-muted/20 hover:border-border hover:-translate-y-0.5 cursor-pointer shadow-sm text-foreground"
                }`}
            style={{ animationDelay: `${index * 80}ms`, textDecoration: "none" }}
        >
            {/* Left Status Icon */}
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div
                    className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-base font-bold transition-all duration-200 ${effectivelyLocked
                        ? "bg-muted/50 text-muted-foreground/50 border border-dashed border-border"
                        : isCompleted
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : isVerifying
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : isCurrent
                                    ? "bg-primary text-primary-foreground ring-4 ring-primary/10 group-hover:ring-primary/20"
                                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10"
                        }`}
                >
                    {effectivelyLocked ? <Lock className="w-4 h-4" /> : isCompleted ? <Check className="w-5 h-5" /> : isVerifying ? <Clock className="w-5 h-5 animate-spin-slow" /> : step.stepNumber}
                </div>
            </div>

            {/* Middle Content */}
            <div className="flex-1 sm:ml-5 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                    <h3
                        className={`text-lg font-bold transition-colors ${isCompleted || isVerifying
                            ? "text-muted-foreground line-through decoration-muted-foreground/40"
                            : isCurrent
                                ? "text-primary"
                                : "text-foreground group-hover:text-primary/90"
                            }`}
                    >
                        {step.title}
                    </h3>
                    <Badge
                        variant={effectivelyLocked ? "outline" : isCompleted ? "outline" : isVerifying ? "outline" : isCurrent ? "default" : "secondary"}
                        className={`capitalize tracking-wider font-semibold ${effectivelyLocked ? "bg-muted/20 text-muted-foreground border-muted-foreground/80" : isCompleted ? "text-green-600 border-green-200 bg-green-50/50" : isVerifying ? "text-amber-600 border-amber-200 bg-amber-50/50" : ""}`}
                    >
                        {effectivelyLocked ? "locked" : step.status}
                    </Badge>

                    {isDependencyLocked && dependencyHint && (
                        <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive h-5 font-black tracking-tight px-3">
                            {dependencyHint}
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {isVerifying ? "Hang tight! We're currently verifying your society details. This usually takes just a few hours." : step.description}
                </p>
            </div>

            {/* Right Action Button */}
            <div className="mt-4 sm:mt-0 sm:ml-6 shrink-0 flex items-center justify-end">
                {effectivelyLocked ? (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-muted/20 text-muted-foreground/40 border border-border/50">
                        <Lock className="w-4 h-4" />
                    </div>
                ) : isCompleted ? (
                    step.stepNumber !== 1 && (
                        <div className="relative h-10 w-10 group/revisit transition-all duration-200 ease-in-out hover:w-[110px] flex items-center justify-end">
                            <div className="absolute inset-y-0 right-0 h-10 w-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition-all duration-200 ease-in-out group-hover/revisit:w-full group-hover/revisit:bg-linear-to-r group-hover/revisit:from-yellow-400 group-hover/revisit:via-amber-400 group-hover/revisit:to-yellow-500 group-hover/revisit:text-amber-950 group-hover/revisit:shadow-lg group-hover/revisit:shadow-yellow-500/20 group-hover/revisit:border group-hover/revisit:border-yellow-200/50 overflow-hidden cursor-pointer">
                                {/* Checkmark Icon (Visible by default, disappears on hover) */}
                                <Check className="w-4 h-4 shrink-0 transition-opacity duration-200 group-hover/revisit:hidden" />

                                {/* Revisit Text (Hidden by default, appears on hover) */}
                                <span className="hidden group-hover/revisit:flex items-center gap-2 font-black text-xs uppercase whitespace-nowrap px-4 animate-in fade-in slide-in-from-right-2 duration-200">
                                    Revisit <ArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    )
                ) : isVerifying ? (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-amber-100/50 text-amber-600 border border-amber-200">
                        <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                ) : (
                    <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${isCurrent
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 group-hover:shadow-blue-500/40"
                            : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                            }`}
                    >
                        <ArrowUpRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                )}
            </div>
        </Link>
    );
};

// --- Welcome Dialog Component ---
const WelcomeDialog = ({
    open,
    onOpenChange,
    isResume
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isResume: boolean;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none bg-background/95 backdrop-blur-xl shadow-2xl">
                <div className="relative aspect-video w-full overflow-hidden">
                    <img
                        src={isResume ? "/images/onboarding/resume_setup.png" : "/images/onboarding/welcome_new.png"}
                        alt="Welcome"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
                </div>

                <div className="p-8 pb-10 space-y-6 text-center">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-3xl font-extrabold tracking-tight text-center">
                            {isResume ? "Continue where you left off" : `Welcome to ${APP_NAME}`}
                        </DialogTitle>
                        <DialogDescription className="text-lg text-muted-foreground text-center">
                            Complete your society profile to get started
                        </DialogDescription>
                    </DialogHeader>

                    <Button
                        onClick={() => onOpenChange(false)}
                        size="lg"
                        className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    >
                        {isResume ? "Resume Setup" : "Get Started"}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- Main Page Component ---
export default function OnboardDashboardPage() {
    const [companyInfo, setCompanyInfo] = useState<OnboardingUserType | null>(null);
    const [steps, setSteps] = useState<OnboardingStep[]>(MOCK_STEPS);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showWelcome, setShowWelcome] = useState(false);

    const isResume = searchParams.get("resume") === "true";
    const isNew = searchParams.get("new") === "true";

    useEffect(() => {
        if (isResume || isNew) {
            setShowWelcome(true);
        }
    }, [isResume, isNew]);

    const handleWelcomeClose = (open: boolean) => {
        setShowWelcome(open);
        if (!open) {
            // Remove params from URL after closing
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("new");
            newParams.delete("resume");
            setSearchParams(newParams, { replace: true });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const tokenObj = await getOnboardingToken();
            const token = tokenObj?.token;
            if (!token) return;

            // 1. Fetch Company Info from Token
            if (tokenObj.payload) {
                setCompanyInfo(tokenObj.payload);
            }

            // 2. Fetch Onboarding Progress from API
            try {
                const response = await api.get("/onboard/status", {
                    headers: { "x-onboarding-token": token }
                });

                if (response.data.type === "success") {
                    const progressData = response.data.data;
                    const updatedSteps = MOCK_STEPS.map(mockStep => {
                        const statusUpdate = progressData.find((s: any) => s.stepNumber === mockStep.stepNumber);
                        return {
                            ...mockStep,
                            status: statusUpdate ? statusUpdate.status : mockStep.status
                        };
                    });
                    setSteps(updatedSteps);
                }
            } catch (error) {
                console.error("Failed to fetch onboarding status", error);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        fetchData();
    }, []);

    const companyName = companyInfo?.cm_name || "Your Society";
    const completedCount = steps.filter((s) => s.status === "completed").length;
    const totalCount = steps.length;
    const currentStep = steps.find((s) => s.status === "current") || steps.find((s) => s.status === "pending");
    const isVerifyingSociety = steps.find(s => s.stepNumber === 8)?.status === "verifying";

    return (
        <>
            <WelcomeDialog
                open={showWelcome}
                onOpenChange={handleWelcomeClose}
                isResume={isResume}
            />

            <div className="w-full min-h-screen bg-background text-foreground font-sans">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto animate-in fade-in duration-700">
                    <div className="max-w-5xl w-full mx-auto p-6 md:p-10 md:pt-12 space-y-12">

                        {/* A. Welcome Header Section */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/40 pb-10">
                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                    Welcome to {APP_NAME}, {companyName}{" "}
                                    <span className="inline-block animate-wave origin-bottom-right">👋</span>
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                                    Let's get your society fully set up. Follow the steps below to activate your platform and unlock all features.
                                </p>
                            </div>
                            <ProgressRing completed={completedCount} total={totalCount} />
                        </header>

                        {/* B. Banner Section */}
                        {currentStep && (
                            <Card className={`${isVerifyingSociety
                                ? "bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20"
                                : "bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20"
                                } shadow-sm overflow-hidden relative py-0`}>
                                {/* Abstract Minimal Illustration (CSS Shapes) */}
                                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 pointer-events-none hidden md:block">
                                    <div className={`absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full blur-3xl ${isVerifyingSociety ? "bg-amber-500/20" : "bg-primary/20"}`} />
                                    <div className={`absolute bottom-[-20%] right-[10%] w-48 h-48 rounded-full blur-2xl ${isVerifyingSociety ? "bg-amber-500/30" : "bg-primary/30"}`} />
                                    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <circle cx="2" cy="2" r="1.5" className={isVerifyingSociety ? "fill-amber-500/40" : "fill-primary/40"} />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                                    </svg>
                                </div>

                                <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative z-10">
                                    <div className="space-y-4 max-w-xl">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${isVerifyingSociety
                                            ? "bg-amber-500/10 text-amber-600"
                                            : "bg-primary/10 text-primary"
                                            }`}>
                                            {isVerifyingSociety ? (
                                                <><Clock className="w-3.5 h-3.5" /> Verification Pending</>
                                            ) : (
                                                <><Sparkles className="w-3.5 h-3.5" /> {completedCount >= 7 ? "Final Celebration" : `Next Up: Step ${currentStep.stepNumber}`}</>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">
                                            {isVerifyingSociety
                                                ? "Verification in Progress"
                                                : completedCount >= 8
                                                    ? "You're all set!"
                                                    : completedCount === 7
                                                        ? "Ready to Go Live"
                                                        : "You're almost ready!"}
                                        </h2>
                                        <p className="text-muted-foreground text-base leading-relaxed">
                                            {isVerifyingSociety
                                                ? "Hang tight! We're currently verifying your society details. This usually takes just a few hours. We'll notify you once it's done."
                                                : completedCount >= 8
                                                    ? "Congratulations! Your society setup is complete and verified. You're ready to start managing your community."
                                                    : completedCount === 7
                                                        ? "All steps completed! You're now ready to activate your society and go live for all residents."
                                                        : `Complete your onboarding to unlock billing, member management, and automated communications. Your next step is to ${currentStep.title.toLowerCase()}.`}
                                        </p>
                                        {completedCount >= 8 ? (
                                            <Button
                                                size="lg"
                                                className="mt-2 bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 font-black tracking-wide animate-glow-premium"
                                                onClick={() => (window.location.href = "/dashboard")}
                                            >
                                                CONTINUE TO DASHBOARD
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="lg"
                                                disabled={isVerifyingSociety}
                                                className={`mt-2 group transition-all duration-500 ${isVerifyingSociety
                                                    ? "bg-amber-100 text-amber-700 border-amber-200 cursor-not-allowed"
                                                    : completedCount === 7
                                                        ? "bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white border-none shadow-xl shadow-blue-500/30 font-black tracking-wide animate-glow-premium scale-105"
                                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                                                    }`}
                                                onClick={() => {
                                                    if (currentStep.stepNumber === 6) {
                                                        const step3 = steps.find(s => s.stepNumber === 3);
                                                        if (step3 && step3.status !== 'completed') {
                                                            toast.error("Please complete Step 3 (Wings & Units) before proceeding to resident import.");
                                                            return;
                                                        }
                                                    }
                                                    window.location.href = `/onboard/dashboard${currentStep.link}`;
                                                }}
                                            >
                                                {isVerifyingSociety ? (
                                                    <><Clock className="mr-2 w-4 h-4 animate-spin-slow" /> VERIFICATION IN PROGRESS</>
                                                ) : completedCount === 7 ? (
                                                    "GO LIVE"
                                                ) : (
                                                    "Continue Setup"
                                                )}
                                                {!isVerifyingSociety && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* C. Onboarding Steps List Section */}
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-bold tracking-tight">Setup Guide</h3>
                                <div className="text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1 rounded-full">
                                    {completedCount} / {totalCount} completed
                                </div>
                            </div>

                            <div className="flex flex-col space-y-4 relative">
                                {/* Connecting line behind steps */}
                                <div className="absolute left-9 top-8 bottom-8 w-[2px] bg-border/40 hidden sm:block -z-10" />

                                {isLoadingStatus ? (
                                    <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Calculating your progress...</p>
                                    </div>
                                ) : (
                                    <>
                                        {steps.map((step, index) => {
                                            const isStep8 = step.stepNumber === 8;
                                            const isLocked = isStep8 && completedCount < 7;

                                            // CUSTOM DEPENDENCY: Step 6 requires Step 3
                                            let isDependencyLocked = false;
                                            let dependencyMessage = "";
                                            let dependencyHint = "";
                                            if (step.stepNumber === 6) {
                                                const step3 = steps.find(s => s.stepNumber === 3);
                                                if (step3 && step3.status !== "completed") {
                                                    isDependencyLocked = true;
                                                    dependencyMessage = "Please complete Step 3 (Wings & Units) before importing residents.";
                                                    dependencyHint = "Requires Step 3";
                                                }
                                            }

                                            return (
                                                <StepListItem
                                                    key={step.stepNumber}
                                                    step={step}
                                                    index={index}
                                                    isLocked={isLocked}
                                                    isDependencyLocked={isDependencyLocked}
                                                    dependencyMessage={dependencyMessage}
                                                    dependencyHint={dependencyHint}
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <style>
                    {`
                        @keyframes wave {
                            0% { transform: rotate(0deg); }
                            10% { transform: rotate(14deg); }
                            20% { transform: rotate(-8deg); }
                            30% { transform: rotate(14deg); }
                            40% { transform: rotate(-4deg); }
                            50% { transform: rotate(10deg); }
                            60%, 100% { transform: rotate(0deg); }
                        }
                        .animate-wave {
                            animation: wave 2.5s infinite;
                        }
                        @keyframes glow-premium {
                            0% { 
                                box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(99, 102, 241, 0.3);
                                transform: scale(1.05);
                            }
                            50% { 
                                box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.5);
                                transform: scale(1.08);
                            }
                            100% { 
                                box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(99, 102, 241, 0.3);
                                transform: scale(1.05);
                            }
                        }
                        .animate-glow-premium {
                            animation: glow-premium 2s infinite ease-in-out;
                        }
                    `}
                </style>
            </div>
        </>
    );
}