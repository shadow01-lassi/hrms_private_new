// importing from react-router-dom
import { Link, useNavigate } from "react-router-dom";

// importing shadcn components
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// importing icons
import {
    Megaphone,
    Users,
    Building2,
    Clock,
    AlertTriangle,
    MessageSquareWarning,
    TreePalm,
    FileText,
    Plus,
    BarChart3,
    Send,
    CalendarCheck,
    Wrench,
    FileStack,
    CircleDollarSign,
    Landmark,
    ArrowRight,
    Instagram,
} from "lucide-react";

// importing constants, types, utilities and others
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";
import { ManagementSectionType } from "@/lib/types";

export default function ManagementSection({ data }: { data: ManagementSectionType }) {
    const navigate = useNavigate();
    const { announcements, unitsAndUsers, helpdesk, amenitiesAndHallBookings } = data;

    // Smart helpdesk logic: prioritize high-priority complaints if any
    const totalHighPriorityPending = helpdesk.complaints.personal.highPriority.pending + helpdesk.complaints.openArea.highPriority.pending;
    const totalHighPriorityInProgress = helpdesk.complaints.personal.highPriority.inProgress + helpdesk.complaints.openArea.highPriority.inProgress;
    const hasHighPriority = totalHighPriorityPending > 0 || totalHighPriorityInProgress > 0;

    const totalPending = helpdesk.complaints.personal.pending + helpdesk.complaints.openArea.pending;
    const totalInProgress = helpdesk.complaints.personal.inProgress + helpdesk.complaints.openArea.inProgress;

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <h2 className="heading">Management</h2>
            </div>

            {/* Row 1: Notification + Announcements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Send Notification Card */}
                <Card className="group cursor-pointer"
                    onClick={() => navigate(`${APP_SIDEBAR_PARENT_LINK}/announcements/forum`)}>
                    <CardContent className="flex items-center gap-4 py-2">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20">
                            <Send className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="small-heading">Post on Forum</p>
                            <p className="text-xs text-muted-foreground">Start a discussion on a topic</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    </CardContent>
                </Card>

                {/* Create Announcements Card */}
                <Card className="group cursor-pointer"
                    onClick={() => navigate(`${APP_SIDEBAR_PARENT_LINK}/announcements/notice-board/add`)}>
                    <CardContent className="flex items-center gap-4 py-2">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="small-heading">Create Announcement</p>
                            <p className="text-xs text-muted-foreground">Create a new announcement</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    </CardContent>
                </Card>

                {/* Post on Social Media Card */}
                <Card className="group cursor-pointer"
                    onClick={() => navigate("/dashboard/announcements/notifications/create")}>
                    <CardContent className="flex items-center gap-4 py-2">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20">
                            <Instagram className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="small-heading">Post on Social</p>
                            <p className="text-xs text-muted-foreground">Post a new image</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                    </CardContent>
                </Card>

                {/* Announcements Card */}
                <Card className="gap-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="small-heading">Announcements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-around items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                                    <Megaphone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="heading">{announcements.totalAnnouncementsThisYear}</p>
                                    <p className="text-sm text-muted-foreground">Announcements</p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-10!" />

                            <div className="flex items-center gap-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                                    <CalendarCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="heading">{announcements.totalMeetingsCalledThisYear}</p>
                                    <p className="text-sm text-muted-foreground">Meetings</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                size="sm"
                                variant={"outline"}
                                onClick={() => navigate("/dashboard/announcements/notices")}
                                className="border-primary text-primary"
                            >
                                Post Announcement
                            </Button>
                            <Button
                                size="sm"
                                variant={"outline"}
                                onClick={() => navigate("/dashboard/announcements/meetings")}
                                className="border-primary text-primary"
                            >
                                Create Meeting
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Units & Users Card */}
                <Card className="gap-0">
                    <CardHeader className="pb-3">
                        <CardTitle className="small-heading">Units & Users</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Top stats */}
                        <div className="flex items-center gap-6">
                            <div className="flex justify-around items-center gap-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="heading">{unitsAndUsers.uniqueUsers}</p>
                                    <p className="text-sm text-muted-foreground">Unique Users</p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-10!" />

                            <div className="flex items-center gap-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
                                    <Building2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                    <p className="heading">{unitsAndUsers.totalUnits}</p>
                                    <p className="text-sm text-muted-foreground">Total Units</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2">
                            <div className="light-text text-muted-foreground"><b className="font-black text-foreground mr-2">{unitsAndUsers.breakdown.admins}</b> Admins</div>
                            <div className="light-text text-muted-foreground"><b className="font-black text-foreground mr-2">{unitsAndUsers.breakdown.usersNotLoggedIn}</b> Never Logged In</div>
                            <div className="light-text text-muted-foreground"><b className="font-black text-foreground mr-2">{unitsAndUsers.breakdown.activeUsers}</b> Active Users</div>
                            <div className="light-text text-muted-foreground"><b className="font-black text-foreground mr-2">{unitsAndUsers.breakdown.pendingVerification}</b> Pending Verification</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Amenities & Hall Bookings */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="small-heading">Amenities & Hall Bookings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="rounded-lg bg-muted/50 p-2 cursor-pointer" onClick={() => navigate(`${APP_SIDEBAR_PARENT_LINK}/amenities/amenities-list`)}>
                                <p className="heading">{amenitiesAndHallBookings.totalAmenities}</p>
                                <p className="text-sm text-muted-foreground">Manage Amenities</p>
                            </div>

                            {/* <div className="rounded-lg bg-muted/50 p-2">
                                <p className="heading">{amenitiesAndHallBookings.totalBookingsThisMonth}</p>
                                <p className="text-sm text-muted-foreground">Bookings this Month</p>
                            </div> */}

                            <div
                                className={`rounded-lg bg-muted/50 p-2 cursor-pointer ${amenitiesAndHallBookings.pendingHallBookingRequests > 0 ? "border border-amber-200 dark:border-amber-900 bg-yellow-50/30 dark:bg-amber-950/30" : ""}`}
                                onClick={() => navigate(`${APP_SIDEBAR_PARENT_LINK}/amenities/hall-bookings/booking-requests`)}
                            >
                                <p className="heading text-destructive">{amenitiesAndHallBookings.pendingHallBookingRequests}</p>
                                <p className="text-sm text-muted-foreground">Booking Requests</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2">
                            <div className="light-text text-muted-foreground"><b className="font-black text-foreground mr-2">{amenitiesAndHallBookings.totalBookingsThisMonth}</b> Bookings this month</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Helpdesk Tracker Card */}
                <Card className="col-span-1 md:col-span-2">
                    <div className="px-6 flex justify-between items-center">
                        <CardTitle className="small-heading">Helpdesk Tracker</CardTitle>

                        <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" className="flex-1 text-xs"
                                onClick={() => navigate("/dashboard/requests/member-complaints")}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> New Complaint
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-xs"
                                onClick={() => navigate("/dashboard/requests/documents")}>
                                <FileText className="h-3.5 w-3.5 mr-1" /> Doc Request
                            </Button>
                        </div>
                    </div>

                    <CardContent className="space-y-3 grid grid-cols-1 md:grid-cols-2">
                        {/* Complaints overview */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
                                    <MessageSquareWarning className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                    <p className="heading">{helpdesk.complaints.personal.total}</p>
                                    <p className="text-sm text-muted-foreground">Personal</p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="h-10!" />

                            <div className="flex items-center gap-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                                    <TreePalm className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="heading">{helpdesk.complaints.openArea.total}</p>
                                    <p className="text-sm text-muted-foreground">Open Area</p>
                                </div>
                            </div>
                        </div>

                        {/* Smart priority display */}
                        {hasHighPriority ? (
                            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-2.5">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                    <span className="text-xs font-semibold text-red-700 dark:text-red-400">High Priority Attention</span>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    <span className="text-red-600 dark:text-red-400">{totalHighPriorityPending} pending</span>
                                    <span className="text-orange-600 dark:text-orange-400">{totalHighPriorityInProgress} in progress</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Badge variant="outline" className="text-xs gap-1">
                                    <Clock className="h-3 w-3" /> {totalPending} Pending
                                </Badge>
                                <Badge variant="outline" className="text-xs gap-1">
                                    <Wrench className="h-3 w-3" /> {totalInProgress} In Progress
                                </Badge>
                            </div>
                        )}

                        {/* Document Requests */}
                        <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                            <FileStack className="h-4 w-4 text-indigo-500" />
                            <span className="text-xs text-muted-foreground">Document Requests</span>
                            <div className="ml-auto flex gap-2">
                                <Badge variant="secondary" className="text-[10px]">{helpdesk.documentRequests.active} Active</Badge>
                                <Badge variant="outline" className="text-[10px]">{helpdesk.documentRequests.pending} Pending</Badge>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <Button size="sm" variant="outline" className="w-full text-xs"
                            onClick={() => navigate("/dashboard/requests/documents/types")}>
                            <CircleDollarSign className="h-3.5 w-3.5 mr-1" /> Manage Document Types & Pricing
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="gap-4">
                    <CardHeader>
                        <CardTitle className="small-heading">Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 flex flex-col justify-between gap-4">
                        <div className="grid grid-cols-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs h-9"
                                onClick={() => navigate("/dashboard/vendors")}
                            >
                                <Landmark className="h-3.5 w-3.5 mr-2 text-teal-500" />
                                View Vendor
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full justify-start text-xs h-9"
                                onClick={() => navigate("/dashboard/registers")}
                            >
                                <FileText className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                                Manage Documents
                            </Button>
                        </div>

                        <div className="text-center space-y-2">
                            <Link
                                to={`${APP_SIDEBAR_PARENT_LINK}/reports`}
                                className="h-16 flex items-center justify-center gap-3 p-2 rounded-2xl relative overflow-hidden cursor-pointer shadow-[0_8px_24px_rgba(0,122,255,0.25)] transition-all border border-primary"
                                style={{ background: "linear-gradient(135deg, var(--primary) 0%, #005ce6 100%)" }}
                            >
                                <div className="flex items-center gap-2 text-background dark:text-foreground">
                                    <BarChart3 className="h-6 w-6" />
                                    <span className="text-lg font-medium">View Reports</span>
                                </div>
                                {/* Decorative Circle */}
                                <div className="absolute -right-5 -top-5 w-16 h-16 rounded-full bg-linear-to-b from-background/25 to-transparent" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
