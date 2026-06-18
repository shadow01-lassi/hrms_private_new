// importing components
import { DocTypeForm } from "./doc-type.form";

export default function CreateDocTypePage() {
    return (
        <>
            <div className="space-y-6">
                <h1 className="heading">
                    Add Document Type
                </h1>

                <DocTypeForm
                    action="add"
                    prepopulatedData={null}
                />
            </div>
        </>
    );
}