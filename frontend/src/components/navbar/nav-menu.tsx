import { Link } from "react-router-dom";
import { useStyle } from "../StyleProvider";
import { APP_SIDEBAR_PARENT_LINK } from "@/lib/constants";

export function NavMenu() {
    const { style } = useStyle();
    return (
        <>
            <Link to={APP_SIDEBAR_PARENT_LINK} className="flex items-center gap-2">
                <div className="bg-white! rounded-full w-[40px] h-[40px] flex items-center justify-center p-2">
                    <img
                        src={style?.APP_LOGO}
                        alt="nav-logo"
                        className="w-[30px] overflow-hidden"
                    />
                </div>
                <span className="font-bold text-lg">{style?.APP_NAME}</span>
            </Link>
        </>
    );
}