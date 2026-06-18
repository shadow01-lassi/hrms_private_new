import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { decodeJWT } from "@/lib/utils";
import { getFromStorage } from "@/lib/storage";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public componentDidMount() {
        window.addEventListener("popstate", this.handlePopState);
    }

    public componentWillUnmount() {
        window.removeEventListener("popstate", this.handlePopState);
    }

    private handlePopState = () => {
        if (this.state.hasError) {
            this.setState({ hasError: false, error: null });
        }
    };

    public static getDerivedStateFromError(error: Error): State {
        const lastReloadTime = sessionStorage.getItem("error_auto_reload_time");
        const now = Date.now();

        // If no auto-reload has happened in the last 10 seconds, we flag one to happen.
        if (!lastReloadTime || now - parseInt(lastReloadTime, 10) > 10000) {
            sessionStorage.setItem("error_auto_reload_time", now.toString());
        }

        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const lastReloadTime = sessionStorage.getItem("error_auto_reload_time");
        const now = Date.now();

        // If the reload flag was set just now (< 2 seconds ago), do the auto-reload
        if (lastReloadTime && now - parseInt(lastReloadTime, 10) < 2000) {
            console.warn("Attempting auto-reload to recover from error...");
            window.location.reload();
            return;
        }

        // Log the error to the console for debugging
        console.error("--- GLOBAL APP ERROR CAUGHT ---");
        console.error("Error:", error);
        console.error("Component Stack:", errorInfo.componentStack);
        console.error("--------------------------------");

        // Report to backend
        this.logErrorToBackend(error, errorInfo);
    }

    private logErrorToBackend = async (error: Error, errorInfo: ErrorInfo) => {
        try {
            const session = getFromStorage("session");
            const user = session ? decodeJWT(String(session)) : null;

            const payload = {
                platform: "GATE_KEEPER",
                functionName: "ErrorBoundary.componentDidCatch",
                error: {
                    name: error.name || "UnknownError",
                    message: error.message || "No message",
                    stack: error.stack || errorInfo.componentStack || ""
                },
                endpoint: window.location.pathname,
                username: user?.email || "anonymous",
                severity: "CRITICAL"
            };

            await api.post("/error/register", payload);
        } catch (err) {
            console.error("CRITICAL: Failed to report error to backend", err);
        }
    };

    private handleReset = () => {
        // Hard reload the application for a clean state
        window.location.reload();
    };

    private handleGoBack = () => {
        if (window.history.length > 1) {
            window.history.back();
            // Clear error state after a short delay to allow router to process the history change
            setTimeout(() => {
                this.setState({ hasError: false, error: null });
            }, 50);
        } else {
            window.location.href = '/';
        }
    };

    public render() {
        if (this.state.hasError) {
            const lastReloadTime = sessionStorage.getItem("error_auto_reload_time");
            const now = Date.now();

            // If we are in the middle of our auto-reload, show a clean message
            if (lastReloadTime && now - parseInt(lastReloadTime, 10) < 2000) {
                return (
                    <div className="fixed inset-0 z-1000 flex flex-col items-center justify-center bg-background">
                        <RotateCcw className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
                        <p className="text-muted-foreground font-medium animate-pulse">Applying updates...</p>
                    </div>
                );
            }

            return (
                <div className="fixed inset-0 z-1000 flex flex-col items-center justify-center bg-background p-6 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertCircle size={48} />
                    </div>

                    <h1 className="mb-2 text-2xl font-black tracking-tight">
                        Something went wrong
                    </h1>

                    <p className="mb-8 max-w-sm text-sm font-medium text-muted-foreground leading-relaxed">
                        The application encountered an unexpected error. Don't worry—your background tasks and offline data are safe.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 rounded-2xl px-8 font-bold gap-2 shadow-sm active:scale-95 transition-all w-full md:w-fit"
                            onClick={this.handleGoBack}
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Go Back
                        </Button>
                        <Button
                            size="lg"
                            className="h-14 rounded-2xl px-8 font-bold gap-2 shadow-lg active:scale-95 transition-all w-full md:w-fit"
                            onClick={this.handleReset}
                        >
                            <RotateCcw className="h-5 w-5" />
                            Reload App
                        </Button>
                    </div>

                    <p className="mt-8 text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">
                        Error details logged to console for support
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
