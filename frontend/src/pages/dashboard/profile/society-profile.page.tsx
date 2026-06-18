import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Building2, MapPin, ShieldCheck, Users2, Car, AlertTriangle,
    CheckCircle2, FileText, Phone, Mail, Copy,
    Layers, Sparkles, Zap, Droplets, Sun, Award, Clock,
    Dumbbell, TreePine, Waves, Wifi, BadgeCheck, HardHat
} from "lucide-react";

// shadcn components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// utils & api
import api from "@/lib/api";
import { getFromStorage } from "@/lib/storage";
import { CompanyMasterShortType, DashboardDataType, AmenityFormData, ParkingMasterType } from "@/lib/types";

export default function SocietyProfilePage() {
    const [company, setCompany] = useState<CompanyMasterShortType | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(null);
    const [amenities, setAmenities] = useState<AmenityFormData[]>([]);
    const [parkings, setParkings] = useState<ParkingMasterType[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("overview");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // 1. Get Company Info from storage
                const selectedComp = getFromStorage("selectedCompany") as CompanyMasterShortType | null;
                const compId = getFromStorage("company");
                setCompany(selectedComp);

                // 2. Fetch Dashboard Data for total units & stats
                const fy = getFromStorage("fy");
                const dashRes = await api.get("/dashboard/new", { params: { fy } });
                if (dashRes.data?.type === "success") {
                    setDashboardData(dashRes.data.data);
                }

                // 3. Fetch Amenities
                const amRes = await api.get("/amenities");
                if (amRes.data?.type === "success") {
                    setAmenities(amRes.data.data);
                }

                // 4. Fetch Parkings
                if (compId) {
                    const parkRes = await api.get("/master/parking-register", { params: { company: compId } });
                    if (parkRes.data?.type === "success") {
                        setParkings(parkRes.data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching society profile data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Scroll Spy Navigation Effect
    useEffect(() => {
        const handleScroll = () => {
            const sections = ["overview", "infrastructure", "amenities", "safety"];
            const scrollPosition = window.scrollY + 250; // offset for sticky header

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const top = element.offsetTop;
                    const height = element.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveTab(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        setActiveTab(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            const top = element.offsetTop - 140; // account for sticky header offset
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Fallbacks and Mocks for Grand UI presentation
    const companyName = company?.cm_name || "Aptos Premier Society";
    const abbrev = company?.cm_abrevation || "APS";
    const regNo = company?.cm_registration_no || "REG/MH/2018/99281";
    const gstNo = company?.cm_gstin || "27AAACG8829P1Z5";
    const panNo = company?.cm_pan || "AAACG8829P";
    const address = company?.cm_address || "Plot No 45, Sunshine Boulevard, Financial District, Hyderabad, 500032";
    const email = company?.cm_email || "info@valueye.in";
    const mobile = company?.cm_mobile || "+91 98765 43210";
    // const altMobile = company?.cm_alt_mobile || "+91 40 2345 6789";
    const sinceYear = company?.cs_start_date ? new Date(company.cs_start_date).getFullYear() : "2023";

    const totalUnits = dashboardData?.management?.unitsAndUsers?.totalUnits || 248;
    const activeResidents = dashboardData?.management?.unitsAndUsers?.breakdown?.activeUsers || 215;
    const displayAmenities = amenities.length > 0 ? amenities : [
        { am_id: 1, am_name: "Olympic Swimming Pool", am_description: "Temperature-controlled 50m pool with separate toddler wading zone.", am_max_capacity: 40, am_status: true },
        { am_id: 2, am_name: "Ultra-Modern Gymnasium", am_description: "Equipped with advanced cardio, strength training machines, and dedicated crossfit arena.", am_max_capacity: 25, am_status: true },
        { am_id: 3, am_name: "Grand Clubhouse", am_description: "Multi-purpose community hall with acoustics, stage, and banquet dining facilities.", am_max_capacity: 150, am_status: true },
        { am_id: 4, am_name: "Rooftop Tennis Court", am_description: "Synthetic turf court with floodlights for evening and night matches.", am_max_capacity: 8, am_status: true },
        { am_id: 5, am_name: "Lush Green Central Park", am_description: "Beautiful landscaped gardens, jogging tracks, and senior citizen relaxation gazebos.", am_max_capacity: 100, am_status: true },
        { am_id: 6, am_name: "High-Speed Wi-Fi Lounge", am_description: "Co-working space with ergonomic seating, meeting pods, and beverage kiosk.", am_max_capacity: 30, am_status: true }
    ];

    const totalParkingsCount = parkings.length > 0 ? parkings.length : Math.round(totalUnits * 1.5);
    const twoWheelerParkings = parkings.filter(p => p.pm_parking_category === 2).length || Math.round(totalParkingsCount * 0.4);
    const fourWheelerParkings = parkings.filter(p => p.pm_parking_category === 4).length || Math.round(totalParkingsCount * 0.6);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    if (loading) {
        return (
            <div className="space-y-8 pb-12">
                <Skeleton className="h-[280px] w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-[200px] w-full rounded-2xl" />
                    <Skeleton className="h-[200px] w-full rounded-2xl md:col-span-2" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <>
            <motion.div
                className="space-y-8 pb-16 animate-in fade-in duration-500 max-w-7xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* 1. GRAND HERO BANNER */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border bg-linear-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground shadow-2xl">
                    {/* Background Decorative Elements */}
                    <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-black/10 blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                    <div className="relative z-10 p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-between">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                            {/* Society Logo / Avatar */}
                            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl p-4 bg-white backdrop-blur-xl border border-white/20 overflow-hidden flex items-center justify-center shadow-inner group hover:scale-105 transition-transform duration-300 shrink-0">
                                {company?.cm_logo ? (
                                    <img src={company.cm_logo} alt={companyName} className="h-full w-full object-cover" />
                                ) : (
                                    <Building2 className="h-16 w-16 text-white group-hover:rotate-6 transition-transform duration-300" />
                                )}
                            </div>

                            <div className="space-y-3 max-w-2xl">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1 text-xs sm:text-sm font-medium gap-1.5 shadow-sm">
                                        <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                                        Premier Society
                                    </Badge>
                                    <Badge variant="secondary" className="bg-black/20 hover:bg-black/30 text-white border-0 backdrop-blur-md px-3 py-1 text-xs sm:text-sm font-medium gap-1.5 shadow-sm">
                                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
                                        With Conversational AI since {sinceYear}
                                    </Badge>
                                </div>

                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">
                                    {companyName}
                                </h1>

                                <p className="text-primary-foreground/90 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-xl drop-shadow-sm flex items-start gap-2 text-left">
                                    <MapPin className="h-5 w-5 text-rose-300 shrink-0 mt-0.5" />
                                    <span>{address}</span>
                                </p>

                                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-primary-foreground/80">
                                    <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                        <Clock className="h-4 w-4 text-sky-300" />
                                        <span>EST. {sinceYear}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                        <Building2 className="h-4 w-4 text-emerald-300" />
                                        <span>Reg: {regNo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Stats Panel */}
                        <div className="flex md:flex-col gap-4 w-full md:w-auto justify-center">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 text-center sm:min-w-[180px] shadow-lg hover:bg-white/15 transition-colors">
                                <div className="flex items-center justify-center gap-1 text-yellow-300 mb-1">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary-foreground/90">Safety Rating</span>
                                </div>
                                <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">4.9<span className="text-lg sm:text-xl font-normal text-primary-foreground/70">/5</span></div>
                                <div className="text-[10px] sm:text-xs text-emerald-300 font-medium mt-1">★ ★ ★ ★ ★ Excellent</div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-5 text-center sm:min-w-[180px] shadow-lg hover:bg-white/15 transition-colors">
                                <div className="flex items-center justify-center gap-1 text-sky-300 mb-1">
                                    <Users2 className="h-5 w-5" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary-foreground/90">Occupancy</span>
                                </div>
                                <div className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{activeResidents}<span className="text-lg sm:text-xl font-normal text-primary-foreground/70">/{totalUnits}</span></div>
                                <div className="text-[10px] sm:text-xs text-sky-200 font-medium mt-1">~{Math.round((activeResidents / totalUnits) * 100)}% Active Ratio</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* STICKY NAVIGATION BAR */}
                <div className="sticky top-0 z-40 bg-background/80 rounded-xl backdrop-blur-lg border-b border-muted mb-8 transition-all">
                    <div className="flex justify-center md:justify-start">
                        <div className="h-auto bg-muted/60 p-1.5 rounded-2xl shadow-inner border gap-2 grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
                            <button
                                onClick={() => scrollToSection("overview")}
                                className={`rounded-xl px-5 py-2.5 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "overview" ? "shadow-md bg-background text-primary" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Building2 className="h-4 w-4" /> Overview
                            </button>
                            <button
                                onClick={() => scrollToSection("infrastructure")}
                                className={`rounded-xl px-5 py-2.5 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "infrastructure" ? "shadow-md bg-background text-primary" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Layers className="h-4 w-4" /> Infrastructure
                            </button>
                            <button
                                onClick={() => scrollToSection("amenities")}
                                className={`rounded-xl px-5 py-2.5 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "amenities" ? "shadow-md bg-background text-primary" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Sparkles className="h-4 w-4" /> Amenities
                            </button>
                            <button
                                onClick={() => scrollToSection("safety")}
                                className={`rounded-xl px-5 py-2.5 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === "safety" ? "shadow-md bg-background text-primary" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <ShieldCheck className="h-4 w-4" /> Safety & Eco
                            </button>
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTIONS CONTAINER */}
                <div className="space-y-16 pt-4">
                    {/* SECTION 1: OVERVIEW & CREDENTIALS */}
                    <div id="overview" className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Overview & Credentials</h2>
                        </div>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Legal Credentials Card */}
                            <motion.div variants={itemVariants} className="md:col-span-2">
                                <Card className="h-full rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden gap-0">
                                    <CardHeader className="border-b pt-3">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                                    <FileText className="h-6 w-6 text-primary" />
                                                    Official Registrations & Credentials
                                                </CardTitle>
                                                <CardDescription className="text-base text-muted-foreground">
                                                    Verified legal and statutory registration identities of the society.
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-semibold text-xs sm:text-sm">
                                                Verified Legal Entity
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10 hover:border-primary/20 transition-colors group">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                                <span>Registration Number</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(regNo, "Registration Number")}>
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            <div className="text-lg font-bold text-foreground font-mono tracking-tight">{regNo}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Active Registration
                                            </div>
                                        </div>

                                        <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10 hover:border-primary/20 transition-colors group">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                                <span>GSTIN Number</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(gstNo, "GSTIN Number")}>
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            <div className="text-lg font-bold text-foreground font-mono tracking-tight">{gstNo}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Tax Compliant
                                            </div>
                                        </div>

                                        <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10 hover:border-primary/20 transition-colors group">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                                <span>PAN Number</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(panNo, "PAN Number")}>
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            <div className="text-lg font-bold text-foreground font-mono tracking-tight">{panNo}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Permanent Account
                                            </div>
                                        </div>

                                        <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10 hover:border-primary/20 transition-colors group">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                                <span>Society System ID</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(String(company?.cm_id || 1), "Society ID")}>
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            <div className="text-lg font-bold text-foreground font-mono tracking-tight">#{company?.cm_id || 1} ({abbrev})</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Primary Tenant Key
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Contact Command Center */}
                            <motion.div variants={itemVariants}>
                                <Card className="h-full rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col justify-between gap-0">
                                    <div>
                                        <CardHeader className="bg-muted/30 border-b pt-3">
                                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                                <Phone className="h-6 w-6 text-primary" />
                                                Command Center
                                            </CardTitle>
                                            <CardDescription className="text-base text-muted-foreground">
                                                Official society communication channels and helpdesk coordinates.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            <div className="space-y-1.5 group">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-primary" /> Full Address
                                                </label>
                                                <div className="text-sm font-medium text-foreground leading-relaxed p-3 rounded-xl bg-muted/40 border border-muted-foreground/10">
                                                    {address}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 group">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5 text-primary" /> Official Email
                                                </label>
                                                <div className="text-sm font-medium text-foreground p-3 rounded-xl bg-muted/40 border border-muted-foreground/10 flex items-center justify-between">
                                                    <span>{email}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(email, "Email")}>
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 group">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-primary" /> Helpdesk Mobile
                                                </label>
                                                <div className="text-sm font-medium text-foreground p-3 rounded-xl bg-muted/40 border border-muted-foreground/10 flex items-center justify-between">
                                                    <span>{mobile}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => copyToClipboard(mobile, "Mobile")}>
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>

                                    <div className="px-6 border-t mt-auto">
                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            <Button variant="outline" className="w-full rounded-xl border-dashed hover:bg-primary/5 hover:text-primary" onClick={() => copyToClipboard(address, "Address")}>
                                                <Copy className="mr-2 h-4 w-4" /> Copy Address
                                            </Button>
                                            <Button className="w-full rounded-xl shadow-md hover:shadow-lg transition-shadow" onClick={() => window.open(`mailto:${email}`)}>
                                                <Mail className="mr-2 h-4 w-4" /> Send Email
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* SECTION 2: INFRASTRUCTURE & CAPACITY MATRIX */}
                    <div id="infrastructure" className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Layers className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Infrastructure & Capacity</h2>
                        </div>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Residential Units */}
                                <motion.div variants={itemVariants}>
                                    <Card className="h-full rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-linear-to-br from-background via-background to-primary/5">
                                        <CardHeader className="p-6 sm:p-8 pb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
                                                <Building2 className="h-6 w-6 text-primary" />
                                            </div>
                                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Residential Matrix</CardTitle>
                                            <CardDescription className="text-base">Breakdown of flats and active occupancy.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Units</span>
                                                    <span className="text-3xl font-extrabold text-foreground tracking-tight">{totalUnits}</span>
                                                </div>
                                                <Progress value={100} className="h-2 bg-primary/20" />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Residents</span>
                                                    <span className="text-2xl font-bold text-foreground tracking-tight">{activeResidents}</span>
                                                </div>
                                                <Progress value={(activeResidents / totalUnits) * 100} className="h-2 bg-sky-500/20 [&>div]:bg-sky-500" />
                                            </div>

                                            <div className="pt-4 border-t border-muted-foreground/10 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                                <span>Occupancy Ratio</span>
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-0.5">
                                                    {Math.round((activeResidents / totalUnits) * 100)}% Occupied
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Parking Bays */}
                                <motion.div variants={itemVariants}>
                                    <Card className="h-full rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-linear-to-br from-background via-background to-amber-500/5">
                                        <CardHeader className="p-6 sm:p-8 pb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20 shadow-inner">
                                                <Car className="h-6 w-6 text-amber-500" />
                                            </div>
                                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Parking Hub</CardTitle>
                                            <CardDescription className="text-base">Allocated parking slots and vehicle categories.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Bays</span>
                                                    <span className="text-3xl font-extrabold text-foreground tracking-tight">{totalParkingsCount}</span>
                                                </div>
                                                <Progress value={100} className="h-2 bg-amber-500/20 [&>div]:bg-amber-500" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10 space-y-1">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">4-Wheeler</span>
                                                    <div className="text-xl font-bold text-foreground">{fourWheelerParkings}</div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10 space-y-1">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">2-Wheeler</span>
                                                    <div className="text-xl font-bold text-foreground">{twoWheelerParkings}</div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-muted-foreground/10 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                                <span>EV Charging Stations</span>
                                                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2.5 py-0.5 gap-1">
                                                    <Zap className="h-3 w-3" /> 12 Active
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Refuge & Disaster Management */}
                                <motion.div variants={itemVariants}>
                                    <Card className="h-full rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-linear-to-br from-background via-background to-rose-500/5">
                                        <CardHeader className="p-6 sm:p-8 pb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20 shadow-inner">
                                                <AlertTriangle className="h-6 w-6 text-rose-500" />
                                            </div>
                                            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Refuge & Safety</CardTitle>
                                            <CardDescription className="text-base">Emergency assembly points and refuge zones.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                    <HardHat className="h-3.5 w-3.5 text-rose-500" /> Designated Refuge Areas
                                                </label>
                                                <div className="text-sm font-bold text-foreground p-3 rounded-xl bg-muted/40 border border-muted-foreground/10">
                                                    7th & 14th Floors (All Towers)
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                    <Users2 className="h-3.5 w-3.5 text-rose-500" /> Emergency Assembly Point
                                                </label>
                                                <div className="text-sm font-bold text-foreground p-3 rounded-xl bg-muted/40 border border-muted-foreground/10">
                                                    Central Lawns & Clubhouse Forecourt
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-muted-foreground/10 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                                <span>Structural Audit</span>
                                                <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 px-2.5 py-0.5 gap-1">
                                                    <ShieldCheck className="h-3 w-3" /> Seismic Zone III Passed
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    {/* SECTION 3: AMENITIES */}
                    <div id="amenities" className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Community Amenities</h2>
                        </div>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-6 rounded-3xl border border-muted-foreground/10">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                        <Sparkles className="h-6 w-6 text-primary" />
                                        Exclusive Community Facilities
                                    </h3>
                                    <p className="text-base text-muted-foreground">
                                        Explore the premium amenities maintained for the exclusive use of society members.
                                    </p>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-bold shadow-sm">
                                    {displayAmenities.length} Active Amenities
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                                {displayAmenities.map((am, idx) => (
                                    <motion.div key={am.am_id || idx} variants={itemVariants}>
                                        <Card className="h-full rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1">
                                            <CardHeader className="p-6 sm:p-8 pb-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                        {idx % 6 === 0 ? <Waves className="h-7 w-7 text-primary group-hover:text-white transition-colors" /> :
                                                            idx % 6 === 1 ? <Dumbbell className="h-7 w-7 text-primary group-hover:text-white transition-colors" /> :
                                                                idx % 6 === 2 ? <Building2 className="h-7 w-7 text-primary group-hover:text-white transition-colors" /> :
                                                                    idx % 6 === 3 ? <Award className="h-7 w-7 text-primary group-hover:text-white transition-colors" /> :
                                                                        idx % 6 === 4 ? <TreePine className="h-7 w-7 text-primary group-hover:text-white transition-colors" /> :
                                                                            <Wifi className="h-7 w-7 text-primary group-hover:text-white transition-colors" />}
                                                    </div>
                                                    <Badge variant={am.am_status ? "outline" : "secondary"} className={am.am_status ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-xs font-semibold" : "px-3 py-1 text-xs font-semibold"}>
                                                        {am.am_status ? "Operational" : "Under Maintenance"}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-xl font-bold tracking-tight text-foreground pt-4 group-hover:text-primary transition-colors">
                                                    {am.am_name}
                                                </CardTitle>
                                                <CardDescription className="text-sm line-clamp-3 pt-1">
                                                    {am.am_description}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="p-6 sm:p-8 pt-0 mt-auto">
                                                <Separator className="my-4" />
                                                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Users2 className="h-4 w-4 text-primary" /> Max Capacity
                                                    </span>
                                                    <span className="text-sm font-bold text-foreground bg-muted px-3 py-1 rounded-full border border-muted-foreground/10">
                                                        {am.am_max_capacity || 25} Persons
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* SECTION 4: SAFETY & SUSTAINABILITY */}
                    <div id="safety" className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold text-foreground tracking-tight">Safety & Eco-Grid</h2>
                        </div>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Safety Audit Profile */}
                                <motion.div variants={itemVariants}>
                                    <Card className="h-full rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-linear-to-br from-background via-background to-emerald-500/5">
                                        <CardHeader className="p-6 sm:p-8 pb-4 border-b bg-muted/30">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                                        <ShieldCheck className="h-6 w-6 text-emerald-500" />
                                                        Safety & Security Audit
                                                    </CardTitle>
                                                    <CardDescription className="text-base">Comprehensive multi-tier community safety assessment.</CardDescription>
                                                </div>
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 font-extrabold text-xl shadow-inner">
                                                    4.9
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 sm:p-8 space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground">24/7 Biometric Gatekeeper Access</div>
                                                            <div className="text-xs text-muted-foreground">App-verified visitor & delivery entry</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-1 text-xs font-semibold">Active</Badge>
                                                </div>

                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground">HD CCTV Surveillance Network</div>
                                                            <div className="text-xs text-muted-foreground">148+ cameras across all common areas</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-1 text-xs font-semibold">Active</Badge>
                                                </div>

                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground">Fire Safety Audit Pass</div>
                                                            <div className="text-xs text-muted-foreground">Automated sprinklers & hydrants certified</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-1 text-xs font-semibold">Certified</Badge>
                                                </div>

                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                                            <CheckCircle2 className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground">100% Power Backup Grid</div>
                                                            <div className="text-xs text-muted-foreground">DG sets covering elevators & common lighting</div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-1 text-xs font-semibold">Active</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Sustainability & Eco Initiatives */}
                                <motion.div variants={itemVariants}>
                                    <Card className="h-full rounded-3xl border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-linear-to-br from-background via-background to-sky-500/5">
                                        <CardHeader className="p-6 sm:p-8 pb-4 border-b bg-muted/30">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                                        <Sun className="h-6 w-6 text-sky-500" />
                                                        Sustainability & Eco-Grid
                                                    </CardTitle>
                                                    <CardDescription className="text-base">Green initiatives and eco-friendly infrastructure.</CardDescription>
                                                </div>
                                                <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/20 px-3 py-1.5 font-bold text-sm shadow-sm">
                                                    Eco-Leader
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 sm:p-8 space-y-6">
                                            <div className="space-y-6">
                                                <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                                                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        <span className="flex items-center gap-1.5"><Sun className="h-4 w-4 text-amber-500" /> Solar Power Generation</span>
                                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-2 py-0.5">45 kW Rooftop Plant</Badge>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground pt-1">
                                                        Powers 40% of common area lighting and clubhouse facilities, reducing carbon footprint significantly.
                                                    </p>
                                                </div>

                                                <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                                                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        <span className="flex items-center gap-1.5"><Droplets className="h-4 w-4 text-sky-500" /> Rainwater Harvesting</span>
                                                        <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/20 px-2 py-0.5">200 kL Pits</Badge>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground pt-1">
                                                        Deep recharge storage pits maintaining groundwater levels and supplying secondary flushing lines.
                                                    </p>
                                                </div>

                                                <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                                                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                        <span className="flex items-center gap-1.5"><TreePine className="h-4 w-4 text-emerald-500" /> Organic Waste Composting</span>
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5">On-site OWC</Badge>
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground pt-1">
                                                        Daily wet waste processed into high-grade organic manure utilized across all society gardens and lawns.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}