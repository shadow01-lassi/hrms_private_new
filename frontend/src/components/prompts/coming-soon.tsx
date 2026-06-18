// importing from react-router-dom
import { useNavigate } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import { COMING_SOON_IMAGE } from "@/lib/constants";

// importing icons
import { ChevronRight } from "lucide-react";

export function ComingSoon() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // 👈 go back one step in history
    };

    return (
        <div className="h-[70vh] flex flex-col justify-center items-center text-center">
            <img
                src={COMING_SOON_IMAGE}
                alt={`${COMING_SOON_IMAGE}`}
                className="w-[150px]"
            />

            <h3 className="mt-3 text-lg font-semibold mx-12">
                {`We're working on it. You'll be able to see this very soon!`}
            </h3>
            <Button className="mt-6 cursor-pointer" variant={"outline"} onClick={handleGoBack}>
                Go Back
                <ChevronRight />
            </Button>
        </div>
    );
}