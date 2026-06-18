import React from "react";
import { Route } from "react-router-dom";

// Settings
const SettingsLayout = React.lazy(() => import("@/pages/settings/settings-layout"));
const AppearanceSettingsPage = React.lazy(() => import("@/pages/settings/appearance/appearance.page"));

export const SettingsRoutes = (
    <>
        {/* SETTINGS */}
        <Route element={<SettingsLayout />}>
            <Route path="/dashboard/settings" element={<AppearanceSettingsPage />} />
            <Route path="/dashboard/settings/appearance" element={<AppearanceSettingsPage />} />
            <Route path="/dashboard/settings/company" element={<AppearanceSettingsPage />} />
            <Route path="/dashboard/settings/notifications" element={<div className="p-4">Notification Settings (Coming Soon)</div>} />
            <Route path="/dashboard/settings/account" element={<div className="p-4">Account Settings (Coming Soon)</div>} />
        </Route>
    </>
);
