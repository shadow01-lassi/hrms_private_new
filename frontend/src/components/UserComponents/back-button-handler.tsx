// importing from react
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export function BackButtonHandler() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to track current URL
    const [showConfirmation, setShowConfirmation] = useState(false);

    // We don't need pendingNavigation for the browser back button (popstate),
    // but we keep it for the Escape key logic if needed.
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

    const cancelRef = useRef<HTMLButtonElement>(null);
    const confirmRef = useRef<HTMLButtonElement>(null);

    // Track the "current" path so we can restore it if we block navigation
    const currentPathRef = useRef(location.pathname + location.search);

    // Update the ref whenever location changes (so we always know "where we are now")
    useEffect(() => {
        currentPathRef.current = location.pathname + location.search;
    }, [location]);

    const hasSensitiveUrl = () => {
        if (typeof window === "undefined") return false;
        const currentUrl = window.location.href.toLowerCase();
        const sensitiveWords = ["add", "edit", "create", "update"];
        return sensitiveWords.some(word => currentUrl.includes(word));
    };

    const isOverlayOpen = () => {
        // 1. Check for Radix UI's scroll lock (Dialogs/Sheets)
        if (document.body.hasAttribute("data-scroll-locked")) return true;

        // 2. Check for open Popovers, Dropdowns, Selects, or Menus
        const overlays = document.querySelectorAll(
            '[role="dialog"][data-state="open"], [role="listbox"], [role="menu"], [data-radix-popper-content-wrapper]'
        );
        return overlays.length > 0;
    };

    // --- 1. HANDLE BROWSER BACK BUTTON (Popstate) ---
    useEffect(() => {
        const handlePopState = (_event: PopStateEvent) => {
            // A. PRIORITY: If an overlay is open, CLOSE IT and STAY on page.
            if (isOverlayOpen()) {
                // 1. Restore the URL (effectively cancelling the back navigation)
                // We push the 'currentPathRef' (where the modal was open) back onto the stack.
                window.history.pushState(null, "", currentPathRef.current);

                // 2. Simulate 'Escape' to close the Shadcn overlay
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
                return;
            }

            // B. SECONDARY: Unsaved Changes Protection
            // If no overlay, but we are in a "sensitive" state, ask for confirmation.
            if (hasSensitiveUrl() && !showConfirmation) {
                // 1. Restore URL to prevent leaving immediately
                window.history.pushState(null, "", currentPathRef.current);

                // 2. Show the confirmation dialog
                setShowConfirmation(true);
                // Set pending navigation to actually go back if they confirm
                setPendingNavigation(() => () => navigate(-1));
            }

            // C. If neither, allow the browser back event to proceed normally.
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate, showConfirmation]); // Dependencies

    // --- 2. HANDLE ESCAPE KEY (Same as before) ---
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            const target = event.target as HTMLElement;
            if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

            if (event.key === "Escape") {
                if (!showConfirmation && isOverlayOpen()) {
                    // Let Radix handle closing the modal
                    return;
                }

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

    // Handle Arrow Keys for dialog navigation (Same as before)
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

    if (!showConfirmation) return null;

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) handleCancel() }}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to go back?</DialogTitle>
                    <DialogDescription>
                        You have unsaved changes. Going back now will discard any changes you've made.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-end space-x-2">
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