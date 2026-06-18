// importing client
import api from "@/lib/api";

// importing from react
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// importing components
import { useStyle } from "@/components/StyleProvider";
import { useTheme } from "@/components/theme-provider";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { toast } from "sonner";

// importing icons
import {
    Palette,
    RefreshCw,
    Check,
    Copy,
    Upload,
    Sun,
    Moon,
    Undo2
} from "lucide-react";

// importing constants, utilities
import {
    SAMPLE_THEMES,
    DARK_SAMPLE_THEMES
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const APTOS_DEFAULTS = {
    BG_COLOR: "#b1c5ff",
    TEXT_COLOR: "#020617",
    PRIMARY_COLOR: "#2563eb",
    LIGHT_THEME_COLORS: {
        background: "#f8fafc",
        foreground: "#020617",
        card: "#ffffff",
        "card-foreground": "#020617",
        popover: "#ffffff",
        "popover-foreground": "#020617",
        primary: "#2563eb",
        "primary-foreground": "#ffffff",
        secondary: "#f1f5f9",
        "secondary-foreground": "#010816",
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        accent: "#eff6ff",
        "accent-foreground": "#010816",
        destructive: "#dc2626",
        success: "#16a34a",
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#94a3b8",
        sidebar: "#b1c5ff",
        "sidebar-foreground": "#000000",
        "sidebar-primary": "#2563eb",
        "sidebar-border": "#e2e8f0",
        "destructive-foreground": "#ffffff"
    },
    DARK_THEME_COLORS: {
        background: "#020617",
        foreground: "#f8fafc",
        card: "#0f172a",
        "card-foreground": "#f8fafc",
        popover: "#0f172a",
        "popover-foreground": "#f8fafc",
        primary: "#6366f1",
        "primary-foreground": "#ffffff",
        secondary: "#1e293b",
        "secondary-foreground": "#f8fafc",
        muted: "#1e293b",
        "muted-foreground": "#94a3b8",
        accent: "#1e293b",
        "accent-foreground": "#f8fafc",
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
        success: "#22c55e",
        border: "#1e293b",
        input: "#1e293b",
        ring: "#334155",
        sidebar: "#0f172a",
        "sidebar-foreground": "#f8fafc",
        "sidebar-primary": "#6366f1",
        "sidebar-border": "#1e293b"
    }
};

const THEME_VARIABLES = [
    { name: "background", label: "Page Background" },
    { name: "foreground", label: "Text Foreground" },
    { name: "card", label: "Card Background" },
    { name: "card-foreground", label: "Card Text" },
    { name: "popover", label: "Popover Background" },
    { name: "popover-foreground", label: "Popover Text" },
    { name: "primary", label: "Theme Primary" },
    { name: "primary-foreground", label: "Primary Text" },
    { name: "secondary", label: "Secondary Color" },
    { name: "secondary-foreground", label: "Secondary Text" },
    { name: "muted", label: "Muted Background" },
    { name: "muted-foreground", label: "Muted Text" },
    { name: "accent", label: "Accent Highlight" },
    { name: "accent-foreground", label: "Accent Text" },
    { name: "destructive", label: "Destructive Color" },
    { name: "destructive-foreground", label: "Destructive Text" },
    { name: "success", label: "Success Color" },
    { name: "border", label: "Border Color" },
    { name: "input", label: "Input Border" },
    { name: "ring", label: "Focus Ring" },
    { name: "sidebar", label: "Sidebar Background" },
    { name: "sidebar-foreground", label: "Sidebar Text" },
    { name: "sidebar-primary", label: "Sidebar Action" },
    { name: "sidebar-border", label: "Sidebar Border" },
];

const appearanceSchema = z.object({
    BG_COLOR: z.string().min(1, "Background color is required"),
    TEXT_COLOR: z.string().min(1, "Text color is required"),
    PRIMARY_COLOR: z.string().min(1, "Primary color is required"),
    LIGHT_THEME_COLORS: z.record(z.string().min(1, "Required")).optional(),
    DARK_THEME_COLORS: z.record(z.string().min(1, "Required")).optional(),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

// Move components OUTSIDE to prevent remounting on every state change
const ColorPicker = ({ value, onChange, id }: { value: string; onChange: (val: string) => void; id: string }) => {
    const isHex = (color: string) => /^#([A-Fa-f0-9]{3,8})$/.test(color);
    const hexValue = isHex(value) ? value : "#000000";

    return (
        <div className="relative w-10 h-10 shrink-0 group">
            <div
                className="w-full h-full rounded border cursor-pointer hover:ring-2 hover:ring-primary transition-all shadow-sm overflow-hidden relative"
                style={{ backgroundColor: value }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    document.getElementById(id)?.click();
                }}
            >
                {!isHex(value) && value && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-[8px] font-bold text-white uppercase">
                        Code
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                    <Palette className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 shadow-sm" />
                </div>
            </div>
            <input
                id={id}
                type="color"
                value={hexValue}
                onChange={(e) => onChange(e.target.value)}
                className="invisible absolute w-0 h-0"
            />
        </div>
    );
};

const DashboardPreview = ({ colors, isDark }: { colors: AppearanceFormValues, isDark: boolean }) => {
    const theme = isDark ? colors.DARK_THEME_COLORS : colors.LIGHT_THEME_COLORS;
    const sidebarStyle = {
        backgroundColor: theme?.sidebar || colors.BG_COLOR || "transparent",
        color: colors.TEXT_COLOR || "inherit",
    };
    const contentStyle = {
        backgroundColor: theme?.background || (isDark ? "#020617" : "#f8fafc"),
        color: theme?.foreground || (isDark ? "#f8fafc" : "#020617"),
    };
    const cardStyle = {
        backgroundColor: theme?.card || (isDark ? "#0f172a" : "#ffffff"),
        borderColor: theme?.border || (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
        color: theme?.foreground || (isDark ? "#f8fafc" : "#020617"),
    };
    const primaryButtonStyle = {
        backgroundColor: theme?.primary || colors.PRIMARY_COLOR || "#2563eb",
        color: theme?.["primary-foreground"] || "#ffffff",
    };
    const accentStyle = {
        backgroundColor: theme?.accent || (isDark ? "#1e293b" : "#eff6ff"),
        color: theme?.["accent-foreground"] || "inherit",
    };
    const mutedStyle = {
        backgroundColor: theme?.muted || (isDark ? "#1e293b" : "#f1f5f9"),
        color: theme?.["muted-foreground"] || "inherit",
    };

    return (
        <div className={cn("rounded-xl border shadow-2xl overflow-hidden flex h-[400px] text-[10px]", isDark ? "dark" : "")} style={contentStyle}>
            {/* Mini Sidebar */}
            <div className="w-16 shrink-0 flex flex-col items-center py-4 gap-4 border-r" style={sidebarStyle}>
                <div className="w-8 h-8 rounded-full bg-white/20" />
                <div className="space-y-2 w-full px-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-2 w-full rounded bg-white/10" />
                    ))}
                </div>
            </div>

            {/* Mini Content */}
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                <div className="flex justify-between items-center">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" style={mutedStyle} />
                    <div className="flex gap-1">
                        <div className="h-4 w-4 rounded bg-muted" style={mutedStyle} />
                        <div className="h-4 w-4 rounded bg-muted" style={mutedStyle} />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-2 rounded border" style={cardStyle}>
                            <div className="h-2 w-8 rounded bg-muted mb-2" style={mutedStyle} />
                            <div className="h-4 w-12 rounded bg-muted" style={mutedStyle} />
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="p-3 rounded border" style={cardStyle}>
                    <div className="h-3 w-16 rounded mb-3" style={mutedStyle} />
                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square rounded flex items-center justify-center bg-muted/20 border border-dashed" style={{ borderColor: cardStyle.borderColor }} />
                        ))}
                    </div>
                </div>

                {/* Main List */}
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="h-3 w-20 rounded" style={mutedStyle} />
                        <div className="px-2 py-0.5 rounded text-[8px]" style={primaryButtonStyle}>Action</div>
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-2 rounded border flex items-center gap-2" style={cardStyle}>
                            <div className="h-6 w-6 rounded-full" style={accentStyle} />
                            <div className="flex-1 space-y-1">
                                <div className="h-2 w-24 rounded" style={mutedStyle} />
                                <div className="h-1.5 w-16 rounded opacity-70" style={mutedStyle} />
                            </div>
                            <div className="h-2 w-8 rounded" style={mutedStyle} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function AppearanceSettingsPage() {
    const { style, refreshStyle } = useStyle();
    const { theme: systemTheme } = useTheme();

    // Determine effective theme (handling "system" preference)
    const getEffectiveTheme = () => {
        if (systemTheme === "light" || systemTheme === "dark") return systemTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    const [activeEditMode, setActiveEditMode] = useState<"light" | "dark">(getEffectiveTheme());
    const [jsonInput, setJsonInput] = useState("");
    const [isImportOpen, setIsImportOpen] = useState(false);

    // Synchronize tabs when system theme changes
    useEffect(() => {
        setActiveEditMode(getEffectiveTheme());
    }, [systemTheme]);

    const form = useForm<AppearanceFormValues>({
        resolver: zodResolver(appearanceSchema),
        defaultValues: {
            BG_COLOR: "",
            TEXT_COLOR: "",
            PRIMARY_COLOR: "",
            LIGHT_THEME_COLORS: {},
            DARK_THEME_COLORS: {},
        },
    });

    const watchedValues = form.watch();

    // Reset form when style changes (e.g. after refresh)
    useEffect(() => {
        if (style) {
            // Merge actual style with APTOS_DEFAULTS to ensure all keys are present
            const lightColors = { ...APTOS_DEFAULTS.LIGHT_THEME_COLORS, ...(style.LIGHT_THEME_COLORS || {}) };
            const darkColors = { ...APTOS_DEFAULTS.DARK_THEME_COLORS, ...(style.DARK_THEME_COLORS || {}) };

            form.reset({
                BG_COLOR: style.BG_COLOR || APTOS_DEFAULTS.BG_COLOR,
                TEXT_COLOR: style.TEXT_COLOR || APTOS_DEFAULTS.TEXT_COLOR,
                PRIMARY_COLOR: style.PRIMARY_COLOR || APTOS_DEFAULTS.PRIMARY_COLOR,
                LIGHT_THEME_COLORS: lightColors,
                DARK_THEME_COLORS: darkColors,
            });
        }
    }, [style, form]);

    async function onSubmit(data: AppearanceFormValues) {
        try {
            const payload = {
                hostname: window.location.hostname,
                // Sync core branding with Light Theme values for consistency/fallback
                BG_COLOR: data.LIGHT_THEME_COLORS?.sidebar || data.BG_COLOR,
                TEXT_COLOR: data.LIGHT_THEME_COLORS?.foreground || data.TEXT_COLOR,
                PRIMARY_COLOR: data.LIGHT_THEME_COLORS?.primary || data.PRIMARY_COLOR,
                APP_NAME: style.APP_NAME,
                APP_LOGO: style.APP_LOGO,
                LIGHT_THEME_COLORS: data.LIGHT_THEME_COLORS,
                DARK_THEME_COLORS: data.DARK_THEME_COLORS,
            };

            const response = await api.patch("/style", payload);

            if (response.data.type === "success") {
                toast.success("Theme updated successfully");
                await refreshStyle();
            } else {
                toast.error(response.data.message || "Failed to update theme");
            }
        } catch (error) {
            console.error("Error updating theme:", error);
            toast.error("An error occurred while updating theme");
        }
    }

    const handleImportJSON = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            const result = appearanceSchema.safeParse(parsed);

            if (!result.success) {
                toast.error("Invalid JSON format. Please check the structure.");
                return;
            }

            const data = result.data;
            form.setValue("BG_COLOR", data.BG_COLOR);
            form.setValue("TEXT_COLOR", data.TEXT_COLOR);
            form.setValue("PRIMARY_COLOR", data.PRIMARY_COLOR);

            if (data.LIGHT_THEME_COLORS) {
                form.setValue("LIGHT_THEME_COLORS", data.LIGHT_THEME_COLORS);
            }
            if (data.DARK_THEME_COLORS) {
                form.setValue("DARK_THEME_COLORS", data.DARK_THEME_COLORS);
            }

            setIsImportOpen(false);
            setJsonInput("");
            toast.success("JSON configuration imported successfully!");
        } catch (e) {
            toast.error("Invalid JSON. Please ensure it is a valid JSON object.");
        }
    };

    const resetToAptosDefaults = () => {
        form.reset(APTOS_DEFAULTS);
        toast.success("Reset to Conversational AI Original Theme defaults.");
    };

    const applySampleTheme = (colors: any) => {
        // Update shared branding fields
        if (colors.PRIMARY_COLOR) form.setValue("PRIMARY_COLOR", colors.PRIMARY_COLOR);
        if (colors.BG_COLOR) form.setValue("BG_COLOR", colors.BG_COLOR);
        if (colors.TEXT_COLOR) form.setValue("TEXT_COLOR", colors.TEXT_COLOR);

        const themeColors: Record<string, string> = {};
        Object.entries(colors).forEach(([key, value]) => {
            if (key.startsWith("theme_")) {
                themeColors[key.replace("theme_", "")] = value as string;
            }
        });

        // Ensure all keys are present by merging with current values or defaults
        const currentVals = activeEditMode === "light" ? form.getValues().LIGHT_THEME_COLORS : form.getValues().DARK_THEME_COLORS;
        const mergedColors = { ...currentVals, ...themeColors };

        if (activeEditMode === "light") {
            form.setValue("LIGHT_THEME_COLORS", mergedColors);
        } else {
            form.setValue("DARK_THEME_COLORS", mergedColors);
        }
        toast.info(`${activeEditMode.charAt(0).toUpperCase() + activeEditMode.slice(1)} theme preview applied.`);
    };

    const jsonTemplate = JSON.stringify({
        BG_COLOR: "#0f172a",
        TEXT_COLOR: "#f8fafc",
        PRIMARY_COLOR: "#2563eb",
        LIGHT_THEME_COLORS: {
            background: "#f8fafc",
            foreground: "#020617",
            card: "#ffffff",
            primary: "#2563eb",
            accent: "#eff6ff",
            sidebar: "#1e293b",
            success: "#16a34a",
            destructive: "#dc2626"
        },
        DARK_THEME_COLORS: {
            background: "#020617",
            foreground: "#f8fafc",
            card: "#0f172a",
            primary: "#6366f1",
            accent: "#1e293b",
            sidebar: "#0f172a",
            success: "#22c55e",
            destructive: "#ef4444"
        }
    }, null, 2);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium">Appearance</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize how the application looks for your society.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => {
                            const data = form.getValues();
                            const payload = {
                                hostname: window.location.hostname,
                                BG_COLOR: data.LIGHT_THEME_COLORS?.sidebar || data.BG_COLOR,
                                TEXT_COLOR: data.LIGHT_THEME_COLORS?.foreground || data.TEXT_COLOR,
                                PRIMARY_COLOR: data.LIGHT_THEME_COLORS?.primary || data.PRIMARY_COLOR,
                                APP_NAME: style.APP_NAME,
                                APP_LOGO: style.APP_LOGO,
                                LIGHT_THEME_COLORS: data.LIGHT_THEME_COLORS,
                                DARK_THEME_COLORS: data.DARK_THEME_COLORS,
                            };
                            navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                            toast.success("Current configuration copied to clipboard!");
                        }}
                    >
                        <Copy className="w-4 h-4" />
                        Copy JSON
                    </Button>
                    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Paste JSON
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Import Theme JSON</DialogTitle>
                                <DialogDescription>
                                    Paste a theme configuration JSON object below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expected Format:</label>
                                    <div className="relative group">
                                        <pre className="p-3 bg-muted rounded-md text-[10px] overflow-x-auto font-mono">
                                            {jsonTemplate}
                                        </pre>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                                navigator.clipboard.writeText(jsonTemplate);
                                                toast.success("Template copied to clipboard");
                                            }}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Paste JSON Here:</label>
                                    <Textarea
                                        className="font-mono text-xs h-40"
                                        placeholder='{ "BG_COLOR": ... }'
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
                                <Button onClick={handleImportJSON}>Apply Configuration</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Pro Themes (Quick Switch)
                    </h4>
                    <div className="flex bg-muted rounded-lg p-1">
                        <Button
                            variant={activeEditMode === "light" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => setActiveEditMode("light")}
                        >
                            <Sun className="w-3 h-3 mr-1" /> Light
                        </Button>
                        <Button
                            variant={activeEditMode === "dark" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={() => setActiveEditMode("dark")}
                        >
                            <Moon className="w-3 h-3 mr-1" /> Dark
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeEditMode === "light" ? SAMPLE_THEMES : DARK_SAMPLE_THEMES).map((t) => {
                        const isCurrent = activeEditMode === "light" ?
                            (watchedValues.PRIMARY_COLOR === t.colors.PRIMARY_COLOR && watchedValues.BG_COLOR === t.colors.BG_COLOR) :
                            false;

                        return (
                            <Card
                                key={t.themeName}
                                className={cn(
                                    "cursor-pointer hover:border-primary transition-all group relative overflow-hidden",
                                    isCurrent && "ring-2 ring-primary border-primary"
                                )}
                                onClick={() => applySampleTheme(t.colors)}
                            >
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-sm font-bold">{t.themeName}</CardTitle>
                                        {isCurrent && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                    <CardDescription className="text-xs line-clamp-1">{t.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex gap-1 mt-2">
                                        <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: t.colors.PRIMARY_COLOR }} title="Primary" />
                                        <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: t.colors.BG_COLOR }} title="Sidebar" />
                                        <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: (t.colors as any).theme_background }} title="Background" />
                                        <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: (t.colors as any).theme_accent }} title="Accent" />
                                    </div>
                                </CardContent>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                            </Card>
                        );
                    })}
                </div>
            </div>

            <div className="border-t pt-8 space-y-4">
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Live Dashboard Preview
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        This is how your society dashboard will look with the current colors.
                        Toggle tabs above to see Light vs Dark preview.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto w-full">
                    <DashboardPreview colors={watchedValues as any} isDark={activeEditMode === "dark"} />
                </div>
            </div>

            <div className="border-t pt-8">
                <h4 className="text-sm font-medium mb-4">Manual Customization</h4>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Branding Settings removed as redundant with per-theme variables */}

                        <Tabs value={activeEditMode} onValueChange={(val) => setActiveEditMode(val as "light" | "dark")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                                <TabsTrigger value="light" className="flex items-center gap-2">
                                    <Sun className="w-4 h-4" /> Light Mode
                                </TabsTrigger>
                                <TabsTrigger value="dark" className="flex items-center gap-2">
                                    <Moon className="w-4 h-4" /> Dark Mode
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="light">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Light Theme Variables</CardTitle>
                                        <CardDescription>Colors applied when the system is in light mode.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {THEME_VARIABLES.map((item) => (
                                            <FormField
                                                key={`light-${item.name}`}
                                                control={form.control}
                                                name={`LIGHT_THEME_COLORS.${item.name}` as any}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{item.label}</FormLabel>
                                                        <div className="flex gap-2">
                                                            <FormControl>
                                                                <Input placeholder="#ffffff" {...field} />
                                                            </FormControl>
                                                            <ColorPicker
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                id={`picker-light-${item.name}`}
                                                            />
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="dark">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dark Theme Variables</CardTitle>
                                        <CardDescription>Colors applied when the system is in dark mode.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {THEME_VARIABLES.map((item) => (
                                            <FormField
                                                key={`dark-${item.name}`}
                                                control={form.control}
                                                name={`DARK_THEME_COLORS.${item.name}` as any}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{item.label}</FormLabel>
                                                        <div className="flex gap-2">
                                                            <FormControl>
                                                                <Input placeholder="#000000" {...field} />
                                                            </FormControl>
                                                            <ColorPicker
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                id={`picker-dark-${item.name}`}
                                                            />
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={resetToAptosDefaults}
                                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Undo2 className="w-4 h-4" />
                                Reset to Conversational AI Theme
                            </Button>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => refreshStyle()}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Discard Changes
                                </Button>
                                <Button type="submit">Save Permanently</Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
