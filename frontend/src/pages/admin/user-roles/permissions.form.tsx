import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Search,
    Loader2,
    ShieldCheck,
    KeyRound,
    X,
    CheckSquare,
    Square,
    ShieldAlert,
    ChevronDown,
    ChevronRight,
    Layers,
    FileText,
    ShieldPlus
} from "lucide-react";

import { getSearchParams, cn } from "@/lib/utils";
import { putIntoStorage, deleteFromStorage } from "@/lib/storage";
import api from "@/lib/api";
import { PermissionType } from "@/lib/types";

import { usePermission } from "@/hooks/use-permissions";
import { AccessDenied } from "@/components/prompts/access-denied";

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

    const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');
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

// Tree Structure Types
type TreeNode = {
    id: string;
    name: string;
    children: Record<string, TreeNode>;
    leaves: PermissionType[];
    allLeafIds: number[];
};

// Converts dot.notation into a Nested Tree
const buildTree = (permissions: PermissionType[]) => {
    const root: Record<string, TreeNode> = {};

    permissions.forEach(p => {
        const parts = p.pm_code.split('.');
        if (parts.length === 0) {
            parts.push("General");
        }

        let currentLevel = root;
        let currentPath = "";
        const nodesTraversed: TreeNode[] = [];

        parts.forEach(part => {
            currentPath = currentPath ? `${currentPath}.${part}` : part;
            if (!currentLevel[part]) {
                currentLevel[part] = { id: currentPath, name: part, children: {}, leaves: [], allLeafIds: [] };
            }
            nodesTraversed.push(currentLevel[part]);
            currentLevel = currentLevel[part].children;
        });

        const parentNode = nodesTraversed[nodesTraversed.length - 1];
        parentNode.leaves.push(p);

        nodesTraversed.forEach(node => {
            node.allLeafIds.push(p.pm_id);
        });
    });

    return Object.values(root).sort((a, b) => a.name.localeCompare(b.name));
};

// --- RECURSIVE TREE COMPONENT ---
const PermissionGroup = ({ node, selectedIds, onToggle, searchQuery }: { node: TreeNode, selectedIds: number[], onToggle: (ids: number[], forceCheck: boolean) => void, searchQuery: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Auto-expand if searching
    useEffect(() => {
        if (searchQuery) setIsOpen(true);
    }, [searchQuery]);

    const isAllSelected = node.allLeafIds.length > 0 && node.allLeafIds.every(id => selectedIds.includes(id));
    const isSomeSelected = node.allLeafIds.some(id => selectedIds.includes(id));
    const checkedState = isAllSelected ? true : isSomeSelected ? "indeterminate" : false;

    return (
        <div className="mt-2 animate-in fade-in duration-300">
            {/* Folder / Module Header */}
            <div
                className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border transition-all group",
                    isOpen ? "bg-muted/40 border-border/60 shadow-sm" : "bg-transparent border-transparent hover:bg-muted/30"
                )}
            >
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                    className="p-1 hover:bg-muted-foreground/20 rounded-md transition-colors"
                >
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>

                <Checkbox
                    checked={checkedState}
                    onCheckedChange={(c) => onToggle(node.allLeafIds, c === true || c === "indeterminate")}
                    className="data-[state=indeterminate]:bg-primary/50 data-[state=indeterminate]:text-primary-foreground"
                />

                <span
                    className="font-bold text-[13px] uppercase tracking-wider cursor-pointer flex-1 select-none flex items-center gap-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Layers className="w-3.5 h-3.5 text-primary/60" />
                    <HighlightText text={node.name} query={searchQuery} />
                </span>

                <Badge variant="secondary" className="text-[10px] bg-background border shadow-sm px-2">
                    {node.allLeafIds.filter(id => selectedIds.includes(id)).length} / {node.allLeafIds.length}
                </Badge>
            </div>

            {/* Nested Content */}
            {isOpen && (
                <div className="pl-6 border-l-2 border-border/30 ml-4 mt-2 space-y-2 pb-2">
                    {/* Sub-modules */}
                    {Object.values(node.children).map(child => (
                        <PermissionGroup key={child.id} node={child} selectedIds={selectedIds} onToggle={onToggle} searchQuery={searchQuery} />
                    ))}

                    {/* Leaf Actions (e.g., Read, Write) */}
                    {node.leaves.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {node.leaves.map(leaf => {
                                const isLeafSelected = selectedIds.includes(leaf.pm_id);
                                return (
                                    <div
                                        key={leaf.pm_id}
                                        onClick={() => onToggle([leaf.pm_id], !isLeafSelected)}
                                        className={cn(
                                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm group",
                                            isLeafSelected ? "bg-primary/5 border-primary/40 shadow-sm ring-1 ring-primary/10" : "bg-background border-border/50 hover:border-border"
                                        )}
                                    >
                                        <Checkbox
                                            checked={isLeafSelected}
                                            className="mt-0.5 pointer-events-none"
                                        />
                                        <div className="flex flex-col space-y-1 overflow-hidden">
                                            <span className={cn("text-sm font-semibold truncate transition-colors", isLeafSelected ? "text-primary" : "text-foreground group-hover:text-primary/80")}>
                                                <HighlightText text={leaf.pm_code.split('.').pop() || leaf.pm_code} query={searchQuery} />
                                            </span>
                                            <span className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                                                <HighlightText text={leaf.pm_description} query={searchQuery} />
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// --- BREADCRUMB COMPONENT ---
const CodeBreadcrumbs = ({ code, query }: { code: string, query: string }) => {
    const parts = code.split('.');
    return (
        <span className="flex flex-wrap items-center gap-1.5 text-sm">
            {parts.map((part, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                    <span className={cn(
                        "font-bold",
                        idx === parts.length - 1 ? "text-primary" : "text-foreground"
                    )}>
                        <HighlightText text={part} query={query} />
                    </span>
                    {idx < parts.length - 1 && <span className="text-muted-foreground/40 font-normal">/</span>}
                </span>
            ))}
        </span>
    );
};


// --- MAIN PAGE ---
const permissionsFormSchema = z.object({
    rm_name: z.string().min(2, "Role name is required."),
    rm_description: z.string().optional(),
    pm_ids: z.array(z.number()),
});
type IPermissionsForm = z.infer<typeof permissionsFormSchema>;

export default function RolePermissionsPage() {
    const viewPermission = usePermission("user-roles.read");
    const createPermission = usePermission("user-roles.create");
    const updatePermission = usePermission("user-roles.update");

    const navigate = useNavigate();
    const params = getSearchParams();
    const roleId = Number(params.get("id"));

    const [allPermissions, setAllPermissions] = useState<PermissionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Independent Search States
    const [searchLeft, setSearchLeft] = useState("");
    const [searchRight, setSearchRight] = useState("");

    const form = useForm<IPermissionsForm>({
        resolver: zodResolver(permissionsFormSchema),
        defaultValues: {
            rm_name: "",
            rm_description: "",
            pm_ids: []
        },
    });

    const selectedPmIds = form.watch("pm_ids");

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            if (!viewPermission) {
                toast.error("You do not have permission to view this page.");
                return;
            }

            try {
                setLoading(true);
                const allRes = await api.get("/permission");
                setAllPermissions(allRes.data.data);

                if (roleId) {
                    const roleRes = await api.get(`/permission/role/${roleId}`);
                    const { rm_name, rm_description, permissions } = roleRes.data.data;
                    form.reset({
                        rm_name,
                        rm_description: rm_description || "",
                        pm_ids: permissions.map((p: any) => p.pm_id)
                    });
                }
            } catch (error) {
                toast.error("Failed to load permissions.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [roleId, form]);

    // Filter Left Panel
    const filteredAvailablePermissions = useMemo(() => {
        return allPermissions.filter(p => isFuzzyMatch(searchLeft, p.pm_code) || isFuzzyMatch(searchLeft, p.pm_description));
    }, [allPermissions, searchLeft]);

    // Build Interactive Tree from filtered data
    const permissionTree = useMemo(() => {
        return buildTree(filteredAvailablePermissions);
    }, [filteredAvailablePermissions]);

    // Filter Right Panel
    const filteredSelectedPermissions = useMemo(() => {
        return allPermissions
            .filter(p => selectedPmIds.includes(p.pm_id))
            .filter(p => isFuzzyMatch(searchRight, p.pm_code) || isFuzzyMatch(searchRight, p.pm_description))
            .sort((a, b) => a.pm_code.localeCompare(b.pm_code));
    }, [allPermissions, selectedPmIds, searchRight]);

    // Actions
    const togglePermissions = (ids: number[], forceCheck: boolean) => {
        const current = new Set(form.getValues("pm_ids"));
        if (forceCheck) {
            ids.forEach(id => current.add(id));
        } else {
            ids.forEach(id => current.delete(id));
        }
        form.setValue("pm_ids", Array.from(current), { shouldDirty: true });
    };

    const handleSave = async (values: IPermissionsForm) => {
        if (!createPermission || !updatePermission) {
            toast.error("You do not have permission to perform this action.");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...values,
                rm_id: roleId || undefined
            };
            const endpoint = roleId ? "/permission/update" : "/permission/create";
            await api.post(endpoint, payload);

            // 🔥 REFRESH PERMISSIONS: Fetch latest permissions for current user and update storage
            try {
                const permRes = await api.get("/permission/my");
                if (permRes.data.type === "success") {
                    putIntoStorage("permissions", permRes.data.data);
                    deleteFromStorage("sidebar");
                }
            } catch (permError) {
                console.error("Failed to refresh local permissions", permError);
            }

            toast.success(roleId ? "Role updated successfully." : "Role created successfully.");
            navigate(-1);
        } catch (error) {
            toast.error(roleId ? "Failed to update role." : "Failed to create role.");
        } finally {
            setSubmitting(false);
            window.location.reload();
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-2xl">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <p className="text-muted-foreground font-medium animate-pulse">Loading access policies...</p>
            </div>
        );
    }

    return (
        <>
            {(viewPermission && createPermission) ? (
                <div className="w-full max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* STICKY HEADER */}
                    <div className="sticky top-0 z-40 bg-background/80 rounded-2xl backdrop-blur-xl shadow-sm border-b border-border/40 p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
                                {roleId ? <ShieldCheck className="w-6 h-6 text-primary" /> : <ShieldPlus className="w-6 h-6 text-primary" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-extrabold tracking-tight">
                                        {roleId ? "Update Role" : "Create New Role"}
                                    </h1>
                                    {roleId && (
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                            ID: {roleId}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {roleId ? "Modify role identity and access policies." : "Define a new role and its granular permissions."}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                className="hidden sm:flex"
                            >
                                Cancel
                            </Button>

                            <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md hidden md:block border">
                                <span className="text-foreground font-bold">{selectedPmIds.length}</span> / {allPermissions.length} Selected
                            </div>

                            {(createPermission || updatePermission) && (
                                <Button
                                    onClick={form.handleSubmit(handleSave)}
                                    disabled={submitting}
                                    className="w-full sm:w-auto shadow-md"
                                >
                                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                    {roleId ? "Save Changes" : "Create Role"}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Form {...form}>
                        <div className="mb-8">
                            <Card className="border-border/50 shadow-sm bg-card overflow-hidden gap-0">
                                <CardHeader className="bg-muted/20 border-b border-border/40">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                                        <FileText className="w-4 h-4" />
                                        Role Identity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="rm_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-tight">Role Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Society Manager"
                                                            className="bg-background shadow-sm h-12 text-base font-semibold focus-visible:ring-primary/20"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="rm_description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-tight">Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe the responsibilities and scope of this role..."
                                                            className="bg-background shadow-sm min-h-[48px] h-12 resize-none py-3 focus-visible:ring-primary/20"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </Form>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT PANEL: PERMISSION BUILDER */}
                        <Card className="lg:col-span-7 border-border/50 shadow-sm flex flex-col h-[750px] bg-card overflow-hidden gap-0">
                            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <KeyRound className="w-5 h-5 text-primary" />
                                        Available Policies
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => togglePermissions(filteredAvailablePermissions.map(p => p.pm_id), true)} className="h-8 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10">
                                            <CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Select All
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => togglePermissions(filteredAvailablePermissions.map(p => p.pm_id), false)} className="h-8 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                            <Square className="w-3.5 h-3.5 mr-1.5" /> Clear
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by code or description (e.g., 'acc read')"
                                        className="pl-9 bg-background shadow-sm border-border/50 focus-visible:ring-primary/20"
                                        value={searchLeft}
                                        onChange={(e) => setSearchLeft(e.target.value)}
                                    />
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden">
                                <ScrollArea className="h-full px-4 py-2">
                                    {permissionTree.length > 0 ? (
                                        <div className="pb-8">
                                            {permissionTree.map(node => (
                                                <PermissionGroup
                                                    key={node.id}
                                                    node={node}
                                                    selectedIds={selectedPmIds}
                                                    onToggle={togglePermissions}
                                                    searchQuery={searchLeft}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-3">
                                            <ShieldAlert className="w-10 h-10 opacity-20" />
                                            <p>No permissions found matching "{searchLeft}"</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* RIGHT PANEL: SELECTED SUMMARY */}
                        <Card className="lg:col-span-5 border-border/50 shadow-sm flex flex-col h-[750px] bg-card overflow-hidden gap-0">
                            <CardHeader className="bg-muted/20 border-b border-border/40 pb-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center justify-between w-full">
                                        Granted Policies
                                        <Badge variant="secondary" className="bg-background border-border/50 font-bold">
                                            {selectedPmIds.length}
                                        </Badge>
                                    </CardTitle>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter granted policies..."
                                        className="pl-9 bg-background shadow-sm border-border/50 focus-visible:ring-primary/20"
                                        value={searchRight}
                                        onChange={(e) => setSearchRight(e.target.value)}
                                    />
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden">
                                <ScrollArea className="h-full p-4">
                                    {filteredSelectedPermissions.length > 0 ? (
                                        <div className="space-y-2 pb-8">
                                            {filteredSelectedPermissions.map((p) => (
                                                <div
                                                    key={p.pm_id}
                                                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:bg-muted/30 transition-colors gap-3"
                                                >
                                                    <div className="flex flex-col space-y-1 overflow-hidden">
                                                        <CodeBreadcrumbs code={p.pm_code} query={searchRight} />
                                                        <span className="text-xs text-muted-foreground line-clamp-1 pr-2">
                                                            <HighlightText text={p.pm_description} query={searchRight} />
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => togglePermissions([p.pm_id], false)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 pt-20">
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                                                <ShieldCheck className="w-8 h-8 opacity-20" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-foreground">
                                                    {searchRight ? "No matches found" : "No Access Granted"}
                                                </p>
                                                <p className="text-sm max-w-[200px] mt-1 mx-auto">
                                                    {searchRight ? "Try adjusting your search query." : "Select policies from the left panel to assign them."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            ) : (
                <AccessDenied />
            )}
        </>
    );
}