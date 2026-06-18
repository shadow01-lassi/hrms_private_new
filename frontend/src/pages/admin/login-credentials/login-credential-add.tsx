import { useNavigate } from "react-router-dom";
import { LoginCredentialForm } from "./login-credential-form";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginCredentialAdd() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="sub-heading">Create Login Credential</h1>
                    <p className="para">Add a new user to the system.</p>
                </div>
            </div>

            <div className="bg-background border rounded-lg p-6 max-w-3xl">
                <LoginCredentialForm
                    mode="create"
                />
            </div>
        </div>
    );
}
