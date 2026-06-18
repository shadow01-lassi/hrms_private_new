import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type BannerType = "info" | "warning" | "error" | "update" | "success";

export interface BannerOptions {
    id: string;
    title: string;
    type?: BannerType;
    actionText?: string;
    onAction?: () => void;
    isPersistent?: boolean;
    duration?: number; // Duration in ms before auto-hiding if not persistent
}

interface BannerContextType {
    currentBanner: BannerOptions | null;
    showBanner: (options: Omit<BannerOptions, "id">) => void;
    hideBanner: () => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentBanner, setCurrentBanner] = useState<BannerOptions | null>(null);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const hideBanner = useCallback(() => {
        setCurrentBanner(null);
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
    }, [timeoutId]);

    const showBanner = useCallback((options: Omit<BannerOptions, "id">) => {
        const id = Date.now().toString();
        const banner: BannerOptions = {
            id,
            type: "info", // Default type
            isPersistent: false,
            duration: 5000, // Default duration 5 seconds
            ...options
        };

        setCurrentBanner(banner);

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (!banner.isPersistent && banner.duration) {
            const newTimeoutId = setTimeout(() => {
                setCurrentBanner((current) => {
                    if (current?.id === id) {
                        return null;
                    }
                    return current;
                });
            }, banner.duration);
            setTimeoutId(newTimeoutId);
        }
    }, [timeoutId]);

    return (
        <BannerContext.Provider value={{ currentBanner, showBanner, hideBanner }}>
            {children}
        </BannerContext.Provider>
    );
};

export const useBanner = () => {
    const context = useContext(BannerContext);
    if (context === undefined) {
        throw new Error("useBanner must be used within a BannerProvider");
    }
    return context;
};
