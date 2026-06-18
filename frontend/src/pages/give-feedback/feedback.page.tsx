import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareWarning, ThumbsUp, ThumbsDown, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface FeedbackPageProps {
    onClose?: () => void;
}

export default function FeedbackPage({ onClose }: FeedbackPageProps) {
    const [rating, setRating] = useState<"positive" | "negative" | null>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) return;

        setIsSubmitting(true);
        try {
            await api.post("/feedback", {
                f_type: rating === "positive" ? "P" : "N",
                f_comment: comment
            });
            setStatus("success");
            // Auto-close after a delay if desired, or let user click button
            setTimeout(() => {
                onClose?.();
            }, 3000);
        } catch (error) {
            console.error("Feedback submission failed:", error);
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "success") {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        Your feedback has been submitted successfully. We appreciate your input!
                    </p>
                </div>
                <Button onClick={onClose} className="min-w-[120px]">
                    Close
                </Button>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Oops!</h2>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        Something went wrong while sending your feedback. Please try again.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStatus("idle")}>
                        Try Again
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 py-4 h-full flex flex-col">
            <div className="text-center space-y-2">
                <MessageSquareWarning className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-lg font-semibold">Your feedback matters!</h3>
                <p className="text-sm text-muted-foreground">How satisfied are you with our service?</p>
            </div>

            <div className="flex justify-center space-x-8 py-4">
                <button
                    type="button"
                    onClick={() => setRating("positive")}
                    className={cn(
                        "flex flex-col items-center space-y-2 p-6 rounded-2xl border-2 transition-all",
                        rating === "positive"
                            ? "border-green-500 bg-green-200/10 text-green-700 shadow-sm"
                            : "border-transparent hover:bg-muted"
                    )}
                >
                    <ThumbsUp className={cn("w-10 h-10", rating === "positive" ? "text-green-600" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">Positive</span>
                </button>
                <button
                    type="button"
                    onClick={() => setRating("negative")}
                    className={cn(
                        "flex flex-col items-center space-y-2 p-6 rounded-2xl border-2 transition-all",
                        rating === "negative"
                            ? "border-red-500 bg-red-200/10 text-red-700 shadow-sm"
                            : "border-transparent hover:bg-muted"
                    )}
                >
                    <ThumbsDown className={cn("w-10 h-10", rating === "negative" ? "text-red-600" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">Negative</span>
                </button>
            </div>

            <div className="space-y-2 flex-1">
                <Label htmlFor="feedback-comment">Additional comments (optional)</Label>
                <Textarea
                    id="feedback-comment"
                    placeholder="Tell us what you like or how we can improve..."
                    className="min-h-[120px] resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full h-12 blue-button text-base font-semibold" disabled={isSubmitting || !rating}>
                {isSubmitting ? "Sending..." : (
                    <>
                        <Send className="w-5 h-5 mr-2" /> Send Feedback
                    </>
                )}
            </Button>
        </form>
    );
}
