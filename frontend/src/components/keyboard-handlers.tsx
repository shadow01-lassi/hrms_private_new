import { useEffect } from "react";
import { logout } from "@/lib/authentication";
import { getFromStorage, putIntoStorage } from "@/lib/storage";
import { LOGOUT_KEY, THEME_TOGGLE_KEYBOARD_KEY, COMPANY_TOGGLE_KEYBOARD_KEY, FIN_YEAR_TOGGLE_KEYBOARD_KEY } from "@/lib/constants";
import { useTheme } from "@/components/theme-provider";

export function KeyboardHandlers() {
    const { theme, setTheme } = useTheme();

    const updateStoredTheme = (newTheme: string) => {
        try {
            const temp = getFromStorage("notificationAccess") as string;
            const settingData = temp ? JSON.parse(temp) : {};
            settingData.us_theme = newTheme;
            putIntoStorage("notificationAccess", JSON.stringify(settingData));
        } catch (error) {
            console.error("Error updating theme in storage:", error);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        updateStoredTheme(newTheme);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const hasModifier = e.altKey;

            if (!hasModifier) return;

            // 1. Theme Toggle Check (Alt/Option + T)
            const isTKey =
                e.code === `Key${THEME_TOGGLE_KEYBOARD_KEY.toUpperCase()}` ||
                e.key?.toLowerCase() === THEME_TOGGLE_KEYBOARD_KEY.toLowerCase() ||
                e.key === "†";

            if (isTKey) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Global Theme Toggle triggered!");
                toggleTheme();
                return;
            }

            // 2. Company Select Toggle (Alt/Option + J)
            const isJKey =
                e.code === `Key${COMPANY_TOGGLE_KEYBOARD_KEY.toUpperCase()}` ||
                e.key?.toLowerCase() === COMPANY_TOGGLE_KEYBOARD_KEY.toLowerCase() ||
                e.key === "∆";

            if (isJKey) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Global Company Select Toggle triggered!");
                window.dispatchEvent(new CustomEvent("toggle-company-select", { bubbles: true, detail: { source: "keyboard" } }));
                document.dispatchEvent(new CustomEvent("toggle-company-select", { bubbles: true, detail: { source: "keyboard" } }));
                return;
            }

            // 3. Fin Year Select Toggle (Alt/Option + F)
            const isFKey =
                e.code === `Key${FIN_YEAR_TOGGLE_KEYBOARD_KEY.toUpperCase()}` ||
                e.key?.toLowerCase() === FIN_YEAR_TOGGLE_KEYBOARD_KEY.toLowerCase() ||
                e.key === "ƒ";

            if (isFKey) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Global Fin Year Toggle triggered!");
                window.dispatchEvent(new CustomEvent("toggle-finyear-select", { bubbles: true, detail: { source: "keyboard" } }));
                document.dispatchEvent(new CustomEvent("toggle-finyear-select", { bubbles: true, detail: { source: "keyboard" } }));
                return;
            }

            // 4. Logout Check (Alt/Option + L)
            const isLKey =
                e.code === `Key${LOGOUT_KEY.toUpperCase()}` ||
                e.key?.toLowerCase() === LOGOUT_KEY.toLowerCase() ||
                e.key === "¬";

            if (isLKey) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Global Logout triggered!");
                if (getFromStorage("session")) {
                    logout();
                }
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, [theme, setTheme]);

    return null;
}