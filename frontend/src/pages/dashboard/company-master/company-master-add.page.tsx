import { CompanyMasterForm } from "./company-master.form";

export default function CompanyMasterAddPage() {
    return (
        <div className="space-y-6">
            <h1 className="heading">Add Company</h1>
            <CompanyMasterForm action="add" prepopulatedData={null} />
        </div>
    );
}
