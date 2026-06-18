// importing react-router-dom
import { Link } from "react-router-dom";

// importing constants
import { NAV_LINKS } from "@/lib/constants";

export function NavLinks() {
    return (
        <div className={`flex justify-center items-center w-full`}>
            {NAV_LINKS.map((menu) => (
                <Link
                    key={menu.link}
                    to={menu.link}
                    className={`
                        font-black transition-all
                        px-6 py-2.5 rounded-full hover:bg-primary/10 tracking-wide text-foreground hover:text-primary
                    `}
                >
                    {menu.label}
                </Link>
            ))}
        </div>
    )
}
