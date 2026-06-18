import { config } from "dotenv";

config();

export const BACKEND_URL = "http://localhost:5051";
export const APP_NAME = "Conversational AI";
export const APP_DESCRIPTION = "A website for society management";
export const ADDRESS = "Kateeleshwari Apartments, L.B.S. Road, Near Toll Naka, Mulund West, Mumbai - 400080";
export const APP_LOGO = "";
export const WEBSITE_URL = "https://societyadmin.valueye.in";
export const COPYRIGHTS = "Valueye Technologies";

export const MEMBER_APP_FRONTEND_URL = process.env.PROD
    ? (process.env.PRODUCTION_FRONTEND_URL ?? "https://conversational-ai.valueye.in")
    : (process.env.FRONTEND_URL ?? "http://localhost:5174");

export const SELF_MAIL = "info@valueye.in";

export const EMAIL = "info@valueye.in";
export const PHONE = "9321012106";
export const ALTERNATE_PHONE = "9322212106";

// DEFAULT_PASSWORD: aptos@1234
export const DEFAULT_PASSWORD = "$2y$10$gwcsxd4k8B/QvpokkaD6S.yGSHOAp7AGTFV5yib30j2HXd7AKg0j2";

export const CACHE_PREFIX = "society:";

export const PROTECTED_PLATFORMS = [
    "ADMIN_APP",
    "MEMBER_APP",
    "GATE_KEEPER",
];

// Force update versions (Increment these to force clients to refresh)
export const MIN_APP_VERSIONS: Record<string, string> = {
    "ADMIN_APP": "1.0.1",
    "MEMBER_APP": "1.0.1",
    "GATE_KEEPER": "1.0.1",
};

// ===========================================
// SEO PART
// ===========================================

export const CITIES = [
    "mumbai",
    "pune",
    "thane",
    "mulund",
    "bhandup",
    "bandra",
    "bangalore",
    "hyderabad"
];

export const SERVICES = [
    "society-management-software",
    "apartment-management-software",
    "gated-community-app",
    "housing-society-software"
];

export const MODIFIERS = [
    "best",
    "top",
    "affordable"
];