// importing client
import api from "@/lib/api";

// importing from react
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

// importing shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Validation Schema using Zod
const formSchema = z.object({
    flat_no: z.string().nonempty("Please select a flat"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    purpose: z.string().nonempty("Select a purpose"),
    purposeRemarks: z.string().optional(),
    full_amt: z.string().min(1, "Amount is required"),
});

type BookingFormValues = z.infer<typeof formSchema>;

export function BookingEntryForm({
    hall,
    slot,
    date,
    amount
}: {
    hall: number;
    slot: string;
    date: Date | undefined;
    amount: string;
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [purposeOptions, setPurposeOptions] = useState<{ label: string; value: string }[]>([]);
    const [flat, setFlat] = useState<string>("");

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            flat_no: "",
            name: "",
            mobile: "",
            purpose: "",
            purposeRemarks: "0",
            full_amt: amount || "",
        },
    });

    // Update form value when flat state changes
    useEffect(() => {
        form.setValue("flat_no", flat);
    }, [flat, form]);

    // Update amount if prop changes
    useEffect(() => {
        if (amount) {
            form.setValue("full_amt", amount);
        }
    }, [amount, form]);

    // Fetch purpose options
    useEffect(() => {
        const fetchPurposes = async () => {
            try {
                const response = await api.get(`/master/booking-purpose`);

                if (response.data.type === "success") {
                    const options = response.data.data.map((item: any) => ({
                        label: item.bpm_purpose,
                        value: String(item.bpm_id)
                    }));
                    setPurposeOptions(options);
                }
            } catch (error) {
                console.error("Failed to fetch purposes", error);
                // Fallback options if API fails
                setPurposeOptions([
                    { label: "Wedding", value: "1" },
                    { label: "Birthday Party", value: "2" },
                    { label: "Corporate Event", value: "3" },
                    { label: "Other", value: "4" },
                ]);
            }
        };
        fetchPurposes();
    }, []);

    const onSubmit = async (values: BookingFormValues) => {
        if (!date) {
            toast.error("Please select a date first.");
            return;
        }

        console.log("New Booking Data:", values);
        setLoading(true);
        try {
            const payload = {
                hall: hall,
                slot: slot,
                flat_no: values.flat_no,
                name: values.name,
                mobile: values.mobile,
                purpose: values.purpose, // This should be ID
                full_amt: values.full_amt,
                program_date: date, // DAO expects 'program_date'
            };

            const results = await api.post(`/booking`, {
                data: payload,
            });
            setLoading(false);
            if (results.data.type === "success") {
                toast.success("Hall Booking Successful!");
                // form.reset();
            } else {
                toast.error(results.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Personal Details Section */}
                        <div className="space-y-4 md:col-span-3">
                            <h3 className="text-lg font-medium text-foreground border-b pb-2">Personal Details</h3>
                        </div>

                        {/* Flat Selection */}
                        <div className="flex flex-col gap-2">
                            <Input
                                value={flat}
                                onChange={(e) => { setFlat(e.target.value) }}
                            />

                            {form.formState.errors.flat_no && (
                                <p className="text-sm font-medium text-destructive">{form.formState.errors.flat_no.message}</p>
                            )}
                        </div>

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter name" {...field} className="h-10" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Mobile */}
                        <FormField
                            control={form.control}
                            name="mobile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mobile</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter mobile number" {...field} className="h-10" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Booking Details Section */}
                        <div className="space-y-4 md:col-span-2 pt-4">
                            <h3 className="text-lg font-medium text-foreground border-b pb-2">Booking Essentials</h3>
                        </div>

                        {/* Purpose of Booking */}
                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purpose of Booking</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select purpose" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {purposeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Full Amount */}
                        <FormField
                            control={form.control}
                            name="full_amt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Amount (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter full amount" {...field} className="h-10 font-medium" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Separator />

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" className="w-full md:w-auto min-w-[200px]" disabled={loading}>
                            {loading ? "Submitting..." : "Confirm Booking"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
