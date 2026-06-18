import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Check, XCircle, Building2, Loader2 } from "lucide-react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface SocietyDetailsProps {
    form: UseFormReturn<any>;
    validationStatus: Record<string, "loading" | "available" | "taken" | "none">;
}

export function SocietyDetails({ form, validationStatus }: SocietyDetailsProps) {

    const ValidationIcon = ({ status }: { status?: "loading" | "available" | "taken" | "none" }) => {
        if (status === "loading") return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        if (status === "available") return <Check className="w-4 h-4 text-green-500" />;
        if (status === "taken") return <XCircle className="w-4 h-4 text-destructive" />;
        return null;
    };

    return (
        <Card className="overflow-hidden py-0 gap-0">
            <CardHeader className="bg-muted/30 border-b py-6">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" /> Society Verification
                </CardTitle>
                <CardDescription>
                    Official tax and government registration information.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        name="cm_name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Official Society Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Green Valley Co-op Housing Society" className="h-11 shadow-xs bg-background" {...field} />
                                </FormControl>
                                <FormDescription>Must match government registration records</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="cm_registration_no"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center justify-between">
                                    Registration Number
                                    <ValidationIcon status={validationStatus["cm_registration_no"]} />
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. BOM/HSG/1234"
                                        className={cn(
                                            "h-11 shadow-xs transition-all bg-background",
                                            validationStatus["cm_registration_no"] === "available" && "border-green-500 focus-visible:ring-green-500",
                                            validationStatus["cm_registration_no"] === "taken" && "border-destructive focus-visible:ring-destructive"
                                        )}
                                        {...field}
                                    />
                                </FormControl>
                                {validationStatus["cm_registration_no"] === "taken" && (
                                    <p className="text-[0.8rem] font-medium text-destructive">This registration number is already in use.</p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="cm_pan_no"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center justify-between">
                                    PAN Number (Optional)
                                    <ValidationIcon status={validationStatus["cm_pan_no"]} />
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. ABCDE1234F"
                                        className={cn(
                                            "h-11 uppercase shadow-xs transition-all bg-background",
                                            validationStatus["cm_pan_no"] === "available" && "border-green-500 focus-visible:ring-green-500",
                                            validationStatus["cm_pan_no"] === "taken" && "border-destructive focus-visible:ring-destructive"
                                        )}
                                        {...field}
                                    />
                                </FormControl>
                                {validationStatus["cm_pan_no"] === "taken" && (
                                    <p className="text-[0.8rem] font-medium text-destructive">This PAN number is already associated with another society.</p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="cm_gstin_no"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel className="flex items-center justify-between">
                                    GSTIN Number (Optional)
                                    <ValidationIcon status={validationStatus["cm_gstin_no"]} />
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="15 Digit GSTIN"
                                        className={cn(
                                            "h-11 uppercase shadow-xs transition-all bg-background",
                                            validationStatus["cm_gstin_no"] === "available" && "border-green-500 focus-visible:ring-green-500",
                                            validationStatus["cm_gstin_no"] === "taken" && "border-destructive focus-visible:ring-destructive"
                                        )}
                                        {...field}
                                    />
                                </FormControl>
                                {validationStatus["cm_gstin_no"] === "taken" && (
                                    <p className="text-[0.8rem] font-medium text-destructive">This GSTIN is already associated with another society.</p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
