import { PageNotFound } from "@/components/PageNotFound/PageNotFound";
import React from "react";
import { Route } from "react-router-dom";

// Layout
const SetupRegisterLayout = React.lazy(() => import("@/pages/dashboard/setup-register/setup-register.page"));

// SETUP REGISTERS/MASTERS

// doc-type register
const DocTypePage = React.lazy(() => import("@/pages/dashboard/setup-register/doc-type/doc-type.page"));
const CreateDocTypePage = React.lazy(() => import("@/pages/dashboard/setup-register/doc-type/create-doc-type.page"));
const EditDocTypePage = React.lazy(() => import("@/pages/dashboard/setup-register/doc-type/edit-doc-type.page"));

// billing setup
const BillingSetupTable = React.lazy(() => import("@/pages/dashboard/setup-register/billing-setup/billing-setup-table"));
const BillingSetupAddPage = React.lazy(() => import("@/pages/dashboard/setup-register/billing-setup/billing-add-page"));

export const SetupRegisterRoutes = (
    <>
        <Route element={<SetupRegisterLayout category="billings" />}>
            {/* JUST FOR YOUR REFERENCE */}
            {/* <Route path="/dashboard/billings/setup/flat-area-register" element={<FlatAreaMasterTable />} />
            <Route path="/dashboard/billings/setup/flat-area-register/add" element={<FlatAreaAddForm />} />
            <Route path="/dashboard/billings/setup/flat-area-register/edit" element={<FlatAreaEditForm />} /> */}

            {/* BILLING SETUP */}
            {/* <Route path="/dashboard/billings/setup/billing-setup" element={<BillingSetupTable />} />
            <Route path="/dashboard/billings/setup/billing-setup/add-head" element={<BillingSetupAddPage />} /> */}

            <Route path="/dashboard/billings/setup/*" element={<PageNotFound />} />
        </Route>

        <Route element={<SetupRegisterLayout category="accounts" />}>
            {/* BILLING SETUP */}
            <Route path="/dashboard/billings/setup/billing-setup" element={<BillingSetupTable />} />
            <Route path="/dashboard/billings/setup/billing-setup/add-head" element={<BillingSetupAddPage />} />

            <Route path="/dashboard/accounts/setup/*" element={<PageNotFound />} />
        </Route>

        <Route element={<SetupRegisterLayout category="general" />}>
            {/* DOC-TYPE REGISTER */}
            <Route path="/dashboard/setup-registers/doc-types" element={<DocTypePage />} />
            <Route path="/dashboard/setup-registers/doc-types/add" element={<CreateDocTypePage />} />
            <Route path="/dashboard/setup-registers/doc-types/edit/:id" element={<EditDocTypePage />} />

            <Route path="/dashboard/setup-registers/*" element={<PageNotFound />} />
        </Route>
    </>
);
