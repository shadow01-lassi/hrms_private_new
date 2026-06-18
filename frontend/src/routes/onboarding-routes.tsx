import React from "react";
import { Route } from "react-router-dom";
import { PageNotFound } from "../components/PageNotFound/PageNotFound";

// ONBOARDING PAGES
const OnboardingRoutesLayout = React.lazy(() => import("@/components/ProtectiveRoutes/OnboardingRoutes"));
const OnboardRouter = React.lazy(() => import("@/components/ProtectiveRoutes/OnboardRouter"));

// onboarding login page/step 1
const OnboardPage = React.lazy(() => import("@/pages/onboard/onboard.page"));

// onboarding dashboard
const OnboardDashboardPage = React.lazy(() => import("@/pages/onboard/dashboard/onboard-dashboard.page"));

export const OnboardingRoutes = (
    <>
        <Route element={<OnboardRouter />}>
            <Route path="/onboard" element={<OnboardPage />} />
        </Route>

        <Route element={<OnboardingRoutesLayout />}>
            <Route path="/onboard/dashboard" element={<OnboardDashboardPage />} />

            <Route path="/onboard/*" element={<PageNotFound />} />
        </Route>
    </>
);
