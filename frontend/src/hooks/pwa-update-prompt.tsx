import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";
import secureLocalStorage from "react-secure-storage";
import {
    APP_NAME,
    PLAY_STORE_ADMIN,
    PLAY_STORE_MEMBER,
    APP_STORE_MEMBER,
    PLATFORM
} from "@/lib/constants";
import { useUpdateStore } from "@/components/store/updateStore";

function useIsMobile() {
    // ...
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return isMobile;
}

export function PwaUpdatePrompt() {
    const isMobile = useIsMobile();
    const { mustUpdate } = useUpdateStore();

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log("SW Registered: ", r);
        },
        onRegisterError(error) {
            console.log("SW registration error", error);
        },
    });

    const handleUpdate = async () => {
        // If running in a native app (Capacitor)
        // @ts-ignore
        if (window.Capacitor) {
            const isAndroid = /Android/i.test(navigator.userAgent);
            let storeUrl = "";

            if (PLATFORM === "ADMIN_APP") {
                storeUrl = PLAY_STORE_ADMIN;
            } else {
                storeUrl = isAndroid ? PLAY_STORE_MEMBER : APP_STORE_MEMBER;
            }

            window.open(storeUrl, "_system");
            return;
        }

        try {
            console.log("Performing soft reboot - clearing all storage...");

            // 1. Clear regular Storage
            localStorage.clear();
            sessionStorage.clear();

            // 2. Clear Secure Storage
            secureLocalStorage.clear();

            // 3. Clear Cookies
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            }

            // 4. Delete IndexedDB
            const dbName = "conversational_ai_db";
            const deleteDB = indexedDB.deleteDatabase(dbName);

            deleteDB.onsuccess = () => {
                console.log("IndexedDB deleted successfully");
                updateServiceWorker(true);
            };

            deleteDB.onerror = () => {
                console.error("Error deleting IndexedDB");
                updateServiceWorker(true);
            };

            deleteDB.onblocked = () => {
                console.warn("IndexedDB delete blocked - updating anyway");
                updateServiceWorker(true);
            };

            // Fallback reload if SW doesn't trigger it
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error("Error during update cleanup:", error);
            updateServiceWorker(true);
        }
    };

    const showPrompt = needRefresh || mustUpdate;
    if (!showPrompt) return null;

    const Content = (
        <div className="flex flex-col items-center text-center p-6 gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RefreshCcw className="h-8 w-8 animate-spin-slow" />
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">
                    {mustUpdate ? "Critical Update Required" : "System Update Available"}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">
                    {mustUpdate
                        ? "A mandatory security and performance update is required to continue using the application."
                        : `A new version of ${APP_NAME} is ready. This update includes important security fixes and performance improvements.`
                    }
                </p>
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 py-2 px-3 rounded-lg border border-amber-100 mt-4">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    System will perform a soft reboot
                </div>
            </div>

            <div className="flex flex-col w-full gap-3">
                <Button
                    onClick={handleUpdate}
                    className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20"
                >
                    Update & Restart
                </Button>
                {!mustUpdate && (
                    <Button
                        variant="ghost"
                        onClick={() => setNeedRefresh(false)}
                        className="w-full h-11 text-muted-foreground hover:text-foreground"
                    >
                        Later
                    </Button>
                )}
            </div>
        </div>
    );

    // 📱 Mobile → Drawer
    if (isMobile) {
        return (
            <Drawer open dismissible={false}>
                <DrawerContent>
                    {Content}
                </DrawerContent>
            </Drawer>
        );
    }

    // 🖥 Desktop → Dialog
    return (
        <Dialog open onOpenChange={() => { }}>
            <DialogContent
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                className="max-w-[400px] p-0"
            >
                {Content}
            </DialogContent>
        </Dialog>
    );
}
