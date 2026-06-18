// importing from react
import { useState, useEffect } from "react";

// importing framer motion
import { motion, AnimatePresence, Variants } from "framer-motion";

// importing qrcode and crypto-js
import { QRCodeCanvas } from "qrcode.react";
import CryptoJS from "crypto-js";

// importing shadcn components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// importing icons
import {
    User, Mail, Phone, Shield, Building2,
    Edit, ArrowRight, Lock, Sparkles, Check, Loader2,
    Briefcase, Hash, MapPin, BadgeCheck, RefreshCw
} from "lucide-react";

// importing utilities & types
import { getAuthToken } from "@/lib/utils";
import { getFromStorage } from "@/lib/storage";
import { SessionUserType, CompanyMasterShortType } from "@/lib/types";

export default function Profile() {
    // State for user information
    const [userData, setUserData] = useState<SessionUserType | null>(null);
    const [companyData, setCompanyData] = useState<CompanyMasterShortType | null>(null);

    // Editable credentials state
    const [userEmail, setUserEmail] = useState<string>("info@valueye.in");
    const [userMobile, setUserMobile] = useState<string>("+91 93210 12106");
    const [userFlat, setUserFlat] = useState<string>("C-1405");
    const [userWing, _setUserWing] = useState<string>("Wing C");

    // Dialog state for Email Update
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState<boolean>(false);
    const [emailDialogStep, setEmailDialogStep] = useState<"input" | "otp" | "success">("input");
    const [newEmailInput, setNewEmailInput] = useState<string>("");
    const [emailOtpInput, setEmailOtpInput] = useState<string>("");
    const [isEmailVerifying, setIsEmailVerifying] = useState<boolean>(false);

    // Dialog state for Mobile Update
    const [isMobileDialogOpen, setIsMobileDialogOpen] = useState<boolean>(false);
    const [mobileDialogStep, setMobileDialogStep] = useState<"input" | "otp" | "success">("input");
    const [newMobileInput, setNewMobileInput] = useState<string>("");
    const [mobileOtpInput, setMobileOtpInput] = useState<string>("");
    const [isMobileVerifying, setIsMobileVerifying] = useState<boolean>(false);

    // QR Code 30-second Dynamic Token State
    const [qrToken, setQrToken] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number>(30000);

    // Generate 30-second token based on user details and time window
    const get30SecToken = (user: SessionUserType | null, email: string, mobile: string) => {
        const now = Date.now();
        const windowIndex = Math.floor(now / 30000);
        const userId = user?.id || 1;
        const baseStr = `${userId}:${email}:${mobile}:${windowIndex}`;
        const hash = CryptoJS.SHA256(baseStr).toString(CryptoJS.enc.Hex).toUpperCase().substring(0, 12);
        return `APT-RES-${userId}-${hash}`;
    };

    const calculateRemaining = () => {
        const now = Date.now();
        const elapsed = now % 30000;
        return Math.max(0, 30000 - elapsed);
    };

    // Fetch user and company data on mount
    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            const { payload } = await getAuthToken();
            const selectedCompany = getFromStorage("selectedCompany") as CompanyMasterShortType | null;

            if (!isMounted) return;

            if (payload) {
                setUserData(payload);
                if (payload.email) setUserEmail(payload.email);
                if (payload.mobile) setUserMobile(payload.mobile);
                if (payload.flat) {
                    setUserFlat(payload.flat);
                }
            } else {
                const storedUser = getFromStorage("username") as string;
                const storedEmail = getFromStorage("email") as string;
                const storedAccess = getFromStorage("access") as string;

                if (storedUser) {
                    setUserData({
                        username: storedUser,
                        email: storedEmail || "info@valueye.in",
                        mobile: "+91 93210 12106",
                        flat: "A-104",
                        access: storedAccess || "Resident",
                        exp: 0,
                        iat: 0,
                        id: 1,
                        name: storedUser,
                        role: 1
                    });
                    if (storedEmail) setUserEmail(storedEmail);
                }
            }

            if (selectedCompany) {
                setCompanyData(selectedCompany);
            }
        }
        fetchData();
        return () => { isMounted = false; };
    }, []);

    // Timer effect for 30-second QR token update
    useEffect(() => {
        setQrToken(get30SecToken(userData, userEmail, userMobile));

        const timer = setInterval(() => {
            const remaining = calculateRemaining();
            setTimeLeft(remaining);

            const currentToken = get30SecToken(userData, userEmail, userMobile);
            setQrToken((prev) => {
                if (prev !== currentToken) {
                    return currentToken;
                }
                return prev;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [userData, userEmail, userMobile]);

    // Handlers for Email Dialog
    const handleOpenEmailDialog = () => {
        setNewEmailInput(userEmail);
        setEmailOtpInput("");
        setEmailDialogStep("input");
        setIsEmailDialogOpen(true);
    };

    const handleSendEmailOtp = () => {
        if (!newEmailInput || !newEmailInput.includes("@")) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setEmailDialogStep("otp");
        toast.info(`OTP sent to ${newEmailInput}`);
    };

    const handleVerifyEmailOtp = () => {
        if (emailOtpInput !== "123456") {
            toast.error("Invalid OTP. Please enter the dummy OTP '123456'.");
            return;
        }

        setIsEmailVerifying(true);
        setTimeout(() => {
            setIsEmailVerifying(false);
            setEmailDialogStep("success");

            setTimeout(() => {
                setUserEmail(newEmailInput);
                setIsEmailDialogOpen(false);
                toast.success("Email address updated successfully!");
            }, 1500);
        }, 600);
    };

    // Handlers for Mobile Dialog
    const handleOpenMobileDialog = () => {
        setNewMobileInput(userMobile);
        setMobileOtpInput("");
        setMobileDialogStep("input");
        setIsMobileDialogOpen(true);
    };

    const handleSendMobileOtp = () => {
        if (!newMobileInput || newMobileInput.length < 10) {
            toast.error("Please enter a valid mobile number.");
            return;
        }
        setMobileDialogStep("otp");
        toast.info(`OTP sent to ${newMobileInput}`);
    };

    const handleVerifyMobileOtp = () => {
        if (mobileOtpInput !== "123456") {
            toast.error("Invalid OTP. Please enter the dummy OTP '123456'.");
            return;
        }

        setIsMobileVerifying(true);
        setTimeout(() => {
            setIsMobileVerifying(false);
            setMobileDialogStep("success");

            setTimeout(() => {
                setUserMobile(newMobileInput);
                setIsMobileDialogOpen(false);
                toast.success("Mobile number updated successfully!");
            }, 1500);
        }, 600);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const checkmarkVariants: Variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                duration: 0.5
            }
        }
    };

    const displayName = userData?.name || userData?.username || "Alexander Wright";
    const displayDesignation = userData?.access ? userData.access.toUpperCase() : "COMMITTEE MEMBER";
    const displaySocietyName = companyData?.cm_name || "Conversational AI Premier";

    const progressPercentage = (timeLeft / 30000) * 100;

    return (
        <>
            <motion.div
                className="space-y-8 pb-16 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* CLEAN SIMPLE HEADER */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                            <User className="h-7 w-7 text-primary" />
                            User Profile & Security Badge
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your registered credentials and access your live dynamic identification badge.
                        </p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 font-bold text-xs shadow-xs flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Verified Resident
                    </Badge>
                </motion.div>

                {/* TWO COLUMN LAYOUT: LEFT = DETAILS, RIGHT = DYNAMIC QR BADGE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: USER DETAILS & CREDENTIAL MANAGEMENT */}
                    <motion.div variants={itemVariants} className="lg:col-span-7 space-y-8">
                        {/* SECTION 1: BASIC DETAILS & ROLE MAPPING */}
                        <Card className="gap-0 rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-card border-primary/10">
                            <CardHeader className="p-6 sm:p-8 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                            <User className="h-5 w-5 text-primary" />
                                            Basic Details & Allocation
                                        </CardTitle>
                                        <CardDescription className="text-xs">Your registered profile information and society mapping</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-2.5 py-1 font-bold text-xs shadow-xs">
                                        Primary Profile
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="p-4 rounded-2xl border border-muted-foreground/10 space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <User className="h-4 w-4 text-primary" /> Full Name
                                        </div>
                                        <div className="text-base font-bold text-foreground pt-1">{displayName}</div>
                                    </div>

                                    {/* Designation */}
                                    <div className="p-4 rounded-2xl border border-muted-foreground/10 space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Briefcase className="h-4 w-4 text-amber-500" /> Designation
                                        </div>
                                        <div className="text-base font-bold text-foreground pt-1">{displayDesignation}</div>
                                    </div>

                                    {/* Wing Allocation */}
                                    <div className="p-4 rounded-2xl border border-muted-foreground/10 space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <Building2 className="h-4 w-4 text-sky-500" /> Wing / Block
                                        </div>
                                        <div className="text-base font-bold text-foreground pt-1">{userWing}</div>
                                    </div>

                                    {/* Flat Allocation */}
                                    <div className="p-4 rounded-2xl border border-muted-foreground/10 space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <MapPin className="h-4 w-4 text-emerald-500" /> Flat Number
                                        </div>
                                        <div className="text-base font-bold text-foreground pt-1">{userFlat}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SECTION 2: CONTACT CREDENTIALS & SECURITY */}
                        <Card className="gap-0 rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-card border-primary/10">
                            <CardHeader className="p-6 sm:p-8 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            Contact Credentials & Security
                                        </CardTitle>
                                        <CardDescription className="text-xs">Manage your verified communication channels and 2FA settings</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-1 font-bold text-xs shadow-xs">
                                        SecureGrid Protected
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <div className="space-y-6">
                                    {/* Email Address Management */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-muted-foreground/10 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                                <Mail className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    Email Address
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">Verified</Badge>
                                                </div>
                                                <div className="text-base font-bold text-foreground">{userEmail}</div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleOpenEmailDialog}
                                            variant="outline"
                                            className="rounded-xl font-semibold text-xs border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 w-full sm:w-auto"
                                        >
                                            <Edit className="h-3.5 w-3.5" /> Update Email
                                        </Button>
                                    </div>

                                    {/* Mobile Number Management */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-muted-foreground/10 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                                <Phone className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    Mobile Number
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">Verified</Badge>
                                                </div>
                                                <div className="text-base font-bold text-foreground">{userMobile}</div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleOpenMobileDialog}
                                            variant="outline"
                                            className="rounded-xl font-semibold text-xs border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2 w-full sm:w-auto"
                                        >
                                            <Edit className="h-3.5 w-3.5" /> Update Mobile
                                        </Button>
                                    </div>

                                    {/* Security Status Box */}
                                    <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500">
                                            <Lock className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                                Multi-Tier Security Active
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">Enabled</Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Your account is protected with end-to-end encryption and two-factor OTP verification for all credential modifications.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* RIGHT COLUMN: DYNAMIC 30-SECOND QR CODE BADGE */}
                    <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col">
                        <Card className="gap-0 h-full rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-card flex flex-col justify-between border-primary/10">
                            <CardHeader className="p-6 sm:p-8 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                            <BadgeCheck className="h-5 w-5 text-primary" />
                                            Live QR Security Pass
                                        </CardTitle>
                                        <CardDescription className="text-xs">Dynamic token auto-refreshes every 30 seconds</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-1 font-bold text-xs shadow-xs flex items-center gap-1 animate-pulse">
                                        <RefreshCw className="h-3 w-3 animate-spin" /> LIVE
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center space-y-8">
                                {/* Simple & Elegant QR Card Container */}
                                <div className="w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-linear-to-b from-slate-900 to-slate-950 text-white shadow-2xl border border-white/10 flex flex-col items-center text-center space-y-6 relative overflow-hidden group">
                                    {/* Subtle top accent bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-emerald-500 to-sky-500" />

                                    {/* Header Info */}
                                    <div className="space-y-1 w-full">
                                        <div className="text-xs font-bold tracking-widest text-primary uppercase">{displaySocietyName}</div>
                                        <div className="text-lg font-extrabold text-white truncate">{displayName}</div>
                                        <div className="text-xs text-slate-400 font-medium">{userWing} • {userFlat}</div>
                                    </div>

                                    {/* Actual Scannable QRCodeCanvas */}
                                    <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-white/10 group-hover:scale-105 transition-transform duration-300">
                                        {qrToken ? (
                                            <QRCodeCanvas
                                                value={qrToken}
                                                size={200}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        ) : (
                                            <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                                                Generating Token...
                                            </div>
                                        )}
                                    </div>

                                    {/* Live Token String Display */}
                                    <div className="w-full space-y-3 bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                            <Hash className="h-3 w-3 text-primary" /> Active Secure Token
                                        </div>
                                        <div className="text-sm font-mono font-bold text-yellow-300 tracking-wider py-1 bg-black/40 rounded-xl border border-white/5 select-all">
                                            {qrToken || "APT-RES-GENERATING..."}
                                        </div>

                                        {/* Subtle Smooth Timer Bar */}
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex justify-between items-center text-[11px] font-medium text-slate-300">
                                                <span>Token Validity</span>
                                                <span className="font-mono text-emerald-400 font-bold">{Math.ceil(timeLeft / 1000)}s</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                <div
                                                    className="h-full bg-linear-to-r from-emerald-500 to-primary rounded-full transition-all duration-100 ease-linear"
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scanner App Instructions */}
                                <div className="text-center space-y-2 max-w-xs">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        📱 When scanned with your QR scanning app, the active secure token string will be instantly captured for verification.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>

            {/* DIALOG 1: UPDATE EMAIL */}
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 border-primary/20 shadow-2xl bg-background overflow-hidden">
                    <DialogHeader className="space-y-2 text-center sm:text-left pb-2">
                        <DialogTitle className="text-xl font-extrabold flex items-center gap-2 justify-center sm:justify-start">
                            <Mail className="h-5 w-5 text-primary" />
                            Update Email Address
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {emailDialogStep === "input"
                                ? "Enter your new email address to receive a one-time verification code."
                                : emailDialogStep === "otp"
                                    ? "We have sent a 6-digit verification code to your new email address."
                                    : "Verification complete. Updating your credentials."}
                        </DialogDescription>
                    </DialogHeader>

                    <Separator className="my-2 bg-muted" />

                    <AnimatePresence mode="wait">
                        {emailDialogStep === "input" && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 py-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">New Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="e.g. info@valueye.in"
                                        value={newEmailInput}
                                        onChange={(e) => setNewEmailInput(e.target.value)}
                                        className="h-12 rounded-xl border-muted-foreground/20 text-base px-4 focus-visible:ring-primary"
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    onClick={handleSendEmailOtp}
                                    className="w-full h-12 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                                >
                                    Send Verification OTP <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}

                        {emailDialogStep === "otp" && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 py-4"
                            >
                                <div className="space-y-2 text-center">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Enter 6-Digit OTP</label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="XXXXXX"
                                        maxLength={6}
                                        value={emailOtpInput}
                                        onChange={(e) => setEmailOtpInput(e.target.value.replace(/\D/g, ""))}
                                        className="text-center text-2xl tracking-[0.5em] font-mono h-14 rounded-xl border-primary/30 focus-visible:ring-primary shadow-inner"
                                        autoFocus
                                    />
                                    <p className="text-[11px] text-muted-foreground pt-1">
                                        💡 For testing, please enter dummy OTP: <span className="font-extrabold text-primary">123456</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setEmailDialogStep("input")}
                                        className="h-12 rounded-xl text-xs font-bold hover:bg-muted"
                                        disabled={isEmailVerifying}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleVerifyEmailOtp}
                                        className="flex-1 h-12 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                                        disabled={isEmailVerifying || emailOtpInput.length !== 6}
                                    >
                                        {isEmailVerifying ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                                            </>
                                        ) : (
                                            "Verify OTP"
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {emailDialogStep === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 flex flex-col items-center justify-center space-y-4 text-center"
                            >
                                <motion.div
                                    variants={checkmarkVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20"
                                >
                                    <Check className="h-10 w-10 stroke-3" />
                                </motion.div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-extrabold text-foreground">Email Verified!</h3>
                                    <p className="text-xs text-muted-foreground">Your email address has been successfully updated.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>

            {/* DIALOG 2: UPDATE MOBILE */}
            <Dialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 border-primary/20 shadow-2xl bg-background overflow-hidden">
                    <DialogHeader className="space-y-2 text-center sm:text-left pb-2">
                        <DialogTitle className="text-xl font-extrabold flex items-center gap-2 justify-center sm:justify-start">
                            <Phone className="h-5 w-5 text-primary" />
                            Update Mobile Number
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {mobileDialogStep === "input"
                                ? "Enter your new mobile number to receive a one-time verification code."
                                : mobileDialogStep === "otp"
                                    ? "We have sent a 6-digit verification code to your new mobile number."
                                    : "Verification complete. Updating your credentials."}
                        </DialogDescription>
                    </DialogHeader>

                    <Separator className="my-2 bg-muted" />

                    <AnimatePresence mode="wait">
                        {mobileDialogStep === "input" && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 py-4"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">New Mobile Number</label>
                                    <Input
                                        type="tel"
                                        placeholder="e.g. +91 98765 43210"
                                        value={newMobileInput}
                                        onChange={(e) => setNewMobileInput(e.target.value)}
                                        className="h-12 rounded-xl border-muted-foreground/20 text-base px-4 focus-visible:ring-primary"
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    onClick={handleSendMobileOtp}
                                    className="w-full h-12 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                                >
                                    Send Verification OTP <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}

                        {mobileDialogStep === "otp" && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 py-4"
                            >
                                <div className="space-y-2 text-center">
                                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Enter 6-Digit OTP</label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="XXXXXX"
                                        maxLength={6}
                                        value={mobileOtpInput}
                                        onChange={(e) => setMobileOtpInput(e.target.value.replace(/\D/g, ""))}
                                        className="text-center text-2xl tracking-[0.5em] font-mono h-14 rounded-xl border-primary/30 focus-visible:ring-primary shadow-inner"
                                        autoFocus
                                    />
                                    <p className="text-[11px] text-muted-foreground pt-1">
                                        💡 For testing, please enter dummy OTP: <span className="font-extrabold text-primary">123456</span>
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setMobileDialogStep("input")}
                                        className="h-12 rounded-xl text-xs font-bold hover:bg-muted"
                                        disabled={isMobileVerifying}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleVerifyMobileOtp}
                                        className="flex-1 h-12 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                                        disabled={isMobileVerifying || mobileOtpInput.length !== 6}
                                    >
                                        {isMobileVerifying ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                                            </>
                                        ) : (
                                            "Verify OTP"
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {mobileDialogStep === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 flex flex-col items-center justify-center space-y-4 text-center"
                            >
                                <motion.div
                                    variants={checkmarkVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20"
                                >
                                    <Check className="h-10 w-10 stroke-3" />
                                </motion.div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-extrabold text-foreground">Mobile Verified!</h3>
                                    <p className="text-xs text-muted-foreground">Your mobile number has been successfully updated.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </>
    );
}