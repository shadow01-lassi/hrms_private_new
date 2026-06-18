import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Info,
    Twitter,
    BookOpen,
    Zap,
    CheckCircle2,
    Bug
} from "lucide-react";

import api from "@/lib/api";
import { ChangeLogType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/lib/constants";

export default function ChangelogPage() {
    const [logs, setLogs] = useState<ChangeLogType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/open/change-log");
            if (res.data.type === "success") {
                setLogs(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch changelog:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <main className="space-y-10 md:space-y-20">
                {/* Hero Section */}
                <div className="mb-10 md:mb-20 flex flex-wrap justify-center md:justify-between items-center">
                    <h1 className="relative inline-block large-heading font-bold tracking-tight mb-8">
                        {APP_NAME} Changelog
                        <span className="inline-block w-[3px] h-[1em] ml-1 align-middle bg-linear-to-b from-blue-400 via-purple-500 to-pink-500 animate-pulse" />
                    </h1>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Button variant="outline" className="rounded-full gap-2 border-slate-200">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                            View docs
                        </Button>
                        <Button variant="outline" className="rounded-full gap-2 border-slate-200">
                            <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                            Follow us on X
                        </Button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mb-10 md:mb-20 flex items-center gap-3 rounded-[24px] bg-blue-100/60 p-6 text-blue-800 border border-blue-100/50">
                    <Info className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">
                        New versions are rolled out gradually and may take a few days to reach all users.
                    </p>
                </div>

                {/* Changelog Timeline */}
                <div className="space-y-32">
                    {isLoading ? (
                        <ChangelogSkeleton />
                    ) : (
                        logs.map((log) => (
                            <ChangelogItem key={log.c_id} log={log} />
                        ))
                    )}
                </div>
            </main>

            <footer className="border-t py-12 bg-slate-50/50 mt-32">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Valueye Society App. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
}

function ChangelogItem({ log }: { log: ChangeLogType }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 bg-muted-foreground/5 p-2 md:p-6 rounded-4xl">
            {/* Left Column: Version & Date */}
            <div className="md:col-span-1 pt-4">
                <div className="sticky top-24">
                    <h3 className="text-2xl font-bold mb-1 tracking-tight">{log.c_version}</h3>
                    <p className="text-sm font-medium text-muted-foreground">
                        {log.c_date && format(new Date(log.c_date), 'MMMM d, yyyy')}
                    </p>
                </div>
            </div>

            {/* Right Column: Content Card */}
            <div className="md:col-span-3">
                <div className="rounded-3xl bg-muted border border-muted-foreground/20 p-4 sm:p-8 md:p-12 transition-all hover:shadow-xl hover:shadow-blue-500/5">
                    <div className="mb-10 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight">{log.c_title}</h2>
                        </div>
                        <div className="flex-1 sm:max-w-[50%]">
                            <p className="text-lg text-muted-foreground leading-relaxed font-normal">
                                {log.c_description}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1 border-t pt-4">
                        <LogAccordion
                            type="Improvements"
                            items={log.c_improvements || []}
                            icon={<Zap className="w-5 h-5 text-blue-500" />}
                        />
                        <LogAccordion
                            type="Fixes"
                            items={log.c_fixes || []}
                            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        />
                        <LogAccordion
                            type="Patches"
                            items={log.c_patches || []}
                            icon={<Bug className="w-5 h-5 text-amber-500" />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogAccordion({ type, items, icon }: { type: string, items: string[], icon: React.ReactNode }) {
    const hasItems = items.length > 0;

    return (
        <Accordion type="single" collapsible className="w-full" disabled={!hasItems}>
            <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className={`flex gap-4 py-4 px-6 rounded-2xl transition-all group border-none text-left no-underline hover:no-underline ${hasItems ? 'hover:bg-white cursor-pointer' : 'opacity-60 cursor-default'}`}>
                    <div className="flex items-center gap-4 font-bold text-lg">
                        {icon}
                        <span className="tracking-tight">{type} ({items.length})</span>
                    </div>
                </AccordionTrigger>
                {hasItems && (
                    <AccordionContent className="pt-2 pb-6 px-16">
                        <ul className="space-y-4">
                            {items.map((item, idx) => (
                                <li key={idx} className="flex gap-3 text-lg text-muted-foreground leading-relaxed font-normal">
                                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                )}
            </AccordionItem>
        </Accordion>
    );
}

function ChangelogSkeleton() {
    return (
        <div className="space-y-24">
            {[1, 2].map((i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-8 opacity-50">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                    <div className="md:col-span-3">
                        <Skeleton className="h-[400px] w-full rounded-[40px]" />
                    </div>
                </div>
            ))}
        </div>
    );
}
