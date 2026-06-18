import { useState, useEffect, useMemo } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HelpCircle, Book, Phone, Search, ChevronLeft, LayoutDashboard, Database, ChevronRight } from "lucide-react";
import { PAGE_CONFIG, APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";
import { HELP_DATA, DEFAULT_HELP } from "@/lib/helpData";
import { cn, nestMenuData } from "@/lib/utils";
import { SidebarItemsType, MenuItemType } from "@/lib/types";

export default function HelpPage({ sidebarData }: { sidebarData: SidebarItemsType[] }) {
    const location = useLocation();
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const nestedSidebar = useMemo(() => nestMenuData(sidebarData), [sidebarData]);

    // Helper to find mm_id from current path
    const getActiveMmId = (items: MenuItemType[], parentPath = ""): string | null => {
        for (const item of items) {
            const currentPath = `${parentPath.toLowerCase()}/${item.mm_name.toLowerCase()}`.replace(/\/+/g, "/");
            const fullPath = APP_SIDEBAR_PARENT_LINK + currentPath;

            // Check if this item is the active one
            if (matchPath({ path: fullPath, end: true }, location.pathname)) {
                return item.mm_id.toString();
            }

            // Check children
            if (item.children && item.children.length > 0) {
                const childResult = getActiveMmId(item.children, currentPath);
                if (childResult) return childResult;
            }
        }
        return null;
    };

    // Identify current page on mount
    useEffect(() => {
        const activeId = getActiveMmId(nestedSidebar);
        if (activeId) {
            setSelectedPageId(activeId);
        } else {
            // Fallback to PAGE_CONFIG check if sidebar doesn't match (e.g. root dashboard)
            const SORTED_CONFIG = [...PAGE_CONFIG].sort((a, b) => b.path.length - a.path.length);
            const activePage = SORTED_CONFIG.find((config) => matchPath({ path: config.path, end: false }, location.pathname));
            setSelectedPageId(activePage?.pageId || "0");
        }
    }, [location.pathname, nestedSidebar]);

    const activeHelp = selectedPageId ? (HELP_DATA[selectedPageId] || DEFAULT_HELP) : DEFAULT_HELP;

    const handleBackToCurrent = () => {
        const activeId = getActiveMmId(nestedSidebar);
        setSelectedPageId(activeId || "0");
    };

    const renderSidebarItems = (items: MenuItemType[], parentPath = "") => {
        return items
            .filter(item =>
                item.mm_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.children && item.children.some(child => child.mm_label.toLowerCase().includes(searchQuery.toLowerCase())))
            )
            .map((item) => {
                const currentPath = `${parentPath.toLowerCase()}/${item.mm_name.toLowerCase()}`.replace(/\/+/g, "/");
                const hasChildren = item.children && item.children.length > 0;

                if (hasChildren) {
                    return (
                        <Collapsible key={item.mm_id} defaultOpen={true} className="w-full">
                            <CollapsibleTrigger asChild>
                                <button className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md hover:bg-muted transition-colors text-left">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>{item.mm_label}</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 transition-transform duration-200" />
                                </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-4 space-y-1 mt-1">
                                {renderSidebarItems(item.children!, currentPath)}
                            </CollapsibleContent>
                        </Collapsible>
                    );
                }

                return (
                    <button
                        key={item.mm_id}
                        onClick={() => setSelectedPageId(item.mm_id.toString())}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left truncate",
                            selectedPageId === item.mm_id.toString() ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted"
                        )}
                    >
                        <Book className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{item.mm_label}</span>
                    </button>
                );
            });
    };

    return (
        <div className="w-full flex h-full gap-6 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-72 flex flex-col gap-4 border-r pr-4 shrink-0">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search help topics..."
                        className="pl-8 text-xs h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-1">
                        <button
                            onClick={() => setSelectedPageId("0")}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md transition-colors mb-2",
                                selectedPageId === "0" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                            )}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            General Help
                        </button>
                        <div className="space-y-1">
                            {renderSidebarItems(nestedSidebar)}
                        </div>
                    </div>
                </ScrollArea>

                <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900 mt-auto">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Phone className="w-4 h-4" />
                            <span className="text-[10px] font-semibold">Support: +91 9321012106</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <ScrollArea className="flex-1 pr-1">
                <div className="space-y-6 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">{activeHelp.title}</h2>
                            <p className="text-sm text-muted-foreground mt-1">{activeHelp.description}</p>
                        </div>
                        {selectedPageId !== "0" && (
                            <button
                                onClick={handleBackToCurrent}
                                className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-2 py-1 rounded"
                            >
                                <ChevronLeft className="w-3 h-3" /> Back to current page help
                            </button>
                        )}
                    </div>

                    <div className="separator h-px bg-border w-full" />

                    {/* How-to Samples */}
                    {activeHelp.samples.length > 0 && (
                        <div className="grid grid-cols-1 gap-6">
                            {activeHelp.samples.map((sample, idx) => (
                                <Card key={idx} className="border-none shadow-none bg-muted/20">
                                    <CardHeader className="p-4 pb-0">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-500 rounded-lg">
                                                <Book className="w-4 h-4 text-white" />
                                            </div>
                                            <CardTitle className="text-base font-semibold">{sample.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-3">
                                        <div
                                            className="prose text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: sample.content }}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* FAQs */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-orange-500" /> Frequently Asked Questions
                        </h3>
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {activeHelp.faqs.map((faq, idx) => (
                                <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-xl px-4 overflow-hidden bg-card transition-all hover:border-primary/50">
                                    <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
