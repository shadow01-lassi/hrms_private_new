import React, { useState, useEffect } from "react";
import { getStyle } from "@/lib/utils";

export const SplashScreen: React.FC<{ message?: string }> = ({ message = "Initializing Secure Storage..." }) => {
    const style = getStyle();
    const [Lottie, setLottie] = useState<any>(null);
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        // Dynamically import lottie-react and the loading animation JSON
        // to keep the initial bundle as minimal as possible.
        Promise.all([
            import("lottie-react"),
            fetch("/loading.json").then((res) => res.json())
        ]).then(([lottieModule, animData]) => {
            setLottie(() => lottieModule.default);
            setAnimationData(animData);
        }).catch((err) => {
            console.error("Failed to load Lottie animation dynamically:", err);
        });
    }, []);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-9999">
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                {style.APP_LOGO && (
                    <img
                        src={style.APP_LOGO}
                        alt={style.APP_NAME}
                        className="w-32 h-32 object-contain mb-8"
                    />
                )}
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
                    {style.APP_NAME}
                </h1>
                <div className="w-48 h-48 flex items-center justify-center">
                    {Lottie && animationData ? (
                        <Lottie animationData={animationData} loop={true} autoplay={true} />
                    ) : (
                        // Premium CSS-based spinner placeholder
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    )}
                </div>
            </div>
            <div className="absolute bottom-10 text-gray-400 text-sm font-medium animate-pulse">
                {message}
            </div>
        </div>
    );
};
