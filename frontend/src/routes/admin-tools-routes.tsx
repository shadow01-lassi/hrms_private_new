import React from "react";
import { Route } from "react-router-dom";

// Admin Tools
const UserRolePage = React.lazy(() => import("@/pages/admin/user-roles/user-roles"));
const RolePermissionsPage = React.lazy(() => import("@/pages/admin/user-roles/permissions.form"));
const LoginCredentials = React.lazy(() => import("@/pages/admin/login-credentials/login-credentials"));
const LoginCredentialAdd = React.lazy(() => import("@/pages/admin/login-credentials/login-credential-add"));
const LoginCredentialEdit = React.lazy(() => import("@/pages/admin/login-credentials/login-credential-edit"));
const ChangeLogsPage = React.lazy(() => import("@/pages/admin/change-logs/change-logs.page"));
const ChangeLogsAddPage = React.lazy(() => import("@/pages/admin/change-logs/change-logs-add-page"));
const ChangeLogsEditPage = React.lazy(() => import("@/pages/admin/change-logs/change-logs-edit-page"));
const ErrorLogs = React.lazy(() => import("@/pages/admin/error-logs/error-logs.page"));
const MenuStructurePage = React.lazy(() => import("@/pages/admin/menu-structure/menu-structure"));

export const AdminToolsRoutes = (
    <>
        {/* ADMIN TOOLS */}
        <Route path="/dashboard/admin-tools/user-roles" element={<UserRolePage />} />
        <Route path="/dashboard/admin-tools/user-roles/permissions" element={<RolePermissionsPage />} />

        <Route path="/dashboard/registers/login-credentials" element={<LoginCredentials />} />
        <Route path="/dashboard/registers/login-credentials/create" element={<LoginCredentialAdd />} />
        <Route path="/dashboard/registers/login-credentials/edit" element={<LoginCredentialEdit />} />

        <Route path="/dashboard/admin-tools/change-logs" element={<ChangeLogsPage />} />
        <Route path="/dashboard/admin-tools/change-logs/add" element={<ChangeLogsAddPage />} />
        <Route path="/dashboard/admin-tools/change-logs/edit" element={<ChangeLogsEditPage />} />
        <Route path="/dashboard/admin-tools/error-logs" element={<ErrorLogs />} />

        {/* MENU STRUCTURE */}
        <Route path="/dashboard/admin-tools/menu-structure" element={<MenuStructurePage />} />
    </>
);
