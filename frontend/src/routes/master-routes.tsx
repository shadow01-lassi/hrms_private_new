import React from "react";
import { Route } from "react-router-dom";

// MASTERS & REGISTERS PAGES

// stock register
const StockRegister = React.lazy(() => import("@/pages/dashboard/stock-register/stock-register"));

// company master
const CompanyMasterPage = React.lazy(() => import("@/pages/dashboard/company-master/company-master.page"));
const CompanyMasterAddPage = React.lazy(() => import("@/pages/dashboard/company-master/company-master-add.page"));
const CompanyMasterEditPage = React.lazy(() => import("@/pages/dashboard/company-master/company-master-edit.page"));

// employee master
const EmployeeMasterPage = React.lazy(() => import("@/pages/dashboard/employee-master/employee-master.page"));
const EmployeeMasterAddPage = React.lazy(() => import("@/pages/dashboard/employee-master/employee-master-add.page"));
const EmployeeMasterQuickAddPage = React.lazy(() => import("@/pages/dashboard/employee-master/employee-master-quick-add.page"));
const EmployeeMasterEditPage = React.lazy(() => import("@/pages/dashboard/employee-master/employee-master-edit.page"));

export const MasterRoutes = (
    <>
        {/* STOCK REGISTER */}
        <Route path="/dashboard/registers/stock-register" element={<StockRegister />} />

        {/* COMPANY MASTER */}
        <Route path="/dashboard/registers/company-master" element={<CompanyMasterPage />} />
        <Route path="/dashboard/registers/company-master/add" element={<CompanyMasterAddPage />} />
        <Route path="/dashboard/registers/company-master/edit/:id" element={<CompanyMasterEditPage />} />

        {/* EMPLOYEE MASTER */}
        <Route path="/dashboard/registers/employee-master" element={<EmployeeMasterPage />} />
        <Route path="/dashboard/registers/employee-master/add" element={<EmployeeMasterAddPage />} />
        <Route path="/dashboard/registers/employee-master/quick-add" element={<EmployeeMasterQuickAddPage />} />
        <Route path="/dashboard/registers/employee-master/edit/:id" element={<EmployeeMasterEditPage />} />
    </>
);
