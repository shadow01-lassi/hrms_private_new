// importing styling
import { useStyle } from "../StyleProvider";

export function NavLogo({ logo }: { logo?: string; }) {
    const { style } = useStyle();
    return (
        <>
            <div className="bg-white! rounded-full w-[40px] h-[40px] flex items-center justify-center p-2">
                <img
                    src={style?.APP_LOGO || logo || "/logo.svg"}
                    alt="nav-logo"
                    className="w-[30px] overflow-hidden"
                />
            </div>
        </>
    );
}