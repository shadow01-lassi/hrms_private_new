// importing client
import api from "@/lib/api";

// importing from react
import { useEffect, useState } from "react";

// importing components
import { BillingSetupForm } from "./billing-setup-form";

// importing utilities, types and others
import { AccountMasterDisplayType } from "@/lib/types";
import { BILLING_HEADS } from "@/lib/constants";

// Example usage in a parent component
export default function BillingSetupAddPage() {
    const [accountMaster, setAccountMaster] = useState<AccountMasterDisplayType[]>([]);

    async function fetchAccountMaster() {
        try {
            const response = await api.get(`/transactions/get-accounts`);
            if (response.data.type === "success") {
                const results: AccountMasterDisplayType[] = response.data.data;
                setAccountMaster(results);
            }
            else {
                setAccountMaster([]);
            }
        } catch (error) {
            console.log(error);
            setAccountMaster([]);
        }
    }

    useEffect(() => {
        fetchAccountMaster();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="heading">
                Add Billing Setup
            </h1>

            <BillingSetupForm
                billHeadItems={BILLING_HEADS}
                accountMasterItems={accountMaster}
            />
        </div>
    );
}