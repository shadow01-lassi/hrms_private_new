import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import AppRouter from "./routes/router";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PwaUpdatePrompt } from "./hooks/pwa-update-prompt";
import { StyleProvider } from "@/components/StyleProvider";
import { useState, useEffect } from "react";
import { initPersistentStorage } from "@/lib/storage";
import { SplashScreen } from "@/components/loading/SplashScreen";

const Root = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Fallback timeout: Max 3 seconds
        const timeout = setTimeout(() => {
            setIsReady(true);
        }, 3000);

        // Actual initialization
        initPersistentStorage().finally(() => {
            clearTimeout(timeout);
            setIsReady(true);
        });
    }, []);

    if (!isReady) return <SplashScreen />;

    return (
        <StrictMode>
            <ThemeProvider defaultTheme="light" storageKey="theme">
                <StyleProvider>
                    <TooltipProvider>
                        <div className="min-h-screen">
                            <AppRouter />
                        </div>
                    </TooltipProvider>
                    <Toaster richColors />
                    <PwaUpdatePrompt />
                </StyleProvider>
            </ThemeProvider>
        </StrictMode>
    );
};

const container = document.getElementById("root");
if (container) {
    const globalRootKey = "__reactRoot__";
    let root = (window as any)[globalRootKey];
    if (!root) {
        root = createRoot(container);
        (window as any)[globalRootKey] = root;
    }
    root.render(<Root />);
}
