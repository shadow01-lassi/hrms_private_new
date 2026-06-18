import Lottie from "lottie-react";
import loadingAnimation from "../../../public/loading.json";

export function LottieLoading() {
    return (
        <>
            <div className="flex justify-center w-full items-center h-64 py-10 bg-background/40">
                <Lottie animationData={loadingAnimation} loop={true} autoplay={true} className="w-60" />
            </div>
        </>
    );
}