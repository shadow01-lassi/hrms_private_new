// importing from react
import React, { useEffect, useState } from "react";
import { IdleTimerProvider } from "react-idle-timer";

// importing shadcn components
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction
} from "@/components/ui/alert-dialog";

// importing libraries, constants and others
import { logout } from "@/lib/authentication";
import {
    AUTO_LOGOUT,
    AUTO_LOGOUT_COUNTDOWN,
    AUTO_LOGOUT_INTIMATION
} from "@/lib/constants";

export function IdleTimeWrapper({ children }: { children: React.ReactNode }) {
    const [showDialog, setShowDialog] = useState(false);
    const [countdown, setCountdown] = useState(AUTO_LOGOUT_COUNTDOWN); // 1 minute countdown = 300 sec - to be entered
    const [isLoggedOut, setIsLoggedOut] = useState(false);

    const handleOnPrompt = () => {
        console.log("[IdleTimer] Prompt triggered"); // ✅ Confirm this logs
        setShowDialog(true);
        setCountdown(300);
    };

    const handleOnIdle = async () => {
        localStorage.clear();
        setIsLoggedOut(true);
        await logout();
    };

    const handleConfirmLogout = () => {
        logout();
        setShowDialog(false);
    };

    // Countdown and Refresh Prevention logic
    useEffect(() => {
        if (!showDialog) return;

        // Prevent refresh while prompt is active
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        if (isLoggedOut) {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            return;
        }

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsLoggedOut(true);
                    logout(); // Automatically trigger logout
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [showDialog, isLoggedOut]);

    return (
        <>
            <IdleTimerProvider
                crossTab={true}
                element={document}
                timeout={AUTO_LOGOUT}
                promptBeforeIdle={AUTO_LOGOUT_INTIMATION}
                onPrompt={handleOnPrompt}
                onIdle={handleOnIdle}
                onActive={() => {
                    if (!isLoggedOut) {
                        console.log("[IdleTimer] User active");
                        setCountdown(AUTO_LOGOUT_COUNTDOWN);
                    }
                }}
                debounce={500}
            >
                {children}
            </IdleTimerProvider>

            <AlertDialog open={showDialog}>
                <AlertDialogContent
                    {...({
                        onEscapeKeyDown: (e: KeyboardEvent) => e.preventDefault(),
                        onPointerDownOutside: (e: any) => e.preventDefault(),
                    } as any)}
                    className="w-full md:w-sm"
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isLoggedOut ? "Session Expired" : "Inactive Session Warning"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {isLoggedOut
                                ? "Your session has ended due to inactivity. Please log in again to continue."
                                : `You will be automatically logged out in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")} to protect your account security.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        {isLoggedOut ? (
                            <AlertDialogAction
                                onClick={handleConfirmLogout}
                                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Logout and Sign In Again
                            </AlertDialogAction>
                        ) : (
                            <AlertDialogAction
                                onClick={() => {
                                    setShowDialog(false);
                                    console.log("[IdleTimer] Session resumed");
                                    setCountdown(AUTO_LOGOUT_COUNTDOWN);
                                }}
                            >
                                Continue Working
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
