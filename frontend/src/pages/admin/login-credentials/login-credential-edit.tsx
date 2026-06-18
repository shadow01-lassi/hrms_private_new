import { useNavigate } from "react-router-dom";
import { LoginCredentialForm, LoginCredentialFormValues } from "./login-credential-form";
import api from "@/lib/api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSearchParams } from "@/lib/utils";

export default function LoginCredentialEdit() {
    const navigate = useNavigate();
    const params = getSearchParams();
    const id = params.get("id");
    const [fetching, setFetching] = useState(true);
    const [userData, setUserData] = useState<Partial<LoginCredentialFormValues> | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const selectedCompanyString = localStorage.getItem("selectedCompany");
                if (!selectedCompanyString) return;
                const selectedCompany = JSON.parse(selectedCompanyString);

                const response = await api.get(`/user/login-credentials/${id}`, {
                    params: { companyId: selectedCompany.cm_id }
                });

                if (response.data.type === "success") {
                    const user = response.data.data;
                    setUserData({
                        ul_username: user.ul_username,
                        ul_name: user.ul_name,
                        ul_email: user.ul_email,
                        ul_mobile: user.ul_mobile,
                        ul_access_type: user.ul_access_type,
                        ul_role: user.ul_role,
                        ul_flat_no: user.ul_flat_no || "",
                        ul_designation: user.ul_designation || "",
                        ul_cm_access: user.ul_cm_access || [],
                    });
                } else {
                    toast.error("Failed to fetch user details");
                    navigate("/dashboard/admin-tools/login-credentials");
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred fetching user");
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id, navigate]);

    if (fetching) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-[400px] w-full max-w-3xl rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="sub-heading">Edit Login Credential</h1>
                    <p className="para">Modify user details.</p>
                </div>
            </div>

            <div className="bg-background border rounded-lg p-6 max-w-3xl">
                {userData && (
                    <LoginCredentialForm
                        defaultValues={userData}
                        mode="edit"
                        ul_id={Number(id)}
                    />
                )}
            </div>
        </div>
    );
}
