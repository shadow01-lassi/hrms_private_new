// importing from react
import { useState } from "react";
import { Link } from "react-router-dom";

// importing shadcn components
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetTrigger,
    SheetContent
} from "@/components/ui/sheet";

// importing components
import { NavLogo } from "./nav-logo";

// importing icons
import {
    ArrowUpRight,
    LogOut,
    Menu,
    Rocket,
    X
} from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export function NavSheet({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [open, setOpen] = useState<boolean>(false);
    return (
        <>
            {/* Mobile Menu Button */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="m-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-2rem)] border-none bg-background/60 backdrop-blur-2xl p-0 flex flex-col rounded-4xl overflow-hidden shadow-2xl [&>button:last-child]:hidden">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-center pr-4">
                            <div className="p-8 flex items-center justify-between">
                                <NavLogo />
                            </div>

                            <div className="flex gap-2 items-center">
                                <Button
                                    onClick={() => { setOpen(false); }}
                                    variant={"outline"}
                                    size={"lg"}
                                    className="rounded-full bg-transparent hover:bg-foreground/20 w-10 h-10 border-foreground"
                                >
                                    <X className="text-foreground min-w-4 min-h-4" strokeWidth={3} />
                                </Button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.link}
                                    to={link.link}
                                    className="text-4xl font-black text-foreground hover:text-primary transition-all py-2"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Auth Footer */}
                        <div className="p-6 mt-auto border-t border-muted/20 space-y-4">
                            {isLoggedIn ? (
                                <div className="space-y-2">
                                    <Button variant="ghost" className="w-full justify-start rounded-2xl" asChild>
                                        <Link to="/dashboard">
                                            <Rocket className="mr-3 h-5 w-5" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive" asChild>
                                        <Link to="/logout">
                                            <LogOut className="mr-3 h-5 w-5" />
                                            Log out
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Button
                                        variant="outline"
                                        className="w-full py-7 text-lg font-bold rounded-full shadow-xl active:scale-[0.98] transition-all"
                                        asChild
                                    >
                                        <Link to="/login">
                                            Login
                                            <ArrowUpRight className="w-5 h-5" strokeWidth={3} />
                                        </Link>
                                    </Button>
                                    <Button
                                        className="w-full py-7 text-lg font-bold rounded-full hover:bg-primary/5 active:scale-[0.98] transition-all"
                                        asChild
                                    >
                                        <Link to="/onboard">
                                            Onboard Your Society
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}