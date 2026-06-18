// importing from react
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// importing components
// import { NavSearch } from "./nav-search";
import { NavLogo } from "./nav-logo";
import { AvatarDropdown } from "./avatar-dropdown";
import { NavLinks } from "./nav-links";
import { NavSheet } from "./nav-sheet";
import { NavButtons } from "./nav-buttons";

export function Navbar({ email, username }: { email: string; username: string; }) {
    const [userEmail, setUserEmail] = useState<string>(email);
    const [userUserName, setUserName] = useState<string>(username);

    useEffect(() => {
        setUserEmail(email);
        setUserName(username);
    }, [email, username]);

    return (
        <header className={`fixed z-50 top-0 left-0 right-0 px-6 py-4 bg-linear-to-r from-accent/40 to-muted/40 backdrop-blur-md`}>
            <div className="max-w-[1400px] mx-auto rounded-full transition-all duration-500 border-2 border-foreground/10">
                <div className="px-5 py-2.5 flex items-center justify-between">
                    {/* Logo - Left side */}
                    <Link to="/" className="flex items-center gap-2">
                        <NavLogo />
                    </Link>

                    {/* Desktop Navigation - Center */}
                    <div className="hidden lg:flex">
                        <NavLinks />
                    </div>

                    {/* Right side - Search and Auth */}
                    <div className="flex items-center gap-2">
                        {/* Auth Section */}
                        {(username.length > 0 && email.length > 0) === true ? (
                            <AvatarDropdown
                                username={userUserName ?? ""}
                                email={userEmail ?? ""}
                                avatar={""}
                            />
                        ) : (
                            <div className="hidden lg:flex items-center gap-2">
                                <NavButtons />
                            </div>
                        )}

                        <NavSheet
                            isLoggedIn={username.length > 0 && email.length > 0}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}