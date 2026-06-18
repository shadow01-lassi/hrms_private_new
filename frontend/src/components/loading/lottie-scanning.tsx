import Lottie from "lottie-react";
import scanningAnnimation from "../../../public/scan.json";

export function LottieScanning() {
    return (
        <>
            <div className="flex justify-center w-full items-center h-64 py-10 bg-background/40">
                <Lottie animationData={scanningAnnimation} loop={true} autoplay={true} className="w-60" />
            </div>
        </>
    );
}