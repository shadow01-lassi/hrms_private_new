import api from "@/lib/api";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DocTypeMasterType } from "@/lib/types";

const FormSchema = z.object({
    dt_name: z.string().min(3, { message: "Name must be at least 3 characters." }).max(50, { message: "Name must be at most 50 characters." }),
    dt_charge: z.coerce.number().min(0, { message: "Charge must be a positive number." }),
    dt_proof_req: z.boolean(),
    dt_proof1_type: z.string().max(50, { message: "Proof type must be at most 50 characters." }).nullable().optional().or(z.literal("")),
    dt_proof2_type: z.string().max(50, { message: "Proof type must be at most 50 characters." }).nullable().optional().or(z.literal("")),
    dt_proof3_type: z.string().max(50, { message: "Proof type must be at most 50 characters." }).nullable().optional().or(z.literal("")),
    dt_rules: z.string().nullable().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
    if (data.dt_proof_req) {
        const p1 = data.dt_proof1_type?.trim();
        const p2 = data.dt_proof2_type?.trim();
        const p3 = data.dt_proof3_type?.trim();
        if (!p1 && !p2 && !p3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "At least one proof document type is required when 'Proof Required' is checked.",
                path: ["dt_proof1_type"],
            });
        }
    }
});

type FormValues = z.infer<typeof FormSchema>;

export function DocTypeForm({
    action,
    prepopulatedData
}: {
    action: "add" | "edit";
    prepopulatedData: DocTypeMasterType | null;
}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            dt_name: prepopulatedData?.dt_name || "",
            dt_charge: prepopulatedData?.dt_charge || 0,
            dt_proof_req: prepopulatedData?.dt_proof_req || false,
            dt_proof1_type: prepopulatedData?.dt_proof1_type || "",
            dt_proof2_type: prepopulatedData?.dt_proof2_type || "",
            dt_proof3_type: prepopulatedData?.dt_proof3_type || "",
            dt_rules: prepopulatedData?.dt_rules || "",
        },
    });

    const proofReq = form.watch("dt_proof_req");

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        setLoading(true);
        const payload = {
            ...values,
            dt_charge: Number(values.dt_charge),
            // Ensure null for empty strings if proof not required
            dt_proof1_type: values.dt_proof_req ? values.dt_proof1_type : null,
            dt_proof2_type: values.dt_proof_req ? values.dt_proof2_type : null,
            dt_proof3_type: values.dt_proof_req ? values.dt_proof3_type : null,
        };

        try {
            let response;
            if (action === "add") {
                response = await api.post("/master/doc-types", payload);
            } else {
                response = await api.put("/master/doc-types", { ...payload, dt_id: prepopulatedData?.dt_id });
            }

            const { type, message } = response.data;
            if (type === "success") {
                toast.success(message);
                navigate(-1);
            } else {
                toast.error(message);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                <FormField
                    control={form.control}
                    name="dt_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Document Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. NOC for Bank Loan"
                                    {...field}
                                    maxLength={50}
                                    autoFocus={true}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dt_charge"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Charge (₹)</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input type="number" {...field} className="pr-20" />
                                </FormControl>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    {Number(field.value) === 0 ? (
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">No Charge</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Paid</Badge>
                                    )}
                                </div>
                            </div>
                            <FormDescription>Administrative charge for this document.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dt_proof_req"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Proof Required?</FormLabel>
                                <FormDescription>
                                    Check this if the member needs to provide proofs for this document.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                {proofReq && (
                    <div className="space-y-4">
                        {form.formState.errors.dt_proof1_type && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Validation Error</AlertTitle>
                                <AlertDescription>
                                    {form.formState.errors.dt_proof1_type.message}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/50">
                            <FormField
                                control={form.control}
                                name="dt_proof1_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proof 1</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Aadhaar" {...field} value={field.value || ""} maxLength={50} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dt_proof2_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proof 2 (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Pan Card" {...field} value={field.value || ""} maxLength={50} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dt_proof3_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proof 3 (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Electricity Bill" {...field} value={field.value || ""} maxLength={50} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="dt_rules"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Terms & Rules</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter any rules or prerequisites for this document..."
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : action === "add" ? "Create Document Type" : "Update Document Type"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}