// NoticeForm.tsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import TipTapEditor from "../tiptap/tiptap-editor";
import api from "@/lib/api";

const noticeTypes = [
    { id: "General", name: "General" },
    { id: "Meeting Called", name: "Meeting Called" },
    { id: "Information", name: "Information" },
];

const noticeSignByOptions = [
    { id: "Secretary", name: "Secretary" },
    { id: "Treasurer", name: "Treasurer" },
    { id: "Chairman", name: "Chairman" },
];

export type Notice = {
    sn_cm_id: number;
    sn_create_by: string;
    sn_last_update_by: string | null;
    sn_last_update_date: string | null;
    sn_notice_date: string;
    sn_notice_description: string;
    sn_notice_end_date: string;
    sn_notice_id: number;
    sn_notice_sign_by: string;
    sn_notice_st_date: string;
    sn_notice_type: string;
    sn_status: 'active' | 'closed';
    sn_create_date: string;
};

type NoticeFormProps = {
    isEdit?: boolean;
    initialData?: Notice;
};

export default function NoticeForm({ isEdit = false, initialData }: NoticeFormProps) {
    const [noticeType, setNoticeType] = useState<string>("");
    const [noticeDate, setNoticeDate] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [noticeSignBy, setNoticeSignBy] = useState<string>("");
    const [description, setDescription] = useState("<p>Start typing your notice...</p>");
    const [today] = useState(new Date().toISOString().split('T')[0]);

    const navigate = useNavigate();

    useEffect(() => {
        setNoticeDate(today);

        if (isEdit && initialData) {
            setNoticeType(initialData.sn_notice_type);
            setNoticeDate(initialData.sn_notice_date);
            setStartDate(initialData.sn_notice_st_date);
            setEndDate(initialData.sn_notice_end_date);
            setNoticeSignBy(initialData.sn_notice_sign_by);
            setDescription(initialData.sn_notice_description || "<p>Start typing your notice...</p>");
        }
    }, [today, isEdit, initialData]);

    const handleSubmit = async () => {
        if (!isEdit) {
            // Validation for create mode
            if (!noticeType) {
                toast.error("Please select a notice type.");
                return;
            }
            if (!noticeSignBy) {
                toast.error("Please select who signs the notice.");
                return;
            }
            if (!startDate || !endDate) {
                toast.error("Please select both start and end dates.");
                return;
            }
            if (new Date(endDate) < new Date(startDate)) {
                toast.error("End date must be greater than or equal to start date.");
                return;
            }
        }

        const noticeData = {
            noticeDate: isEdit ? undefined : noticeDate,
            noticeType: isEdit ? undefined : noticeType,
            description,
            noticeSignBy: isEdit ? undefined : noticeSignBy,
            startDate: isEdit ? undefined : startDate,
            endDate: isEdit ? undefined : endDate,
            status: "active"
        };

        try {
            let response;

            if (isEdit && initialData) {
                response = await api.patch(`/meetings/notice/update/${initialData.sn_notice_id}`,
                    { description }
                );
            } else {
                response = await api.post(`/meetings/notice/create`, noticeData);
            }

            if ((response.status === 201 || response.status === 200) && response.data.type === "success") {
                toast.success(`Notice ${isEdit ? 'updated' : 'created'} successfully!`);
                navigate(-1);
            }
        } catch (error: any) {
            if (error.response) {
                const { data } = error.response;

                if (data.type === "error") {
                    toast.error(data.message || "Invalid data provided");
                }
            } else if (error.request) {
                toast.error("No response from server. Check your network connection.");
            } else {
                toast.error(`Failed to ${isEdit ? 'update' : 'create'} notice. Please try again.`);
            }
        }
    };

    const handleCancel = () => {
        navigate(-1);
        toast.info(`Notice ${isEdit ? 'editing' : 'creation'} cancelled.`);
    };

    return (
        <div className="space-y-4">
            <h1 className="sub-heading">
                {isEdit ? 'Edit Notice' : 'Create New Notice'}
            </h1>

            <Card className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Notice Date</Label>
                        <Input
                            type="date"
                            value={noticeDate}
                            readOnly
                            className="bg-muted"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Notice Type</Label>
                        <Select
                            value={noticeType}
                            onValueChange={setNoticeType}
                            disabled={isEdit}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {noticeTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={today}
                            disabled={isEdit}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || today}
                            disabled={isEdit}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Signed By</Label>
                        <Select
                            value={noticeSignBy}
                            onValueChange={setNoticeSignBy}
                            disabled={isEdit}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select signatory" />
                            </SelectTrigger>
                            <SelectContent>
                                {noticeSignByOptions.map((signer) => (
                                    <SelectItem key={signer.id} value={signer.id}>
                                        {signer.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-6 space-y-2">
                    <Label>Notice Content</Label>
                    <div className="rounded-md border p-4">
                        <TipTapEditor content={description} setEditorContent={setDescription} />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {isEdit ? 'Update Notice' : 'Create Notice'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}