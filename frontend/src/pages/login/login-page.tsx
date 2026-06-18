// importing from react
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

// importing components
import AuthCheckSkeleton from "@/components/prompts/auth-check-skeleton";

import {
    // AUTH_URL_GOOGLE,
    REDIRECT_WHEN_JWT_EXISTS,
} from "@/lib/constants";
import { getSession } from "@/lib/authentication";
import { LoginForm } from "./login";

export default function LoginPage() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        async function sessionGet() {
            const session = await getSession();
            if (session) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        }
        sessionGet();
    }, []);

    if (isAuthenticated === null) {
        return (
            <>
                <AuthCheckSkeleton />
            </>
        );
    }

    return isAuthenticated ? (
        <>
            <Navigate to={REDIRECT_WHEN_JWT_EXISTS} />
        </>
    ) : (
        <>
            <div className="flex flex-col justify-center items-center gap-6 bg-background">
                <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                    <LoginForm />
                </div>
            </div>
        </>
    );
}