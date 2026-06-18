// importing from react-router-dom
import { useNavigate } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import { ERROR_404_IMAGE } from "@/lib/constants";
import { ChevronRight } from "lucide-react";

export function PageNotFound() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // 👈 go back one step in history
    };

    return (
        <div className="h-[60vh] flex flex-col justify-center items-center text-center px-6">
            <img
                src={ERROR_404_IMAGE}
                alt={`${ERROR_404_IMAGE}`}
                className="w-[200px]"
            />

            <h3 className="mt-3 text-lg font-semibold ml-12">
                {`Looks like you've ventured into the unknown digital realm.`}
            </h3>
            <Button className="mt-6 cursor-pointer" variant={"outline"} onClick={handleGoBack}>
                Go Back
                <ChevronRight />
            </Button>
        </div>
    );
}