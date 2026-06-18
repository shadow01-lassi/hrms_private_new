import api from "@/lib/api";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { CompanyMasterType } from "@/lib/types";

const FormSchema = z.object({
    cm_name: z.string().min(3, { message: "Name must be at least 3 characters." }).max(255, { message: "Name must be at most 255 characters." }),
    cm_code: z.string().optional().or(z.literal("")),
    cm_registration_no: z.string().optional().or(z.literal("")),
    cm_status: z.boolean(),
});

type FormValues = z.infer<typeof FormSchema>;

export function CompanyMasterForm({
    action,
    prepopulatedData
}: {
    action: "add" | "edit";
    prepopulatedData: CompanyMasterType | null;
}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            cm_name: prepopulatedData?.cm_name || "",
            cm_code: prepopulatedData?.cm_code || "",
            cm_registration_no: prepopulatedData?.cm_registration_no || "",
            cm_status: prepopulatedData?.cm_status !== undefined ? prepopulatedData.cm_status : true,
        },
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        const payload = {
            cm_name: values.cm_name,
            cm_code: values.cm_code || null,
            cm_registration_no: values.cm_registration_no || null,
            cm_status: values.cm_status,
        };

        try {
            let response;
            if (action === "add") {
                response = await api.post("/master/company-master", payload);
            } else {
                response = await api.put(`/master/company-master/${prepopulatedData?.cm_id}`, payload);
            }

            const { type, message } = response.data;
            if (type === "success") {
                toast.success(message);
                navigate(-1);
            } else {
                toast.error(message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card border rounded-xl p-6 shadow-sm">
                <FormField
                    control={form.control}
                    name="cm_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Valueye Technologies"
                                    {...field}
                                    maxLength={255}
                                    autoFocus={true}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cm_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Code</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. FLEETLY"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cm_registration_no"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Registration Number</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. U72200MH2021PTC123456"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cm_status"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Is Active?</FormLabel>
                                <FormDescription>
                                    Uncheck to set status as inactive.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="cursor-pointer">
                        {loading ? "Saving..." : action === "add" ? "Create Company" : "Update Company"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} className="cursor-pointer">
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
