import React from "react";
import { Route } from "react-router-dom";
import { PageNotFound } from "../components/PageNotFound/PageNotFound";

// Pages
const DashboardPage = React.lazy(() => import("@/pages/dashboard/dashboard/dashboard.page"));
const ChangelogPage = React.lazy(() => import("@/pages/changelog/changelog.page"));

// Reports
const Reports = React.lazy(() => import("@/pages/dashboard/reports/reports"));
const ExecuteReport = React.lazy(() => import("@/pages/dashboard/reports/execute-report"));

// Billing Plans & Profile
const BillingPage = React.lazy(() => import("@/pages/billing/billing.page"));
const ProfilePage = React.lazy(() => import("@/pages/dashboard/profile/profile.page"));
const SocietyProfilePage = React.lazy(() => import("@/pages/dashboard/profile/society-profile.page"));

export const DashboardRoutes = (
    <>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/dashboard" element={<DashboardPage />} />

        <Route path="/dashboard/changelog" element={<ChangelogPage />} />

        {/* REPORTS */}
        <Route path="/dashboard/reports" element={<Reports />} />
        <Route path="/dashboard/reports/execute" element={<ExecuteReport />} />

        {/* PROFILE & BILLING PLANS */}
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/society-profile" element={<SocietyProfilePage />} />
        <Route path="/dashboard/billing-plans" element={<BillingPage />} />

        <Route path="*" element={<PageNotFound />} />
    </>
);
