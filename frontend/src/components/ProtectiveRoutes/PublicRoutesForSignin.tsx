// importing from react
import { useEffect, useState } from "react";
import {
    Navigate,
    Outlet,
} from "react-router-dom";

// importing components
import AuthCheckSkeleton from "@/components/prompts/auth-check-skeleton";

// importing constants
import { REDIRECT_WHEN_JWT_EXISTS } from "@/lib/constants";

// importing authentication
import { getSession } from "@/lib/authentication";
import { NavLogo } from "@/components/navbar/nav-logo";
import { ErrorBoundary } from "../error-boundary/error-boundary";

const PublicRoutesForSignIn = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            const session = await getSession();
            if (session && session.jwt && session.user) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        };

        checkToken();
    }, []);

    if (isAuthenticated === null) {
        return (
            <>
                <AuthCheckSkeleton />
            </>
        );
    }

    return isAuthenticated ? (
        <Navigate to={REDIRECT_WHEN_JWT_EXISTS} />
    ) : (
        <>
            <ErrorBoundary>
                <div className="flex gap-4 h-screen p-2">
                    <div className={`
                    bg-foreground
                    rounded-4xl w-[40vw] p-4 hidden md:block
                    bg-cover bg-center
                    `}>
                        {/* bg-[url(https://teja12.kuikr.com/is/a/c/655x525/gallery_images/original/cf62e12c3197b59.gif)] */}
                        <div className="w-fit flex gap-2 items-center">
                            <NavLogo />
                        </div>
                    </div>
                    <div className="m-auto">
                        <Outlet />
                    </div>
                </div>
            </ErrorBoundary>
        </>
    );
};

export default PublicRoutesForSignIn;