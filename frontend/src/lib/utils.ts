// importing client
import api from "./api";
import slugify from "slugify";
import { WHATSAPP_BACKEND_URL } from "./constants";
import { toast } from "sonner";
import { isValid } from "date-fns";

// importing utils
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getFromStorage, putIntoStorage } from "./storage";
/**
 * Generates a clean URL slug from a string.
 */
export function generateSlug(text: string): string {
    if (!text) return "";
    return slugify(text, {
        lower: true,
        strict: true,
        trim: true,
    });
}

export { isMac } from "./env";
import { isMac } from "./env";

export function getStyle() {
    const cachedStyle = getFromStorage("app_style") as {
        BG_COLOR: string;
        TEXT_COLOR: string;
        APP_LOGO: string;
        APP_NAME: string;
    };

    if (cachedStyle) {
        return cachedStyle;
    }

    return {
        BG_COLOR: "#b1c5ff",
        TEXT_COLOR: "#000000",
        APP_LOGO: "/logo.png",
        APP_NAME: "Conversational AI",
    };
}

export const getModifierKey = () => {
    return isMac() ? '⌘' : 'Alt';
};

export const checkModifierKey = (event: KeyboardEvent) => {
    return isMac()
        ? (event.metaKey || event.altKey) // Command or Option on Mac
        : event.altKey; // Alt on Windows/Linux
};

export const getSearchParams = () => {
    if (typeof window !== 'undefined') {
        return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function fallback(name: string | null | undefined): string {
    if (!name || name.length === 0) return "";
    const nameArr = name.trim().split(" ");
    let fallBackName = "";
    nameArr.forEach((nameEl) => {
        if (nameEl && nameEl[0]) {
            fallBackName += nameEl[0].toUpperCase();
        }
    });
    return fallBackName;
}

export function customReplaceAll(str: string, search: string, replacement: string): string {
    if (search === "") return str; // prevent infinite loop
    return str.split(search).join(replacement);
}

export function getLabelFromName(name: string): string {
    const label = customReplaceAll(name, "-", " ");
    const finalLabel = label.replace(/_/g, " ");
    return finalLabel;
}

export function isUTC(dateString: string): boolean {
    return dateString.endsWith('Z');
}

// Check if a date string is in IST format (has +05:30)
export function isIST(dateString: string): boolean {
    return dateString.includes('+05:30');
}

export function normalizeToIST(dateString: string | null): Date | null {
    if (!dateString) return null;

    try {
        if (isUTC(dateString)) {
            // UTC date - add 5:30 to convert to IST
            const date = new Date(dateString);
            date.setHours(date.getHours() + 5);
            date.setMinutes(date.getMinutes() + 30);
            return date;
        } else if (isIST(dateString)) {
            // Already in IST - parse directly
            return new Date(dateString);
        } else {
            // No timezone specified - assume it's already in local (IST) time
            return new Date(dateString);
        }
    } catch (e) {
        console.error('Error parsing date:', dateString, e);
        return null;
    }
}

import { CompanyMasterShortType, FinYearType, SessionUserType, OnboardingUserType, type MenuItemType } from "./types";

export function nestMenuData(menuData: MenuItemType[]): MenuItemType[] {
    // Create a map to hold the items by their `mm_id`
    const menuMap: Record<number, MenuItemType> = {};

    // Initialize all menu items in the map
    menuData?.forEach((item) => {
        menuMap[item.mm_id] = { ...item, children: [] };
    });

    // Build the nested structure
    const nestedMenu: MenuItemType[] = [];
    menuData?.forEach((item) => {
        if (item.mm_parent_id === null) {
            // If it's a top-level item, add it to the root array
            nestedMenu.push(menuMap[item.mm_id]);
        } else {
            // If it's a child, add it to the parent's children array
            const parent = menuMap[item.mm_parent_id];
            if (parent) {
                parent.children?.push(menuMap[item.mm_id]);
            }
        }
    });

    return nestedMenu;
}

export function handleClick() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
};

export function openHelpDialog(labelOrKey: string, options?: { title?: string }) {
    window.dispatchEvent(
        new CustomEvent("open-help-dialog", {
            detail: { labelOrKey, title: options?.title },
        })
    );
}

export async function getCRUDInfoForThePage(mm_id: number) {
    const response = await api.get(`/role-access/${mm_id}`);
    console.log(response.data.data);
    if (response.data.type === "success") {
        return response.data.data[0];
    } else {
        return null;
    }
}

export const sendQueueMessage = () => {
    const data = JSON.parse(localStorage.getItem("message-queue") || '[]')

    if (!data || data.length === 0) {
        return
    }
    api.post(`${WHATSAPP_BACKEND_URL}/templates/queue`, { id: "jak-id", data })
        .then(() => {
            localStorage.setItem("message-queue", '[]')
            toast.success("Stored messages has been sent")
        })
}

export const isClientReady = async (id: string): Promise<boolean> => {
    api.defaults.withCredentials = true;
    const res = await api.post(`${WHATSAPP_BACKEND_URL}/client-operations/is-ready`, { id })

    if (res.data.valid) {
        return true
    }
    return false;
};


export const getAuthToken = async () => {
    try {
        const session = await getFromStorage("session") as string;

        if (!session) return { token: null, payload: null };

        // Use the JWT decode function from previous answer
        const payload: SessionUserType | null = decodeJWT(session);
        return { token: session, payload };
    } catch (error) {
        console.error('Error getting auth token:', error);
        return { token: null, payload: null };
    }
};

export const getOnboardingToken = async () => {
    try {
        const session = (await getFromStorage("onboarding_session")) as string;

        if (!session) return { token: null, payload: null };

        const payload: OnboardingUserType | null = decodeJWT(session) as any;
        return { token: session, payload };
    } catch (error) {
        console.error('Error getting onboarding token:', error);
        return { token: null, payload: null };
    }
};

/**
 * Decodes a JWT token and returns its payload
 * @param {string} token - The JWT token to decode
 * @returns {object | null} - The decoded payload or null if token is invalid
 */
export const decodeJWT = (token: string): SessionUserType | null => {
    try {
        // Check if token exists and has the correct structure
        if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
            return null;
        }

        // Extract the payload part (middle part between the dots)
        const base64Url = token.split('.')[1];

        // Replace URL-safe characters and add padding if needed
        const base64 = base64Url
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Decode the Base64 string
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        // Parse and return the JSON payload
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

export function AltAFunction(callback: () => void) {
    const handleKeyDown = (e: KeyboardEvent) => {
        const hasModifier = e.altKey || (isMac() && e.metaKey);
        const isAKey = e.code === "KeyA" || e.key.toLowerCase() === "a" || e.key === "å";

        if (hasModifier && isAKey) {
            e.preventDefault();
            callback();
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
}

export function formatDate(inputDate: Date) {
    const date = inputDate.getDate();
    const month = inputDate.getMonth() + 1;
    const year = inputDate.getFullYear();

    const newDate = date.toString().padStart(2, '0');
    const newMonth = month.toString().padStart(2, '0');

    return `${year}-${newMonth}-${newDate}`;
}

export function formatDateReverse(inputDate: Date) {
    const date = inputDate.getDate();
    const month = inputDate.getMonth() + 1;
    const year = inputDate.getFullYear();

    const newDate = date.toString().padStart(2, '0');
    const newMonth = month.toString().padStart(2, '0');

    return `${newDate}-${newMonth}-${year}`;
}

export const getDateFromUrl = () => {
    const params = getSearchParams();
    const dateParam = params.get("date");
    if (dateParam && isValid(new Date(dateParam))) {
        return new Date(dateParam);
    }
    return new Date();
}

export async function getAndSetCompanies() {
    // getting from local storage first
    const companies = await getFromStorage("companies") as CompanyMasterShortType[];
    if (companies) {
        return companies;
    } else {
        try {
            const results = await api.get(`/master/company-master/all`, {
                params: { activeOnly: true },
            });
            if (results.data.type === "success") {
                const companies: CompanyMasterShortType[] = results.data.data;
                putIntoStorage("companies", companies);
                return companies;
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }
    return [];
}

export async function getAndSetSidebar() {
    try {
        const response = await api.get(`/sidebar`);
        if (response.data.type === "success") {
            const sidebarData = response.data.data;
            if (sidebarData.length > 0) {
                putIntoStorage("sidebar", { data: sidebarData });
                return sidebarData;
            }
        }
    } catch (error) {
        console.error("Failed to fetch sidebar:", error);
    }
    return [];
}

export async function getAndSetFinYear() {
    try {
        const results = await api.get(`/accounts/fin-year`, {
            params: { activeOnly: true },
        });
        if (results.data.type === "success") {
            putIntoStorage("finYears", results.data.data);
            putIntoStorage("selectedFinYear", results.data.data[0]);
            putIntoStorage("fy", results.data.data[0].fy_code);
            return results.data.data;
        }
    } catch (error: any) {
        console.warn("Fin Year endpoint not found or failed, using local fallback:", error.message);
        const mockFinYears = [{ fy_id: 1, fy_code: "2025-2026", fy_start_date: "2025-04-01", fy_end_date: "2026-03-31", fy_remarks: "Mock Fin Year" }];
        putIntoStorage("finYears", mockFinYears);
        putIntoStorage("selectedFinYear", mockFinYears[0]);
        putIntoStorage("fy", mockFinYears[0].fy_code);
        return mockFinYears;
    }
}

export async function getFinYears() {
    // getting from local storage first
    const finYears = await getFromStorage("finYears") as FinYearType[];
    if (finYears) {
        return finYears;
    } else {
        try {
            const results = await api.get(`/accounts/fin-year`);
            if (results.data.type === "success") {
                const finYears: FinYearType[] = results.data.data;
                putIntoStorage("finYears", finYears);
                return finYears;
            }
        } catch (error: any) {
            console.warn("Fin Year endpoint not found or failed in getFinYears, using local fallback:", error.message);
            const mockFinYears = [{ fy_id: 1, fy_code: "2025-2026", fy_start_date: "2025-04-01", fy_end_date: "2026-03-31", fy_remarks: "Mock Fin Year" }];
            putIntoStorage("finYears", mockFinYears);
            return mockFinYears;
        }
    }
    return [];
}

export function calculateTotal(formType: string, rows: { account: string; paymentType?: string; paymentDetail: string; amount: number | string; drCr: string; naration: string; }[]) {
    let rowsTotal: number = 0;
    switch (formType.toUpperCase()) {
        case "BR": {
            const total = rows.length > 0 ? rows.reduce((sum, row) => {
                const amount = Number(row.amount);
                return row.drCr === 'CR' ? sum + amount : sum - amount;
            }, 0) : 0;
            rowsTotal = total;
            break;
        }
        case "BP": {
            const bptotal = rows.length > 0 ? rows.reduce((sum, row) => {
                const amount = Number(row.amount);
                return row.drCr === 'CR' ? sum - amount : sum + amount;
            }, 0) : 0;
            rowsTotal = bptotal;
            break;
        }
        case "DN": {
            const dntotal = rows.length > 0 ? rows.reduce((sum, row) => {
                const amount = Number(row.amount);
                return sum + amount;
            }, 0) : 0;
            rowsTotal = dntotal;
            break;
        }
        case "CN": {
            const cntotal = rows.length > 0 ? rows.reduce((sum, row) => {
                const amount = Number(row.amount);
                return sum + amount;
            }, 0) : 0;
            rowsTotal = cntotal;
            break;
        }

        default:
            break;
    }
    return rowsTotal;
}

export function calculateJVTotal(rows: { account: string; paymentType: string; paymentDetail: string; debit: number; credit: number; naration: string; }[]) {
    let drTotal = 0;
    let crTotal = 0;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        drTotal += Number(row.debit);
        crTotal += Number(row.credit);
    }
    return { drTotal, crTotal };
}

export function uppercaseStringValues(obj: Record<string, string | number | Date | boolean>) {
    const result: Record<string, string | number | Date | boolean> = {};

    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            result[key] = obj[key]?.toUpperCase();
        } else {
            result[key] = obj[key]; // Keep non-string values as-is
        }
    }

    return result;
}

/**
 * Checks if the browser's date format is in a standard order (DD-MM-YYYY or YYYY-MM-DD).
 * Returns false if it's in a confusing order like MM-DD-YYYY.
 */
export function isStandardDateFormat() {
    try {
        const parts = new Intl.DateTimeFormat().formatToParts(new Date());
        const order = parts
            .filter(p => ["day", "month", "year"].includes(p.type))
            .map(p => p.type);

        // Check for DD-MM-YYYY (Standard/Indian) or YYYY-MM-DD (ISO/Standard)
        const isDMY = order[0] === "day" && order[1] === "month" && order[2] === "year";
        const isYMD = order[0] === "year" && order[1] === "month" && order[2] === "day";

        return isDMY || isYMD;
    } catch (e) {
        return true; // Fallback to true if check fails
    }
}

export function tablePrintHeader() {
    const selectedCompany = getFromStorage("selectedCompany") as CompanyMasterShortType | null;
    if (!selectedCompany) return "";

    const style = getStyle();

    return `
        <div style="text-align: center; margin-bottom: 12px; border-bottom: 1px solid #333; padding-bottom: 8px; font-family: Arial, sans-serif;">
            ${style.APP_LOGO ? `<img src="${style.APP_LOGO}" alt="${style.APP_NAME}" style="height: 60px; margin-bottom: 5px; object-fit: contain;" />` : ''}
            <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 3px 0; text-transform: uppercase;">${style.APP_NAME}</h1>
            <p style="font-size: 11px; margin: 0 0 2px 0;">${(selectedCompany.cm_address && selectedCompany.cm_address.length > 0) ? selectedCompany.cm_address : ''}</p>
            ${selectedCompany.cm_mobile ? `<p style="font-size: 11px; margin: 0;"><strong>Mobile:</strong> ${selectedCompany.cm_mobile}</p>` : ''}
        </div>
    `;
}

/**
 * Converts a number to its word representation.
 * Supports both Indian (Lakh/Crore) and International (Million/Billion) systems.
 */
export function numberToWords(
    num: number,
    options: {
        type?: "indian" | "international";
        currency?: boolean;
        rupeesOnly?: boolean;
    } = {}
): string {
    const { type = "indian", currency = false } = options;
    const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teenDigits = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const doubleDigits = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (num === 0) return currency ? "Zero Rupees Only" : "Zero";

    const formatHundreds = (n: number) => {
        let str = "";
        if (n > 99) {
            str += singleDigits[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n > 9 && n < 20) {
            str += teenDigits[n - 10];
        } else {
            str += doubleDigits[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + singleDigits[n % 10] : "");
        }
        return str.trim();
    };

    let result = "";
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    if (type === "indian") {
        const units = ["", "Thousand", "Lakh", "Crore"];
        let n = integerPart;

        if (n % 1000 !== 0) {
            result = formatHundreds(n % 1000);
        }
        n = Math.floor(n / 1000);
        let unitIdx = 1;

        while (n > 0) {
            const part = n % 100;
            if (part !== 0) {
                result = formatHundreds(part) + " " + units[unitIdx] + (result ? " " + result : "");
            }
            n = Math.floor(n / 100);
            unitIdx++;
            if (unitIdx > 3) unitIdx = 3;
        }
    } else {
        const units = ["", "Thousand", "Million", "Billion", "Trillion"];
        let n = integerPart;
        let unitIdx = 0;

        while (n > 0) {
            const part = n % 1000;
            if (part !== 0) {
                result = formatHundreds(part) + " " + units[unitIdx] + (result ? " " + result : "");
            }
            n = Math.floor(n / 1000);
            unitIdx++;
        }
    }

    result = result.trim();

    if (currency) {
        if (type === "indian") {
            result = result + " Rupees";
            if (decimalPart > 0) {
                result += " and " + formatHundreds(decimalPart) + " Paise";
            }
        } else {
            result = "Dollars " + result;
            if (decimalPart > 0) {
                result += " and " + formatHundreds(decimalPart) + " Cents";
            }
        }
        result += " Only";
    } else if (decimalPart > 0) {
        result += " point " + formatHundreds(decimalPart);
    }

    return result;
}