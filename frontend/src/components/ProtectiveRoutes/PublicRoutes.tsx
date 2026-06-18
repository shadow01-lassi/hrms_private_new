import { useEffect, useState, Suspense } from "react";
import { Outlet } from "react-router-dom";

// importing components
import { Navbar } from "@/components/navbar/navbar";
import AuthCheckSkeleton from "../prompts/auth-check-skeleton";
import { getAuthToken } from "@/lib/utils";
import { Footer } from "../footer/footer";

const PublicRoutes = () => {
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            const { token, payload } = await getAuthToken();
            if (payload) {
                console.log(token);
                setEmail(payload?.email ?? "");
                setUsername(payload?.name ?? "");
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        };

        checkToken();
    }, []);

    if (isAuthenticated === null) {
        return <AuthCheckSkeleton />;
    }

    return (
        <>
            <div>
                <Navbar
                    email={email}
                    username={username}
                />

                <div className="max-w-[1400px] w-full mx-auto page-padding">
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center min-h-[40vh] w-full gap-4">
                            <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                            <p className="text-muted-foreground text-xs font-medium animate-pulse">Loading...</p>
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </div>

                <Footer />
            </div>
        </>
    );
};

export default PublicRoutes;