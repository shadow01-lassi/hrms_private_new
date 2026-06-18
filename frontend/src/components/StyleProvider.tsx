import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { getFromStorage, putIntoStorage } from "@/lib/storage";

interface StyleData {
    BG_COLOR: string;
    TEXT_COLOR: string;
    APP_LOGO: string;
    APP_NAME: string;
    PRIMARY_COLOR: string;
    LIGHT_THEME_COLORS?: Record<string, string>;
    DARK_THEME_COLORS?: Record<string, string>;
}

interface StyleContextType {
    style: StyleData;
    loading: boolean;
    refreshStyle: () => Promise<void>;
}

const defaultStyle: StyleData = {
    BG_COLOR: "#b1c5ff",
    TEXT_COLOR: "#000000",
    APP_LOGO: "/logo.png",
    APP_NAME: "Conversational AI",
    PRIMARY_COLOR: "#1447e6",
};

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [style, setStyle] = useState<StyleData>(defaultStyle);
    const [loading, setLoading] = useState(true);

    const fetchStyle = async () => {
        setLoading(true);
        try {
            // Try to get from storage first for immediate load
            const cachedStyle = getFromStorage("app_style") as StyleData;
            if (cachedStyle && cachedStyle.PRIMARY_COLOR) {
                setStyle(cachedStyle);
            }

            const hostname = window.location.hostname;
            const response = await api.get(`/style?hostname=${hostname}`);

            if (response?.data?.type === "success" && response?.data?.data && response?.data?.data?.PRIMARY_COLOR) {
                const newStyle = response.data.data;
                setStyle(newStyle);
                putIntoStorage("app_style", newStyle);
            }
        } catch (error) {
            console.error("Failed to fetch style, using fallback:", error);
            setStyle(prev => (prev && prev.PRIMARY_COLOR) ? prev : defaultStyle);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStyle();
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        // Create or get dynamic style tag
        const styleId = "dynamic-theme-overrides";
        let styleTag = document.getElementById(styleId) as HTMLStyleElement;
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }

        // Build CSS
        let css = ":root {\n";
        // Base branding variables
        css += `  --app-bg-sidebar: ${style.BG_COLOR};\n`;
        css += `  --app-text: ${style.TEXT_COLOR};\n`;
        css += `  --app-primary: ${style.PRIMARY_COLOR};\n`;

        // Default sidebar values (branding)
        css += `  --sidebar: ${style.BG_COLOR};\n`;
        css += `  --sidebar-foreground: ${style.TEXT_COLOR};\n`;
        css += `  --sidebar-border: ${style.BG_COLOR};\n`;

        // Apply Light Theme Overrides
        if (style.LIGHT_THEME_COLORS) {
            Object.entries(style.LIGHT_THEME_COLORS).forEach(([key, value]) => {
                css += `  --${key}: ${value};\n`;
            });
        }
        css += "}\n\n";

        // Apply Dark Theme Overrides
        if (style.DARK_THEME_COLORS) {
            css += ".dark {\n";
            Object.entries(style.DARK_THEME_COLORS).forEach(([key, value]) => {
                css += `  --${key}: ${value};\n`;
            });
            css += "}\n";
        }

        styleTag.textContent = css;

        // Clear previous root style properties to allow stylesheet to take precedence
        const propsToClear = [
            "--app-bg-sidebar", "--app-text", "--app-primary",
            "--sidebar", "--sidebar-foreground", "--sidebar-border"
        ];
        if (style.LIGHT_THEME_COLORS) {
            propsToClear.push(...Object.keys(style.LIGHT_THEME_COLORS));
        }
        propsToClear.forEach(prop => {
            const propName = prop.startsWith("--") ? prop : `--${prop}`;
            root.style.removeProperty(propName);
        });

        // Update Browser Tab Title
        if (style.APP_NAME) {
            document.title = `${style.APP_NAME} - Society App`;
        }

        // Update Favicon with white circle background
        if (style.APP_LOGO) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const size = 64; // Higher resolution for better quality
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    // Draw white circle background
                    ctx.beginPath();
                    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fill();

                    // Calculate aspect ratio to prevent stretching
                    const padding = size * 0.15;
                    const maxLogoSize = size - (padding * 2);
                    const imgRatio = img.width / img.height;

                    let drawWidth, drawHeight;
                    if (img.width > img.height) {
                        drawWidth = maxLogoSize;
                        drawHeight = maxLogoSize / imgRatio;
                    } else {
                        drawHeight = maxLogoSize;
                        drawWidth = maxLogoSize * imgRatio;
                    }

                    const x = (size - drawWidth) / 2;
                    const y = (size - drawHeight) / 2;

                    ctx.drawImage(img, x, y, drawWidth, drawHeight);

                    const faviconUrl = canvas.toDataURL("image/png");

                    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                    if (link) {
                        link.href = faviconUrl;
                    } else {
                        const newLink = document.createElement("link");
                        newLink.rel = "icon";
                        newLink.href = faviconUrl;
                        document.head.appendChild(newLink);
                    }
                }
            };
            img.src = style.APP_LOGO;
        }
    }, [style]);

    return (
        <StyleContext.Provider value={{ style, loading, refreshStyle: fetchStyle }}>
            {children}
        </StyleContext.Provider>
    );
};

export const useStyle = () => {
    const context = useContext(StyleContext);
    if (!context) {
        throw new Error("useStyle must be used within a StyleProvider");
    }
    return context;
};
