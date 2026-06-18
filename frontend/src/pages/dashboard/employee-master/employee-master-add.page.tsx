import { EmployeeMasterForm } from "./employee-master.form";

export default function EmployeeMasterAddPage() {
    return (
        <div className="space-y-6">
            <h1 className="heading">Add Employee</h1>
            <EmployeeMasterForm action="add" prepopulatedData={null} />
        </div>
    );
}
