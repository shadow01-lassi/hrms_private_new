import { jwtVerify } from "jose";
import { SessionUserType } from "./types";
import { deleteFromStorage, getFromStorage } from "@/lib/storage";
import { REDIRECT_WHEN_JWT_EXPIRED, REDIRECT_WHEN_ONBOARD_JWT_EXPIRED } from "./constants";
import { clearAllStores } from "@/components/native/offlineDB";
import secureLocalStorage from "react-secure-storage";

const secretKey: string = import.meta.env?.VITE_JWT_SECRET as string;
const key = new TextEncoder().encode(secretKey);

export async function logout() {
    localStorage.clear();
    sessionStorage.clear();
    secureLocalStorage.clear();

    await clearAllStores();
    const callback = window.location.href;
    window.location.href = `${REDIRECT_WHEN_JWT_EXPIRED}?callback=${callback}`;
}

export async function onboardlogout() {
    deleteFromStorage("onboarding_session");

    localStorage.clear();
    sessionStorage.clear();
    secureLocalStorage.clear();

    await clearAllStores();
    window.location.href = `${REDIRECT_WHEN_ONBOARD_JWT_EXPIRED}`;
}

export async function decryptSession() {
    try {
        const session: string = getFromStorage("session") as string;
        if (!session || typeof session !== "string" || session.split(".").length !== 3) {
            return null;
        }

        try {
            const result: { payload: SessionUserType } = await jwtVerify(session, key, {
                algorithms: ["HS256"],
            });
            return {
                jwt: session,
                user: result.payload
            };
        } catch (error) {
            console.error("Invalid session token verification failed:", error);
            deleteFromStorage("session");
            return null;
        }
    } catch (error) {
        console.log("Error in authentication :: decryptSession() :: ", error);
        return null;
    }
}

export async function getSession() {
    return await decryptSession();
}