import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export function NavigationHandler() {
    const navigate = useNavigate();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

    const cancelRef = useRef<HTMLButtonElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);

    const hasSensitiveUrl = () => {
        if (typeof window === "undefined") return false;
        const currentUrl = window.location.href.toLowerCase();
        // Add words that indicate a form/edit state
        const sensitiveWords = ["add", "edit", "create", "update"];
        return sensitiveWords.some(word => currentUrl.includes(word));
    };

    const isOverlayOpen = () => {
        // 1. Check for Radix UI's scroll lock attribute (present on open Dialogs/Sheets)
        if (document.body.hasAttribute("data-scroll-locked")) return true;

        // 2. Check for open Popovers, Dropdowns, or Comboboxes
        // (The Time Slot picker in your screenshot is likely a 'listbox' or inside a 'popper-content-wrapper')
        const overlays = document.querySelectorAll(
            '[role="dialog"][data-state="open"], [role="listbox"], [role="menu"], [data-radix-popper-content-wrapper]'
        );

        // If any overlay is found, we assume the user is interacting with a UI element
        // and we should NOT trigger the page navigation.
        return overlays.length > 0;
    };

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            // 1. If Shadcn/Radix already handled this event (to close a modal), STOP immediately.
            if (event.defaultPrevented) return;

            if (event.key === "Escape") {
                // 3. CRITICAL: Check if ANY modal or popover is already open.
                // If "Assign Technician" is open, isOverlayOpen() returns true.
                // This tells our script: "Don't go back, let the modal handle the Escape key."
                if (!showConfirmation && isOverlayOpen()) {
                    return;
                }

                // Only prevent default if we are actually going to intercept the navigation
                event.preventDefault();

                if (hasSensitiveUrl()) {
                    setPendingNavigation(() => () => navigate(-1));
                    setShowConfirmation(true);
                } else {
                    navigate(-1);
                }
            }
        };

        window.addEventListener("keydown", handleEscapeKey);
        return () => window.removeEventListener("keydown", handleEscapeKey);
    }, [navigate, showConfirmation]);

    // Handle Arrow Keys for dialog navigation
    useEffect(() => {
        if (!showConfirmation) return;

        const handleDialogKeys = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                cancelRef.current?.focus();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                confirmRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleDialogKeys);
        return () => window.removeEventListener("keydown", handleDialogKeys);
    }, [showConfirmation]);

    const handleConfirm = () => {
        if (pendingNavigation) pendingNavigation();
        setShowConfirmation(false);
        setPendingNavigation(null);
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setPendingNavigation(null);
    };

    // --- KEY FIX ---
    // If we are not showing the confirmation, we return NULL.
    // This ensures the Dialog component is REMOVED from the DOM entirely.
    // It cannot lock scrolling, trap focus, or interfere with other Modals if it doesn't exist.
    if (!showConfirmation) return null;

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) handleCancel() }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Are you sure you want to go back?</DialogTitle>
                    <DialogDescription>
                        You have unsaved changes. Going back now will discard any changes you've made.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end space-x-0">
                    <Button variant="outline" onClick={handleCancel} ref={cancelRef}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} ref={confirmRef}>
                        Yes, Go Back
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}