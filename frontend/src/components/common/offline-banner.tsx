import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { WifiOff } from "lucide-react";
import { APP_NAME, OFFLINE } from "@/lib/constants";

const OFFLINE_DELAY = 2000;
const ONLINE_POLL = 5000;

export function OfflineOverlay() {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const show = () => {
            if (timeoutRef.current) return;
            timeoutRef.current = window.setTimeout(() => {
                setOpen(true);
            }, OFFLINE_DELAY);
        };

        const hide = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setOpen(false);
        };

        if (!navigator.onLine) show();

        window.addEventListener("offline", show);
        window.addEventListener("online", () => { hide(); window.location.reload(); });

        const poll = setInterval(() => {
            if (navigator.onLine) hide();
        }, ONLINE_POLL);

        return () => {
            window.removeEventListener("offline", show);
            window.removeEventListener("online", hide);
            clearInterval(poll);
        };
    }, []);

    return (
        <>
            <Dialog open={open} onOpenChange={() => { }}>
                <DialogContent className="bg-background/80 backdrop-blur-md text-center">
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                key="offline-modal"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.2 }}
                            >
                                <DialogHeader>
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                                        {/* <WifiOff /> */}
                                        <img src={OFFLINE} alt="offline" />
                                    </div>

                                    <div className="text-center">
                                        <h1 className="sub-heading">{`You’re offline`}</h1>

                                        <p className="para light-text text-muted-foreground w-[80%] mx-auto">
                                            {`Access to ${APP_NAME} is a feature we're working on. Stay tuned!`}
                                        </p>
                                    </div>
                                </DialogHeader>

                                <Button
                                    className="mt-6"
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </>
    );
}
