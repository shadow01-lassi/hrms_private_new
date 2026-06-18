import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardSkeleton() {
    return (
        <div className="space-y-8 pb-8 animate-in fade-in duration-500">
            {[1, 2, 3].map((section) => (
                <div key={section} className="space-y-4">
                    {/* Section Header Skeleton */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-1 rounded-full" />
                        <Skeleton className="h-8 w-32 rounded-lg" />
                    </div>

                    {/* Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((card) => (
                            <Card key={card} className="overflow-hidden border-border/50">
                                <CardHeader className="pb-3">
                                    <Skeleton className="h-4 w-2/3 rounded-full" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-full rounded-full" />
                                            <Skeleton className="h-3 w-4/5 rounded-full" />
                                        </div>
                                    </div>
                                    {section === 1 && card === 1 && (
                                        <div className="space-y-2 pt-2">
                                            <Skeleton className="h-3 w-full rounded-full" />
                                            <Skeleton className="h-3 w-full rounded-full" />
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Skeleton className="h-8 flex-1 rounded-lg" />
                                        <Skeleton className="h-8 flex-1 rounded-lg" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {section < 3 && <Separator className="my-6 opacity-50" />}
                </div>
            ))}
        </div>
    );
}
