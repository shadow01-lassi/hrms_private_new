// importing client
import api from "@/lib/api";

// importing from react
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

// importing shadcn components
import { Input } from "@/components/ui/input";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

// importing components
import { IfscFinderModal } from "./ifsc-modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// importing icons
import { CheckCircle, Search, Loader2, QrCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";
import { Button } from "../ui/button";

interface BankDetailsProps {
    form: UseFormReturn<any>;
    apiString: string;
}

export function BankDetails({ form, apiString = "/master" }: BankDetailsProps) {
    const [isIfscModalOpen, setIsIfscModalOpen] = useState(false);
    const [fetchingIfsc, setFetchingIfsc] = useState(false);
    const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
    const [upiCheckId, setUpiCheckId] = useState("");
    const [qrLoading, setQrLoading] = useState(true);

    const ifscValue = form.watch("ifsc");
    const bankNameValue = form.watch("bank_name");

    // Auto-fetch IFSC details
    useEffect(() => {
        if (ifscValue?.length === 11) {
            const timer = setTimeout(async () => {
                setFetchingIfsc(true);
                try {
                    const response = await api.get(apiString + `/banks/ifsc/${ifscValue}`);
                    form.setValue("bank_name", response.data.data.bankName, { shouldValidate: true });
                    form.setValue("branch", response.data.data.branch, { shouldValidate: true });
                    form.clearErrors("ifsc");
                } catch (err) {
                    form.setError("ifsc", { type: "manual", message: "IFSC code not found. Please check and try again." });
                } finally {
                    setFetchingIfsc(false);
                }
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [ifscValue, form]);

    const handleIfscSelect = (ifsc: string, bank: string, branch: string) => {
        form.setValue("ifsc", ifsc, { shouldValidate: true });
        form.setValue("bank_name", bank, { shouldValidate: true });
        form.setValue("branch", branch, { shouldValidate: true });
        setIsIfscModalOpen(false);
    };

    return (
        <Card className="overflow-hidden py-0 gap-0 w-full">
            <CardHeader className="bg-muted/30 border-b py-6">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-primary" /> Bank Details
                </CardTitle>
                <CardDescription>
                    Official bank account information for collecting society maintenance.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="account_holder_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Holder Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Name as per Bank Records"
                                        className="bg-background"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="account_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Entered Account Number"
                                        className="bg-background"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e.target.value.replace(/\D/g, ""));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 p-4 border rounded-xl bg-muted/50">
                    <FormField
                        control={form.control}
                        name="ifsc"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center pb-1">
                                    <FormLabel>IFSC Code</FormLabel>
                                    <button
                                        type="button"
                                        onClick={() => setIsIfscModalOpen(true)}
                                        className="text-[10px] font-bold text-primary flex items-center gap-1 transition-all bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-md uppercase tracking-wider"
                                    >
                                        <Search className="w-3 h-3" /> Find IFSC
                                    </button>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="HDFC0123456"
                                            maxLength={11}
                                            className="uppercase pr-10 bg-background"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e.target.value.toUpperCase().slice(0, 11));
                                            }}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {fetchingIfsc && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                                            {field.value?.length === 11 && !fetchingIfsc && bankNameValue && !form.formState.errors.ifsc && (
                                                <CheckCircle className="w-4 h-4 text-success" />
                                            )}
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <FormField
                            control={form.control}
                            name="bank_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bank Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Bank Name"
                                            className="bg-background"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="branch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Branch (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Branch Name"
                                            className="bg-background"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <FormField
                            control={form.control}
                            name="account_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Type</FormLabel>
                                    <FormControl>
                                        <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                                            <TabsList className="grid min-w-sm w-fit grid-cols-2">
                                                <TabsTrigger value="Savings">Savings Account</TabsTrigger>
                                                <TabsTrigger value="Current">Current Account</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="upi_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UPI ID (Optional)</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. society@bank"
                                                className="bg-background flex-1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={async () => {
                                                if (field.value) {
                                                    const isValid = await form.trigger("upi_id");
                                                    if (isValid) {
                                                        setUpiCheckId(field.value);
                                                        setQrLoading(true);
                                                        setIsUpiModalOpen(true);
                                                    }
                                                }
                                            }}
                                            disabled={!field.value}
                                            className="shrink-0"
                                        >
                                            <QrCode className="w-4 h-4 mr-2" /> Check
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </CardContent>

            <Dialog open={isUpiModalOpen} onOpenChange={setIsUpiModalOpen}>
                <DialogContent className="sm:max-w-md text-center flex flex-col items-center">
                    <DialogHeader>
                        <DialogTitle>Test UPI ID</DialogTitle>
                        <DialogDescription>
                            Scan this QR code from any UPI app to verify it resolves to your society.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-white p-4 rounded-xl border shadow-sm my-4 relative w-56 h-56 flex items-center justify-center">
                        {qrLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 rounded-xl">
                                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                <span className="text-xs text-muted-foreground font-medium">Generating QR...</span>
                            </div>
                        )}
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${upiCheckId}&pn=${encodeURIComponent(form.getValues("cm_name") || form.getValues("account_holder_name") || "Society")}&am=1&cu=INR`)}`}
                            alt="UPI QR Code"
                            className={`w-48 h-48 transition-opacity duration-300 ${qrLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => setQrLoading(false)}
                            onError={() => setQrLoading(false)}
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        This QR code is a test QR code for <strong>₹1</strong>. This will be printed on all maintenance and utility bills issued by your society!
                    </p>
                </DialogContent>
            </Dialog>

            <IfscFinderModal
                isOpen={isIfscModalOpen}
                onClose={() => setIsIfscModalOpen(false)}
                onSelect={handleIfscSelect}
                apiString={`/onboard`}
            />
        </Card>
    );
}
