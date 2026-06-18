import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// LAYOUTS
import AdminProtectedRoutes from "../components/ProtectiveRoutes/AdminProtectedRoutes"
import PublicRoutes from "../components/ProtectiveRoutes/PublicRoutes";
import { PageNotFound } from "../components/PageNotFound/PageNotFound";
import PublicRoutesForSignIn from "@/components/ProtectiveRoutes/PublicRoutesForSignin";

import ForgotPassword from "../components/ForgotPassword/ForgotPassword";

// STATIC LANDING PAGES
import HomePage from "@/pages/home/home.page";
import SupportPage from "@/pages/support/support.page";

// LOGIN REGISTER ROUTES
import LoginPage from "@/pages/login/login-page";

// Sub-route Modules
import { DashboardRoutes } from "./dashboard-routes";
import { OnboardingRoutes } from "./onboarding-routes";

import { MasterRoutes } from "./master-routes";
import { SetupRegisterRoutes } from "./setup-register-routes";
import { AdminToolsRoutes } from "./admin-tools-routes";
import { SettingsRoutes } from "./settings-routes";
import { ComingSoon } from "@/components/prompts/coming-soon";

// importing constants
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";

// OTHER PAGES
const ChangelogPage = React.lazy(() => import("@/pages/changelog/changelog.page"));

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicRoutes />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/changelog" element={<ChangelogPage />} />
                </Route>

                <Route element={<PublicRoutesForSignIn />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<ForgotPassword />} />
                </Route>

                {/* ONBOARDING ROUTES */}
                {OnboardingRoutes}

                {/* Admin Protected Routes */}
                <Route element={<AdminProtectedRoutes />}>
                    {/* DASHBOARD & GENERAL ROUTES */}
                    {DashboardRoutes}

                    {/* ADMIN TOOLS ROUTES */}
                    {AdminToolsRoutes}

                    {/* SETTINGS ROUTES */}
                    {SettingsRoutes}

                    {/* REGISTER ROUTES */}
                    {MasterRoutes}

                    {/* SETUP REGISTER ROUTES */}
                    {SetupRegisterRoutes}

                    <Route path={`${APP_SIDEBAR_PARENT_LINK}/*`} element={<ComingSoon />} />
                </Route>

                {/* Catch-all route for 404 */}
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;