import { useState, useRef } from "react";
import {
    Image as ImageIcon,
    Crop as CropIcon,
    AlertCircle,
    RotateCcw,
    RotateCw,
    AlignCenter,
    Move,
    Upload,
    X,
    Loader2,
} from "lucide-react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import api from "@/lib/api";

interface CropLogoUploadProps {
    value?: string;
    onChange: (url: string) => void;
    uploadPath: string;
    label?: string;
    description?: string;
}

interface LogoCropDialogProps {
    image: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCropComplete: (croppedImage: string) => void;
}

function LogoCropDialog({ image, open, onOpenChange, onCropComplete }: LogoCropDialogProps) {
    const cropperRef = useRef<any>(null);
    const [rotation, setRotation] = useState(0);

    const handleRotate = (deg: number) => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.rotate(deg);
            const currentRotation = cropper.getData().rotate;
            setRotation(currentRotation);
        }
    };

    const handleRotateTo = (deg: number) => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.rotateTo(deg);
            setRotation(deg);
        }
    };

    const handleAutoCenter = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const containerData = cropper.getContainerData();
            const canvasData = cropper.getCanvasData();
            const cropBoxData = cropper.getCropBoxData();

            const newCanvasLeft = (containerData.width - canvasData.width) / 2;
            const newCanvasTop = (containerData.height - canvasData.height) / 2;

            cropper.setCanvasData({
                left: newCanvasLeft,
                top: newCanvasTop,
            });

            const newCropBoxLeft = (containerData.width - cropBoxData.width) / 2;
            const newCropBoxTop = (containerData.height - cropBoxData.height) / 2;

            cropper.setCropBoxData({
                left: newCropBoxLeft,
                top: newCropBoxTop,
            });

            toast.success("Aligned everything to center!");
        }
    };

    const handleSave = () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        try {
            const croppedCanvas = cropper.getCroppedCanvas({
                width: 512,
                height: 512,
                fillColor: "#fff",
                imageSmoothingEnabled: true,
                imageSmoothingQuality: "high",
            });

            if (croppedCanvas) {
                const croppedImage = croppedCanvas.toDataURL("image/png");
                onCropComplete(croppedImage);
                onOpenChange(false);
            }
        } catch (e) {
            toast.error("Failed to crop image");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-full max-h-[95vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-4 bg-background border-b flex flex-row items-center justify-between sticky top-0 z-20">
                    <div>
                        <DialogTitle className="text-lg font-extrabold tracking-tight">Refine Logo</DialogTitle>
                        <p className="text-[12px] text-muted-foreground mt-0">Adjust, rotate, and center your logo for a perfect fit.</p>
                    </div>
                </DialogHeader>

                <div className="bg-[#1a1a1a] mb-0 flex items-center justify-center min-h-[400px] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                    <div className="w-full max-w-[500px] rounded-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 z-10">
                        <Cropper
                            src={image}
                            style={{ height: 350, width: "100%" }}
                            initialAspectRatio={1}
                            aspectRatio={1}
                            guides={true}
                            center={true}
                            ref={cropperRef}
                            viewMode={0}
                            dragMode="move"
                            background={true}
                            responsive={true}
                            autoCropArea={1}
                            checkOrientation={false}
                            toggleDragModeOnDblclick={false}
                        />
                    </div>
                </div>

                <div className="p-4 bg-background border-t space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rotation: {rotation}°</label>
                            <div className="flex items-center gap-3">
                                <Button type="button" size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => handleRotate(-90)}>
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                                <Input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    step="1"
                                    value={rotation}
                                    onChange={(e) => handleRotateTo(Number(e.target.value))}
                                    className="w-full md:w-32 h-1.5 p-0 bg-muted rounded-full cursor-pointer accent-primary"
                                />
                                <Button type="button" size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => handleRotate(90)}>
                                    <RotateCw className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full md:w-auto">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center md:text-left">Alignment</label>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 gap-2 font-semibold text-xs"
                                    onClick={handleAutoCenter}
                                >
                                    <AlignCenter className="h-3.5 w-3.5" />
                                    <span>Center Align</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        const cropper = cropperRef.current?.cropper;
                                        cropper?.reset();
                                        setRotation(0);
                                    }}
                                >
                                    <Move className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground leading-tight bg-muted/40 p-2 rounded-md border border-border/50">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Move image to see guides. Use handles to resize crop box.</span>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/5 gap-2">
                    <Button type="button" variant="ghost" size="sm" className="h-10 px-6 font-semibold" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="button" size="sm" className="h-10 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" onClick={handleSave}>Confirm Crop</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CropLogoUpload({ value, onChange, uploadPath, label, description }: CropLogoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result as string);
                setCropDialogOpen(true);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImage: string) => {
        setIsUploading(true);
        try {
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            const file = new File([blob], "logo.png", { type: "image/png" });

            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await api.post(uploadPath, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (uploadResponse.data.type === "success") {
                onChange(uploadResponse.data.data.url);
                toast.success("Image uploaded successfully!");
            } else {
                toast.error(uploadResponse.data.message || "Upload failed");
            }
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="shrink-0">
                <div className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center overflow-hidden group shadow-inner">
                    {value ? (
                        <>
                            <img src={value} alt="Logo" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:bg-white/20"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    <CropIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:bg-destructive"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onChange("");
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                            <ImageIcon className="w-10 h-10 opacity-40 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{label || "Upload Identity"}</span>
                        </div>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer hover:bg-muted/40 hover:border-primary/40 transition-all group active:scale-[0.98]"
                >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Upload className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg text-foreground">Click or Drag & Drop to Upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or SVG (Max. 2MB)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                {description && (
                    <div className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                        <span>{description}</span>
                    </div>
                )}
            </div>

            <LogoCropDialog
                image={selectedImage}
                open={cropDialogOpen}
                onOpenChange={setCropDialogOpen}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
}
