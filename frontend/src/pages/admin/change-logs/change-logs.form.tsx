import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { ChangeLogType } from "@/lib/types";

import { usePermission } from "@/hooks/use-permissions";
import { AccessDenied } from "@/components/prompts/access-denied";

const itemSchema = z.object({
    value: z.string().min(1, "Item cannot be empty"),
});

const changeLogSchema = z.object({
    c_version: z.string().min(1, "Version is required"),
    c_date: z.string().min(1, "Date is required"),
    c_title: z.string().min(1, "Title is required"),
    c_description: z.string().min(1, "Description is required"),
    // Remove .default([]) to strictly type these as arrays
    c_improvements: z.array(itemSchema),
    c_fixes: z.array(itemSchema),
    c_patches: z.array(itemSchema),
});

type ChangeLogFormValues = z.infer<typeof changeLogSchema>;

interface ChangeLogsFormProps {
    initialData?: ChangeLogType;
    mode: "add" | "edit";
}

export function ChangeLogsForm({ initialData, mode }: ChangeLogsFormProps) {
    const viewPermission = usePermission("changelog.read");
    const createPermission = usePermission("changelog.create");
    const updatePermission = usePermission("changelog.update");

    const navigate = useNavigate();

    const form = useForm<ChangeLogFormValues>({
        resolver: zodResolver(changeLogSchema),
        defaultValues: {
            c_version: initialData?.c_version || "",
            c_date: initialData?.c_date ? new Date(initialData.c_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            c_title: initialData?.c_title || "",
            c_description: initialData?.c_description || "",
            c_improvements: (initialData?.c_improvements || []).map(v => ({ value: v })),
            c_fixes: (initialData?.c_fixes || []).map(v => ({ value: v })),
            c_patches: (initialData?.c_patches || []).map(v => ({ value: v })),
        },
    });

    const {
        fields: improvements,
        append: appendImprovement,
        remove: removeImprovement
    } = useFieldArray({
        control: form.control,
        name: "c_improvements",
    });

    const {
        fields: fixes,
        append: appendFix,
        remove: removeFix
    } = useFieldArray({
        control: form.control,
        name: "c_fixes",
    });

    const {
        fields: patches,
        append: appendPatch,
        remove: removePatch
    } = useFieldArray({
        control: form.control,
        name: "c_patches",
    });

    const onSubmit = async (values: ChangeLogFormValues) => {
        if (mode === "add" && !createPermission) {
            toast.error("You do not have permission to create a change log");
            return;
        }
        if (mode === "edit" && !updatePermission) {
            toast.error("You do not have permission to update a change log");
            return;
        }

        const payload = {
            ...values,
            c_improvements: values.c_improvements.map(i => i.value),
            c_fixes: values.c_fixes.map(i => i.value),
            c_patches: values.c_patches.map(i => i.value),
        };

        try {
            if (mode === "add") {
                await api.post("/open/change-log", payload);
                toast.success("Change log created successfully");
            } else {
                await api.put(`/open/change-log/${initialData?.c_id}`, payload);
                toast.success("Change log updated successfully");
            }
            navigate("/dashboard/admin-tools/change-logs");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <>
            {viewPermission ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate("/dashboard/admin-tools/change-logs")}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to List
                            </Button>
                            <Button type="submit" className="gap-2">
                                <Save className="w-4 h-4" />
                                {mode === "add" ? "Create Change Log" : "Update Change Log"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Global Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="c_version"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Version</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="v1.0.0" {...field} autoFocus={true} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="c_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Release Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="c_title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="E.g. Major UI Overhaul" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="c_description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief overview of the changes..."
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                {/* Improvements Section */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between py-4">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                            Improvements
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendImprovement({ value: "" })}
                                            className="h-8 gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {improvements.map((field, index) => (
                                            <div key={field.id} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`c_improvements.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input placeholder="Improvement details..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeImprovement(index)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {improvements.length === 0 && (
                                            <p className="text-xs text-muted-foreground italic text-center py-2">
                                                No improvements added yet.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Fixes Section */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between py-4">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                            Fixes
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendFix({ value: "" })}
                                            className="h-8 gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {fixes.map((field, index) => (
                                            <div key={field.id} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`c_fixes.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input placeholder="Fix details..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFix(index)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {fixes.length === 0 && (
                                            <p className="text-xs text-muted-foreground italic text-center py-2">
                                                No fixes added yet.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Patches Section */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between py-4">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                            Patches
                                        </CardTitle>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendPatch({ value: "" })}
                                            className="h-8 gap-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {patches.map((field, index) => (
                                            <div key={field.id} className="flex gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`c_patches.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input placeholder="Patch details..." {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removePatch(index)}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {patches.length === 0 && (
                                            <p className="text-xs text-muted-foreground italic text-center py-2">
                                                No patches added yet.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </Form>
            ) : (
                <AccessDenied />
            )}
        </>
    );
}
