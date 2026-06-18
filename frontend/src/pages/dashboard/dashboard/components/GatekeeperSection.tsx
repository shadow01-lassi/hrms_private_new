import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    UserCheck,
    Users,
    AlertTriangle,
    Eye,
    HardHat,
    CarFront,
    ExternalLink,
    ClipboardList,
    UserSearch,
} from "lucide-react";
import { GatekeeperSectionType } from "@/lib/types";

export default function GatekeeperSection({ data }: { data: GatekeeperSectionType }) {
    const navigate = useNavigate();
    const { dailyVisitors, staffMembers, alerts } = data;

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2">
                <div className="h-8 w-1 rounded-full bg-amber-500" />
                <h2 className="heading">Gatekeeper</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Daily Visitors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="small-heading flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" strokeWidth={2.5} />
                            Daily Visitors
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <div className="flex justify-around items-center">
                            <div>
                                <p className="heading">{dailyVisitors.totalIn}</p>
                                <p className="text-sm text-muted-foreground">Visitors In Today</p>
                            </div>

                            <Separator orientation="vertical" className="h-10!" />

                            <div>
                                <p className="heading text-red-500">{dailyVisitors.stillInside}</p>
                                <p className="text-sm text-muted-foreground">Still Inside</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Staff Members */}
                <Card>
                    <CardHeader>
                        <CardTitle className="small-heading flex items-center gap-2">
                            <HardHat className="h-4 w-4 text-amber-500" strokeWidth={2.5} />
                            Staff Members
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <div className="flex justify-around items-center gap-6">
                            <div>
                                <p className="heading">{staffMembers.totalIn}</p>
                                <p className="text-sm text-muted-foreground">Staff In Today</p>
                            </div>
                            <Separator orientation="vertical" className="h-10!" />
                            <div>
                                <p className="heading text-red-500">{staffMembers.stillInside}</p>
                                <p className="text-sm text-muted-foreground">Still Inside</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts Card */}
                {/* Quick Actions Card */}
                <Card className="row-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="small-heading flex items-center gap-2">
                            <Eye className="h-4 w-4 text-teal-500" strokeWidth={2.5} />
                            Quick Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start text-xs h-8"
                            onClick={() => navigate("/dashboard/gatekeeper/staff")}>
                            <UserCheck className="h-3.5 w-3.5 mr-2 text-blue-500" />
                            Staff Management
                            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-xs h-8"
                            onClick={() => navigate("/dashboard/gatekeeper/visitors")}>
                            <ClipboardList className="h-3.5 w-3.5 mr-2 text-violet-500" />
                            Visitor Logs
                            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-xs h-8"
                            onClick={() => navigate("/dashboard/gatekeeper/parking")}>
                            <CarFront className="h-3.5 w-3.5 mr-2 text-teal-500" />
                            Parking Management
                            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="col-span-2! grid grid-cols-2 px-6">
                    <Button variant="ghost" className="w-full justify-start text-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => navigate("/dashboard/gatekeeper/panic-alerts")}>
                        <AlertTriangle className="h-3.5 w-3.5 mr-2 text-red-500" />
                        Panic Alerts
                        <span className="ml-auto font-bold text-red-500">{alerts.panicAlertsThisMonth}</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-lg hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        onClick={() => navigate("/dashboard/gatekeeper/missing-visitors")}>
                        <UserSearch className="h-3.5 w-3.5 mr-2 text-amber-500" />
                        Missing Visitors
                        <span className="ml-auto font-bold text-amber-500">{alerts.missingVisitorsThisMonth}</span>
                    </Button>
                </Card>
            </div>
        </div>
    );
}
