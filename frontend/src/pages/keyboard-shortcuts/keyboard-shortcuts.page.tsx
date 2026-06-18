import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTROL_KEY, SHIFT_KEY } from "@/lib/constants";
import { Command, Laptop, Search, RotateCcw, HelpCircle, FileText, Plus, Save, X, LayoutGrid, AlignJustify, Moon } from "lucide-react";

interface Shortcut {
    keys: string[];
    description: string;
    icon: React.ReactNode;
}

interface ShortcutGroup {
    title: string;
    shortcuts: Shortcut[];
}

export default function KeyboardShortcutsPage() {
    const shortcutGroups: ShortcutGroup[] = [
        {
            title: "General",
            shortcuts: [
                { keys: ["Alt", "T"], description: "Toggle Dark/Light Mode", icon: <Moon className="w-4 h-4" /> },
                { keys: [CONTROL_KEY, "R"], description: "Selective Content Reload (No Page Refresh)", icon: <RotateCcw className="w-4 h-4" /> },
                { keys: [CONTROL_KEY, "F"], description: "Global Search", icon: <Search className="w-4 h-4" /> },
                { keys: [CONTROL_KEY, "/"], description: "Open Help Center", icon: <HelpCircle className="w-4 h-4" /> },
                { keys: [CONTROL_KEY, "K"], description: "Keyboard Shortcuts", icon: <Command className="w-4 h-4" /> },
            ]
        },
        {
            title: "Forms & Data",
            shortcuts: [
                { keys: [CONTROL_KEY, "N"], description: "Create New Entry", icon: <Plus className="w-4 h-4" /> },
                { keys: [CONTROL_KEY, "S"], description: "Save / Submit Form", icon: <Save className="w-4 h-4" /> },
                { keys: ["Esc"], description: "Cancel / Close Modal", icon: <X className="w-4 h-4" /> },
                { keys: [CONTROL_KEY, "P"], description: "Print / Export to PDF", icon: <FileText className="w-4 h-4" /> },
            ]
        },
        {
            title: "Navigation",
            shortcuts: [
                { keys: [CONTROL_KEY, SHIFT_KEY, "D"], description: "Go to Dashboard", icon: <Laptop className="w-4 h-4" /> },
                { keys: ["Alt", "←"], description: "Go Back", icon: null },
                { keys: ["Alt", "→"], description: "Go Forward", icon: null },
            ]
        }
    ];

    // --- UPGRADED GRID CARD ---
    const renderGridCard = (shortcut: Shortcut, idx: number) => (
        <Card
            key={idx}
            className="group relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 py-0"
        >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardContent className="p-4 flex flex-col h-full gap-4 relative z-10">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-muted text-muted-foreground ring-1 ring-border/50 shadow-inner group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/20 transition-all duration-300 group-hover:scale-110">
                        {shortcut.icon || <Command className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium text-foreground/80 leading-snug pt-1 group-hover:text-foreground transition-colors">
                        {shortcut.description}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 mt-auto pt-2 justify-end">
                    {shortcut.keys.map((key) => (
                        <kbd
                            key={key}
                            className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-md border border-border/80 bg-muted/30 font-mono text-[11px] font-semibold text-muted-foreground shadow-[0_2px_0_var(--tw-shadow-color)] shadow-border/50 transition-all group-hover:border-primary/30 group-hover:text-primary group-hover:shadow-primary/20"
                        >
                            {key}
                        </kbd>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    // --- NEW: DISTINCT LIST ITEM FOR LIST VIEW ---
    const renderListItem = (shortcut: Shortcut, idx: number) => (
        <div
            key={idx}
            className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                <div className="p-1.5 rounded-md text-muted-foreground/70 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    {shortcut.icon || <Command className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                    {shortcut.description}
                </span>
            </div>

            <div className="flex items-center gap-1.5">
                {shortcut.keys.map((key) => (
                    <kbd
                        key={key}
                        className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-[4px] border border-border/60 bg-background font-mono text-[10px] font-semibold text-muted-foreground shadow-sm transition-colors group-hover:border-border"
                    >
                        {key}
                    </kbd>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 py-2">
            {/* HEADER - UNTOUCHED */}
            <Tabs defaultValue="list" className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
                        <p className="text-xs text-muted-foreground italic">Master the interface with these quick keys.</p>
                    </div>
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="grid" className="h-7 px-2">
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </TabsTrigger>
                        <TabsTrigger value="list" className="h-7 px-2">
                            <AlignJustify className="w-3.5 h-3.5" />
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* UPGRADED GRID VIEW */}
                <TabsContent value="grid" className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-500">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                        {shortcutGroups.map((group) => (
                            <div key={group.title} className="space-y-4 border-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        {group.title}
                                    </h3>
                                    <div className="h-px flex-1 bg-border" />
                                </div>
                                <div className="grid gap-3">
                                    {group.shortcuts.map((shortcut, idx) => renderGridCard(shortcut, idx))}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* UPGRADED LIST VIEW */}
                <TabsContent value="list" className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-500">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {shortcutGroups.map((group) => (
                            <div key={group.title} className="space-y-2">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-2 mb-3">
                                    {group.title}
                                </h3>
                                <Card className="border-border/50 bg-background/50 shadow-sm overflow-hidden">
                                    <div className="flex flex-col divide-y divide-border/30">
                                        {group.shortcuts.map((shortcut, idx) => renderListItem(shortcut, idx))}
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* FOOTER - UNTOUCHED */}
            <Card className="bg-linear-to-r from-primary/5 to-transparent border-primary/10 mt-4">
                <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Tip: You can use these shortcuts from anywhere in the application to speed up your workflow.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}