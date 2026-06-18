import { useEffect, useState, useMemo } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    AlertTriangle,
    LayoutGrid,
    Search,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import api from "@/lib/api";
import { MenuItemType, PermissionType } from "@/lib/types";
import { nestMenuData, cn } from "@/lib/utils";

// --- ALGORITHMS & HELPERS ---

// Robust Fuzzy Matcher (tolerates typos by checking character sequence)
function isFuzzyMatch(query: string, text: string) {
    if (!query) return true;
    if (!text) return false;
    const tokens = query.toLowerCase().trim().split(/\s+/);
    const target = text.toLowerCase();

    return tokens.every(token => {
        if (target.includes(token)) return true;
        let i = 0, j = 0;
        while (i < token.length && j < target.length) {
            if (token[i] === target[j]) i++;
            j++;
        }
        return i === token.length;
    });
}

// Smart Text Highlighter Component
const HighlightText = ({ text, query }: { text: string; query: string }) => {
    if (!query || !text) return <>{text}</>;
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return <>{text}</>;

    const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 font-bold rounded-sm px-0.5 shadow-sm">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
};

// --- DYNAMIC ICON COMPONENT ---
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const Icon = (LucideIcons as any)[name];
    if (!Icon) return <LucideIcons.HelpCircle className={cn("w-4 h-4", className)} />;
    return <Icon className={cn("w-4 h-4", className)} />;
};

export default function MenuStructurePage() {
    const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
    const [permissions, setPermissions] = useState<PermissionType[]>([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isWarningOpen, setIsWarningOpen] = useState(false);

    const [currentItem, setCurrentItem] = useState<Partial<MenuItemType>>({});
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [menuRes, permRes] = await Promise.allSettled([
                api.get("/sidebar/all"),
                api.get("/permission")
            ]);

            if (menuRes.status === "fulfilled") {
                setMenuItems(menuRes.value.data.data);
            } else {
                console.error("Sidebar Fetch Error:", menuRes.reason);
                toast.error("Failed to fetch menu items");
            }

            if (permRes.status === "fulfilled") {
                setPermissions(permRes.value.data.data);
            } else {
                console.error("Permissions Fetch Error:", permRes.reason);
                // Don't toast for permissions, just log it
            }
        } catch (error) {
            console.error("Fetch Data Unexpected Error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Filter menu items to include matches, their ancestors, and their descendants
    const filteredMenuItems = useMemo(() => {
        if (!searchQuery.trim()) return menuItems;

        const query = searchQuery.toLowerCase().trim();
        const matchingIds = new Set<number>();

        // 1. Find direct matches
        menuItems.forEach(item => {
            const match =
                isFuzzyMatch(query, item.mm_label || "") ||
                isFuzzyMatch(query, item.mm_name || "") ||
                isFuzzyMatch(query, item.mm_link || "") ||
                isFuzzyMatch(query, item.mm_access_type || "") ||
                isFuzzyMatch(query, item.mm_icon || "");

            if (match) {
                matchingIds.add(item.mm_id);
            }
        });

        // 2. Include all ancestors of matching items so the tree doesn't break
        const parentMap = new Map<number, number | null>();
        menuItems.forEach(item => parentMap.set(item.mm_id, item.mm_parent_id));

        matchingIds.forEach(id => {
            let curr = parentMap.get(id);
            while (curr != null) {
                matchingIds.add(curr);
                curr = parentMap.get(curr);
            }
        });

        // 3. Include all descendants of matching items so if you search a parent, you see its children
        let added = true;
        while (added) {
            added = false;
            menuItems.forEach(item => {
                if (item.mm_parent_id != null && matchingIds.has(item.mm_parent_id) && !matchingIds.has(item.mm_id)) {
                    matchingIds.add(item.mm_id);
                    added = true;
                }
            });
        }

        return menuItems.filter(item => matchingIds.has(item.mm_id));
    }, [menuItems, searchQuery]);

    const nestedData = useMemo(() => nestMenuData(filteredMenuItems), [filteredMenuItems]);

    // Automatically expand parent nodes when searching
    useEffect(() => {
        if (searchQuery.trim()) {
            const newExpanded = new Set<number>();
            filteredMenuItems.forEach(item => {
                if (item.mm_parent_id != null) {
                    newExpanded.add(item.mm_parent_id);
                }
            });
            setExpandedNodes(newExpanded);
        }
    }, [searchQuery, filteredMenuItems]);

    const toggleNode = (id: number) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedNodes(newExpanded);
    };

    const handleAdd = (parentId: number | null = null) => {
        setCurrentItem({
            mm_name: "",
            mm_label: "",
            mm_parent_id: parentId,
            mm_access_type: "AD",
            mm_order: 0,
            mm_icon: "ChevronRight",
            mm_link: ""
        });
        setIsEditModalOpen(true);
    };

    const handleEdit = (item: MenuItemType) => {
        setCurrentItem({ ...item });
        setIsEditModalOpen(true);
    };

    const onSave = async () => {
        // Check if name changed and warn if it's an existing item
        if (currentItem.mm_id && currentItem.mm_name !== menuItems.find(m => m.mm_id === currentItem.mm_id)?.mm_name) {
            setIsWarningOpen(true);
            return;
        }
        submitSave();
    };

    const submitSave = async () => {
        try {
            if (currentItem.mm_id) {
                await api.put(`/sidebar/${currentItem.mm_id}`, currentItem);
                toast.success("Menu item updated");
            } else {
                await api.post("/sidebar", currentItem);
                toast.success("Menu item created");
            }
            setIsEditModalOpen(false);
            setIsWarningOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to save menu item");
        }
    };

    const onDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/sidebar/${itemToDelete}`);
            toast.success("Menu item deleted");
            setIsDeleteDialogOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to delete menu item");
        }
    };

    const moveItem = async (id: number, direction: "up" | "down") => {
        const item = menuItems.find(m => m.mm_id === id);
        if (!item) return;

        // Find siblings in the same branch, stabilizing sort by ID if orders are 0
        const parentId = item.mm_parent_id || null;
        const siblings = menuItems
            .filter(m => (m.mm_parent_id || null) === parentId)
            .sort((a, b) => {
                const orderA = a.mm_order || 0;
                const orderB = b.mm_order || 0;
                if (orderA !== orderB) return orderA - orderB;
                return (a.mm_id || 0) - (b.mm_id || 0);
            });

        const index = siblings.findIndex(m => m.mm_id === id);

        if (direction === "up" && index > 0) {
            // Swap with previous
            const temp = siblings[index];
            siblings[index] = siblings[index - 1];
            siblings[index - 1] = temp;
        } else if (direction === "down" && index < siblings.length - 1) {
            // Swap with next
            const temp = siblings[index];
            siblings[index] = siblings[index + 1];
            siblings[index + 1] = temp;
        } else {
            return;
        }

        // Reassign consecutive order values so database properly saves the visual sequence
        const orders = siblings.map((m, idx) => ({ id: m.mm_id, order: idx + 1 }));

        try {
            await api.post("/sidebar/reorder", { orders });
            fetchData();
            toast.success("Order updated successfully!");
        } catch (error) {
            toast.error("Failed to reorder items");
        }
    };

    const renderTree = (items: MenuItemType[], depth = 0) => {
        return (
            <div className={cn("space-y-1", depth > 0 && "ml-6 border-l border-border pl-4 mt-1")}>
                {items.map((item) => (
                    <div key={item.mm_id} className="group">
                        <Card className={cn(
                            "border-none shadow-none hover:bg-accent/50 transition-colors gap-0 py-0",
                            depth === 0 ? "bg-muted/30" : "bg-transparent"
                        )}>
                            <CardContent className="p-2 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center">
                                        {item.children && item.children.length > 0 ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => toggleNode(item.mm_id)}
                                            >
                                                {expandedNodes.has(item.mm_id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </Button>
                                        ) : (
                                            <div className="w-6" />
                                        )}
                                        <div className="p-1.5 rounded-md bg-background border shadow-xs">
                                            <DynamicIcon name={item.mm_icon || "ChevronRight"} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">
                                                <HighlightText text={item.mm_label || ""} query={searchQuery} />
                                            </span>
                                            {item.mm_access_type && (
                                                <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal opacity-70">
                                                    <HighlightText text={item.mm_access_type} query={searchQuery} />
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-mono text-muted-foreground">
                                            /<HighlightText text={item.mm_name || ""} query={searchQuery} />
                                            {item.mm_link ? <span> (<HighlightText text={item.mm_link} query={searchQuery} />)</span> : null}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(item.mm_id, "up")}>
                                        <ArrowUp size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(item.mm_id, "down")}>
                                        <ArrowDown size={14} />
                                    </Button>
                                    <Separator orientation="vertical" className="h-4 mx-1" />
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500" onClick={() => handleAdd(item.mm_id)}>
                                        <Plus size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500" onClick={() => handleEdit(item)}>
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setItemToDelete(item.mm_id); setIsDeleteDialogOpen(true); }}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <AnimatePresence>
                            {expandedNodes.has(item.mm_id) && item.children && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    {renderTree(item.children, depth + 1)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="flex items-center gap-2 max-w-3xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by label, route name, link, access type, or icon..."
                        className="pl-9 pr-8 bg-background/50 backdrop-blur-xs border-border/60 focus-visible:ring-primary shadow-xs"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                        >
                            <LucideIcons.X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <Badge variant="secondary" className="px-2.5 py-1 text-xs font-medium animate-in fade-in zoom-in-95">
                        {filteredMenuItems.length} {filteredMenuItems.length === 1 ? "match" : "matches"}
                    </Badge>
                )}

                <Button onClick={() => handleAdd()} className="gap-2">
                    <Plus size={16} /> Add Root Menu
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-xs max-w-3xl">
                <CardContent className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <LucideIcons.Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : menuItems.length > 0 ? (
                        renderTree(nestedData)
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <LayoutGrid size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No menu items found. Start by adding a root menu.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit / Add Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{currentItem.mm_id ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mm_label" className="text-right">Label</Label>
                            <Input
                                id="mm_label"
                                value={currentItem.mm_label}
                                onChange={(e) => setCurrentItem({ ...currentItem, mm_label: e.target.value })}
                                className="col-span-3"
                                placeholder="Dashboard"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mm_name" className="text-right">Route Name</Label>
                            <div className="col-span-3 space-y-1">
                                <Input
                                    id="mm_name"
                                    value={currentItem.mm_name}
                                    onChange={(e) => setCurrentItem({ ...currentItem, mm_name: e.target.value })}
                                    placeholder="dashboard"
                                />
                                <p className="text-[10px] text-muted-foreground">This defines the URL path segment.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mm_link" className="text-right">Full Link</Label>
                            <Input
                                id="mm_link"
                                value={currentItem.mm_link || ""}
                                onChange={(e) => setCurrentItem({ ...currentItem, mm_link: e.target.value })}
                                className="col-span-3"
                                placeholder="/admin/dashboard"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mm_icon" className="text-right">Icon Name</Label>
                            <div className="col-span-3 flex gap-2 items-center">
                                <Input
                                    id="mm_icon"
                                    value={currentItem.mm_icon || ""}
                                    onChange={(e) => setCurrentItem({ ...currentItem, mm_icon: e.target.value })}
                                    placeholder="LayoutDashboard"
                                />
                                <div className="p-2 border rounded-md bg-muted">
                                    <DynamicIcon name={currentItem.mm_icon || ""} />
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Access Type</Label>
                            <Select
                                value={currentItem.mm_access_type}
                                onValueChange={(val) => setCurrentItem({ ...currentItem, mm_access_type: val })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select Access Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AD">Admin (AD)</SelectItem>
                                    <SelectItem value="SA">Super Admin (SA)</SelectItem>
                                    <SelectItem value="US">User (US)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Permission</Label>
                            <Select
                                value={currentItem.mm_pm_id?.toString()}
                                onValueChange={(val) => setCurrentItem({ ...currentItem, mm_pm_id: parseInt(val) })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="No Permission Required" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">None</SelectItem>
                                    {permissions.map(p => (
                                        <SelectItem key={p.pm_id} value={p.pm_id.toString()}>
                                            {p.pm_code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={onSave}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Warning Dialog for Name Change */}
            <AlertDialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle /> Critical Warning
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Changing the <strong>Route Name</strong> (mm_name) will change the URL structure for this menu item and all its children.
                            This might break existing bookmarks, links, or internal page settings.
                            Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={submitSave} className="bg-amber-600 hover:bg-amber-700">
                            I Understand, Proceed
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">Delete Menu Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the menu item.
                            If this item has children, they will become root items or may be orphaned depending on system logic.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}