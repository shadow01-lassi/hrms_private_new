import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ReportIssuePage({ initialTitle = "" }: { initialTitle?: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState(initialTitle);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Issue reported successfully! Our team will look into it.");
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                    If you are experiencing a critical system failure, please call our emergency support line instead.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="issue-title">Issue Title</Label>
                    <Input
                        id="issue-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Briefly describe the issue"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select defaultValue="medium">
                            <SelectTrigger id="priority">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select defaultValue="ui">
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ui">User Interface</SelectItem>
                                <SelectItem value="performance">Performance</SelectItem>
                                <SelectItem value="data">Data Issue</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Provide details on how to reproduce the issue..."
                        className="min-h-[120px]"
                        autoFocus={true}
                        required
                    />
                </div>
            </div>

            <Button type="submit" className="blue-button" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : (
                    <>
                        <Send className="w-4 h-4 mr-2" /> Submit Issue
                    </>
                )}
            </Button>
        </form>
    );
}
