// importing from react
import { useState } from "react";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// importing icons
import { Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export function ShareIconSlab({
    data
}: {
    data: Record<string, string | number | boolean | Date>;
}) {
    const [loading, setLoading] = useState(false);

    async function shareOnWhatsApp() {
        // share on whatsapp
        try {
            setLoading(true);
            const results = await api.post(`/send/whatsapp`, {
                // data
            }, {
                params: { flat: data.flat_no },
            });
            if (results.data.type === "success") {
                toast.success(results.data.message);
            } else {
                toast.error(results.data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function shareOnEmail() {
        // share on email
        try {
            setLoading(true);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="flex gap-2 items-center">
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            size={"sm"}
                            variant={"outline"}
                            className={"min-w-8 h-8"}
                            onClick={shareOnWhatsApp}
                            disabled={loading}
                        >
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/5968/5968841.png"
                                alt="whatsapp-icon"
                                className="w-4 h-4"
                            />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Send bill on WhatsApp</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            size={"sm"}
                            variant={"outline"}
                            className={"min-w-8 h-8"}
                            onClick={shareOnEmail}
                            disabled={loading}
                        >
                            <Mail className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Send bill on Mail</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </>
    );
}