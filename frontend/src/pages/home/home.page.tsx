import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center pt-12 sm:pt-20 pb-16 md:pb-24">
            {/* Clean White Background (Default) */}

            {/* --- MAIN HERO CONTENT --- */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

                {/* Headline - Larger & Centered */}
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-none mb-10 max-w-6xl">
                    Welcome to <br className="hidden md:block" />
                    {APP_NAME}!
                </h1>

                {/* CTAs - Fully Rounded Pill Buttons */}
                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row items-center sm:gap-6 mb-20">
                    <Button
                        size={"lg"}
                        className="h-16 px-6! rounded-full text-base md:text-lg font-bold shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all"
                        asChild
                    >
                        <Link to={"/onboard"}>
                            Onboard <span className="hidden sm:flex">your Company</span>
                        </Link>
                    </Button>

                    <Button
                        variant={"outline"}
                        size={"lg"}
                        className="h-16 px-6! rounded-full text-lg font-bold hover:bg-muted/50 transition-all border-2"
                        asChild
                    >
                        <Link to={`/login`}>
                            Login
                            <ArrowUpRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <>
            <HeroSection />
        </>
    );
}