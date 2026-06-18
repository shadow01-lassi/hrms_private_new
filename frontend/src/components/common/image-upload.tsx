import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { X, Upload, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/image-compression";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface ImageUploadProps {
    value?: string | File;
    onChange: (value: string | File) => void;
    onRemove: () => void;
    disabled?: boolean;
    className?: string;
    deferred?: boolean; // New prop to enable deferred upload
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    disabled,
    className,
    deferred = false,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle preview URL generation
    useEffect(() => {
        if (typeof value === 'string') {
            setPreviewUrl(value);
        } else if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl("");
        }
    }, [value]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate size (< 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            // Optional client-side compression
            const compressedFile = await compressImage(file);

            if (deferred) {
                // Deferred mode: Just return the file
                onChange(compressedFile);
            } else {
                const formData = new FormData();
                formData.append("file", compressedFile); // Must match the field name in upload.single("file")

                // ✅ Send FormData directly with proper headers
                const response = await api.post(`/upload/image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.type === "success") {
                    console.log("[ImageUpload] Uploaded image URL:", response.data.data.url);
                    setPreviewUrl(response.data.data.url);
                    onChange(response.data.data.url);
                    toast.success("Image uploaded successfully");
                } else {
                    throw new Error(response.data.message || "Upload failed");
                }
            }
        } catch (error) {
            console.error("[ImageUpload] Upload error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to upload image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className={cn("flex items-center gap-4", className)}>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />

            {previewUrl ? (
                <div className="relative group">
                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="relative w-32 h-32 rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none">
                            <img src={previewUrl} alt="Full view" className="w-full h-auto rounded-lg" />
                        </DialogContent>
                    </Dialog>

                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={onRemove}
                        disabled={disabled}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    className="w-32 h-32 border-dashed flex flex-col items-center justify-center gap-1 p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Upload</span>
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}