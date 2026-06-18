// importing shadcn components
import {
    Card,
    CardDescription,
    CardHeader,
} from "@/components/ui/card";

// importing icons
import { UserCheck, TriangleAlert } from "lucide-react";

export function FormMessage({ message }: { message: { type: string, message: string } }) {
    return (
        <>
            {message.type && (
                <Card className={`
                    flex py-0
                    ${message.type === "success" && "border-success text-success bg-success/20"}
                    ${message.type === "error" && "border-destructive text-destructive bg-destructive/20"}
                `}>
                    <CardHeader className="py-2 gap-0">
                        <CardDescription className={`
                                    ${message.type === "success" && "text-success"}
                                    ${message.type === "error" && "text-destructive"}
                                    flex items-center gap-2
                                `}>
                            {message.type === "success" && (<UserCheck className="w-4 h-4" />)}
                            {message.type === "error" && (<TriangleAlert className="w-4 h-4" />)}
                            {message.message}
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </>
    );
}