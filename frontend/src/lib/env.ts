export function isMac() {
    return typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};
