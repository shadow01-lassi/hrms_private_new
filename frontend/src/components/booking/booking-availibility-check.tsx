// importing client
import api from "@/lib/api";

// importing from react
import { z } from "zod";
import { Dispatch, SetStateAction, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Form,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

// importing utilities
import { formatDate } from "@/lib/utils";

// importing constants, types and others
import { BookingEnquiryResponseType } from "@/lib/types";
import { Input } from "../ui/input";

const FormSchema = z.object({
    date: z.date({
        required_error: "A date of booking is required.",
    }),
});

export default function BookingAvailibilityCheck({
    enquiryResponse,
    setEnquiryResponse,
    setBookingForm,
    setBookingDate
}: {
    enquiryResponse: BookingEnquiryResponseType[];
    setEnquiryResponse: Dispatch<SetStateAction<BookingEnquiryResponseType[]>>;
    bookingForm: { hall: string; slot: string; hallId: number };
    setBookingForm: Dispatch<SetStateAction<{ hall: string; slot: string; hallId: number }>>;
    setBookingDate: Dispatch<SetStateAction<Date | undefined>>;
}) {
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    async function onSubmit(values: z.infer<typeof FormSchema>) {
        setLoading(true);
        setEnquiryResponse([]);
        setBookingForm({
            hall: "",
            slot: "",
            hallId: 0
        });
        setBookingDate(undefined);

        const results = await api.post(`/booking/enquiry`, {
            date: formatDate(values.date)
        });

        const data = results.data;
        setLoading(false);
        if (data.type === "success") {
            setEnquiryResponse(data.data);
            setBookingDate(values.date);
        }
    }

    const groupedData = enquiryResponse.reduce((acc, booking) => {
        if (!acc[booking.hm_name]) acc[booking.hm_name] = [];
        acc[booking.hm_name].push({ b_slot: booking.b_slot, availability: booking.availability, hm_id: booking.hm_id });
        return acc;
    }, {} as Record<string, { b_slot: string; availability: string; hm_id: number }[]>);

    return (
        <>
            <div className="flex flex-col items-baseline gap-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of booking</FormLabel>
                                    <Input
                                        type="date"
                                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value);
                                            field.onChange(date);
                                        }}
                                        className="w-full"
                                        min={new Date().toISOString().split("T")[0]} // Disable past dates
                                    />
                                    <FormDescription>
                                        Pick a date when you want to book the hall to check availibility.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            variant={"secondary"}
                            size={"sm"}
                            className="bg-foreground hover:bg-foreground text-background"
                        >
                            {loading ? "Loading..." : "Check Availibility"}
                        </Button>
                    </form>
                </Form>

                {enquiryResponse && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-8">
                        {Object.entries(groupedData).map(([hallName, slots]) => (
                            <div key={hallName} className="h-fit">
                                <h2 className="text-xl font-semibold mb-2">{hallName}</h2>
                                <div className="bg-accent p-3 rounded-xl">
                                    {slots.map((slot, index) => (
                                        <p key={index} className="flex flex-wrap lg:flex-nowrap gap-2 items-center m-2">
                                            <span className="font-medium text-xs">
                                                {slot.b_slot === '1' ? "[09:00 AM to 04:00 PM]" : "[05:00 PM to 11:00 PM]"}:
                                            </span>
                                            &emsp;

                                            {slot.availability === "Available" ? (
                                                <div
                                                    className={`text-success underline cursor-pointer`}
                                                    onClick={() => {
                                                        setBookingForm({ hall: hallName, slot: slot.b_slot, hallId: slot.hm_id });
                                                    }}
                                                >
                                                    Book Now
                                                </div>
                                            ) : (
                                                <span className={`text-destructive cursor-not-allowed`}>
                                                    {slot.availability}
                                                </span>
                                            )}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}