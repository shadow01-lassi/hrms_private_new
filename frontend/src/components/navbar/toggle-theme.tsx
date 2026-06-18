"use client"

// importing from next
import { useTheme } from "@/components/theme-provider";

// importing shadcn components
import { getFromStorage, putIntoStorage } from "@/lib/storage";

// importing icons
import {
    Moon,
    Sun
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button";

export function ModeToggle() {
    const { theme, setTheme } = useTheme();

    // Function to get theme from storage safely
    const getStoredTheme = () => {
        try {
            const temp = getFromStorage("notificationAccess") as string;
            if (temp) {
                const settingData = JSON.parse(temp);
                return settingData?.us_theme;
            }
        } catch (error) {
            console.error("Error parsing theme from storage:", error);
        }
        return null;
    };

    // Function to update theme in storage
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

    // Initialize theme from storage on component mount
    useEffect(() => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, [setTheme]);

    // Function to toggle theme
    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        updateStoredTheme(newTheme);
    };

    return (
        <Button
            size="sm"
            variant="ghost"
            onClick={toggleTheme}
        >
            {theme === "light" ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    )
}