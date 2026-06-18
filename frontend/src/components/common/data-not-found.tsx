import { DATA_NOT_FOUND } from "@/lib/constants";

export function DataNotFoundBanner() {
    return (
        <>
            <div className="w-full flex flex-col items-center justify-center gap-1">
                <img
                    src={DATA_NOT_FOUND}
                    alt="data-not-found"
                    className="w-16 h-16 mx-auto"
                />
                <div className="font-medium">
                    No data found...
                </div>
            </div>
        </>
    );
}