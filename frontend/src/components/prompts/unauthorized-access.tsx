// importing from react-router-dom
import { useNavigate } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";

export function UnauthorizedAccess() {
    const navigate = useNavigate();

    return (
        <div className="flex justify-center items-center h-full">
            <div className="flex flex-col justify-center items-center text-center space-y-4">
                <h1 className="text-7xl font-bold">
                    404
                </h1>

                <h3 className="sub-heading font-mono">
                    This page does not exist or has been moved.
                </h3>

                <Button
                    className="mt-6"
                    variant="secondary"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </Button>
            </div>
        </div>
    );
}