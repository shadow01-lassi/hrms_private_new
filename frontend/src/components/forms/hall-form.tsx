// importing from react
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// importing components
import { ImageUpload } from "@/components/common/image-upload";

// importing types
import { HallMasterType } from "@/lib/types";

// Define form schema
const formSchema = z.object({
    name: z.string().min(1, "Hall name is required").max(100),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    image: z.string().optional(),
});

export type HallFormValues = z.infer<typeof formSchema>;

interface HallFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: HallFormValues) => Promise<void>;
    initialData: HallMasterType | null;
}

export function HallForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
}: HallFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<HallFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            capacity: 1,
            image: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.hm_name,
                capacity: initialData.hm_capacity,
                image: initialData.hm_image || "",
            });
        } else {
            form.reset({
                name: "",
                capacity: 1,
                image: "",
            });
        }
    }, [initialData, form]);

    const handleSubmit = async (values: HallFormValues) => {
        try {
            setIsLoading(true);
            await onSubmit(values);
            // toast.success("Success! Hall details saved."); // Handled in parent
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error("Form submit error", error);
            // toast.error("Something went wrong."); // Handled in parent
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Hall" : "Create New Hall"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hall Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter hall name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="capacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Seating Capacity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="Enter seating capacity"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hall Image</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value}
                                            onChange={(url) => field.onChange(url)}
                                            onRemove={() => field.onChange("")}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}