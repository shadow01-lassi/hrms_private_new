// importing from react
import { Link } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export function NavButtons() {
    return (
        <>
            <div className="flex gap-2">
                <Button className="rounded-full md:px-6!" asChild>
                    <Link to="/onboard">
                        Onboard
                    </Link>
                </Button>

                <Button variant={"outline"} className="rounded-full md:px-4!" asChild>
                    <Link to="/login">
                        Login <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                    </Link>
                </Button>
            </div>
        </>
    );
}