// importing shadcn components
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function ErrorOccured() {
    const navigate = useNavigate();
    return (
        <div className="flex justify-center items-center h-full">
            <div className="flex flex-col justify-center items-center text-center space-y-4">
                <h1 className="text-7xl font-bold">
                    501
                </h1>

                <h3 className="sub-heading font-mono">
                    Looks like some error occured while fetching data.
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