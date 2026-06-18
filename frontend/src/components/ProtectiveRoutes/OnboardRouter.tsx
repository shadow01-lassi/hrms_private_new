import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getOnboardingToken } from "@/lib/utils";
import AuthCheckSkeleton from "../prompts/auth-check-skeleton";
import { REDIRECT_WHEN_ONBOARD_JWT_EXISTS } from "@/lib/constants";
import { ErrorBoundary } from "../error-boundary/error-boundary";

export default function OnboardRouter() {
    const [hasToken, setHasToken] = useState<boolean | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            const { payload } = await getOnboardingToken();
            if (payload && payload.cm_id && payload.cm_name && payload.cm_email) {
                setHasToken(true);
            } else {
                setHasToken(false);
            }
        };

        checkToken();
    }, []);

    if (hasToken === null) {
        return <AuthCheckSkeleton />;
    }

    if (hasToken) {
        return <Navigate to={REDIRECT_WHEN_ONBOARD_JWT_EXISTS} replace />;
    }

    return (
        <ErrorBoundary>
            <Outlet />
        </ErrorBoundary>
    );
}