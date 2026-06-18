import { PageConfig } from "./types";
import { isMac } from "./env";
import {
    LayoutDashboard,
    ReceiptText,
    CalendarCheck,
    Truck,
    FileArchiveIcon,
    SquarePercent,
    Cog,
    FileInput,
    FolderSymlink,
    CircleParking,
    Building,
} from "lucide-react";

export const AUTH_URL_GOOGLE = import.meta.env?.PROD
    ? (import.meta.env?.VITE_PRODUCTION_AUTH_URL_GOOGLE ?? "https://societyapi.valueye.in/api/auth/google")
    : (import.meta.env?.VITE_AUTH_URL_GOOGLE ?? "http://localhost:5051/api/auth/google");

export const BACKEND_URL = "http://localhost:5056/api";

// WHATSAPP BACKEND URL
export const WHATSAPP_BACKEND_URL = "http://localhost:5000";

export const APP_NAME = "Conversational AI";
export const APP_FULL_NAME = "Apartment Operating System";
export const APP_DESCRIPTION = "The Ultimate Apartment Management App.";
export const OG_APP_LINK = "https://societyadmin.valueye.in";
export const APP_ADDRESS = "1405, Kateeleshwari Aprt, Near Toll Naka, Mulund West, Mumbai, Maharashtra 400080";
export const APP_PHONE_NO = "+91 9321012106";
export const APP_EMAIL = "info@valueye.in";
export const PLAY_STORE_ADMIN = "https://play.google.com/store/app";
export const PLAY_STORE_MEMBER = "https://play.google.com/store/app";
export const APP_STORE_MEMBER = "https://apps.apple.com/app";
export const APP_LOGO = "/public/logo.svg";
export const APP_LOGO_WHITE = "/public/logo-white.svg";
export const APP_ICON = "/public/icon.png";
export const PLACEHOLDER = "/placeholder.png";
export const PLATFORM = "ADMIN_APP";
export const APP_VERSION = "1.0.1";
export const SOCIAL_MEDIA_LINK = "/dashboard/social-media";

export const ERROR_404_IMAGE = "/404.png";
export const NO_ROWS_EXIST = "/no-rows-exist.png";
export const DATA_NOT_FOUND = "/data-not-found.png";
export const COMING_SOON_IMAGE = "/coming-soon.png";
export const LOADING = "/loading.gif";
export const OFFLINE = "/offline.png";
export const NAV_SEARCH_KEYBOARD_KEY = "/";
export const COMPANY_TOGGLE_KEYBOARD_KEY = "j";
export const THEME_TOGGLE_KEYBOARD_KEY = "T";
export const LOGOUT_KEY = "L";
export const FIN_YEAR_TOGGLE_KEYBOARD_KEY = "F";

// ADMIN IMP LINKS
export const REDIRECT_WHEN_JWT_EXPIRED = "/login";
export const REDIRECT_WHEN_JWT_EXISTS = "/dashboard";
export const APP_SIDEBAR_PARENT_LINK = "/dashboard";

// ONBOARD IMP LINKS
export const REDIRECT_WHEN_ONBOARD_JWT_EXPIRED = "/onboard";
export const REDIRECT_WHEN_ONBOARD_JWT_EXISTS = "/onboard/dashboard";
export const ONBOARD_SIDEBAR_PARENT_LINK = "/onboard/dashboard";

export const AUTO_LOGOUT = 1000 * 60 * 45;              // 45 min | For Testing, 1000 * 60 * 1
export const AUTO_LOGOUT_INTIMATION = 1000 * 60 * 30;   // 10 min | For Testing, 1000 * 60 * 0.5
export const AUTO_LOGOUT_COUNTDOWN = 60 * 15;            // 10 min | For Testing, 30
export const WHATSAPP_TEST_MESSAGE_INTERVAL = 1000 * 60 * 5;

export const BRAND_CONFIG = {
    bg_color: "#b1c5ff",
    text_color: "",
    logo: "/public/logo.svg",
};

// Navbar data
export const NAV_LINKS = [
    {
        label: "Home",
        link: "/"
    }, {
        label: "Support",
        link: "/support"
    }, {
        label: "Changelog",
        link: "/changelog"
    }
];

export const PAYMENT_TYPES = [
    "cheque",
    "online",
    "cash"
];

export const DB_NAME = "conversational_ai_db";
export const DB_VERSION = 1;

export const USER_PRIVACY_POLICY = "https://conversational-ai.valueye.in/privacy-policy";
export const USER_TERMS_OF_SERVICE = "https://conversational-ai.valueye.in/terms-of-service";

export const ADMIN_URL = "/dashboard";
export const ADMIN_DASHBOARD = "/dashboard";
export const ADMIN_JOBS = "/dashboard/jobs";
export const ADMIN_JOBS_CREATE = "/dashboard/jobs/create";
export const ADMIN_JOBS_DETAILS = "/dashboard/jobs/";
export const ADMIN_EDIT_BLOG = "/dashboard/jobs/edit_blog";
export const ADMIN_CATEGORIES = "/dashboard/categories";
export const ADMIN_BLOG_REQUESTS = "/dashboard/requests";
export const ADMIN_USERS = "/dashboard/users";

export const TCS_CREDITOR_ACC = 15;

export const HALL_BOOKING_STATUS = [
    { value: "Pending", bgColor: "#ff9800", foregroundColor: "#000000" },
    { value: "Prospective", bgColor: "#c38fed", foregroundColor: "#000000" },
    { value: "Follow Up", bgColor: "#e91e63", foregroundColor: "#ffffff" },
    { value: "Hold", bgColor: "#f8e802", foregroundColor: "#000000" },
    { value: "Closed", bgColor: "#008000", foregroundColor: "#ffffff" },
    { value: "Booked", bgColor: "#16c60c", foregroundColor: "#000000" },
];

export const CONTROL_KEY = isMac() ? "⌘" : "Ctrl";
export const SHIFT_KEY = isMac() ? "⇧" : "Shift";

export const BILLING_HEADS = [
    "GENERAL MAINTENANCE CHARGES",
    "SINKING FUND",
    "BUILDING REPAIR FUND",
    "NON-OCCUPANCY CHARGES",
    "PARKING CHARGES",
    "WATER CHARGES",
    "LATE FEES (INTEREST)",
    "BUILDING PAINT FUND",
    "EDUCATION AND TRAINING FUND",
    "PROPERTY TAX - PARKING AREA",
    "PROPERTY TAX - COMMON AREA",
    "DISPOSAL OF GARBAGE COST",
    "CULTURAL ACTIVITIES",
    "NON-AGRICULTURE TAX",
    "INSURANCE",
    "PLUMBING CHARGES",
    "ELECTRICAL CHARGES",
];

export const BILLING_HEADS_PERC_CALC_OVER = [
    "GENERAL MAINTENANCE CHARGES",
    "GROSS FLAT AREA",
    "NET FLAT AREA",
    "LEDGER OUTSTANDING",
];

export const REQ_DOCUMENTS_STATUS = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "ready", label: "Ready for Pickup" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" }
];

export const REQ_DOCUMENTS_TYPES = [
    "NOC",
    "Maintenance Request",
    "Document Copy",
    "Approval",
    "Other"
];

export const STAFF_MEMBER_TYPES = [
    "Maintenance Team",
    "Security Team",
    "Admin Staff",
    "Plumbing Team",
    "Electrical Team",
    "Cleaning Staff"
];

export const STAFF_TYPES = [
    "DOCTORS",
    "AMBULANCE",
    "HOSPITALS",
    "POLICE",
    "FIRE",
    "SECURITY",
    "CLEANING",
    "GARDENER",
    "ACCOUNTANT",
    "MANAGER",
    "ADMIN",
    "COMMITTEE",
];

export const COMPLAINT_CATEGORIES = [
    "Maintenance",
    "Parking",
    "Security",
    "Noise",
    "Cleanliness",
    "Electrical",
    "Plumbing",
    "Other"
];

export const COMPLAINT_STATUS = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" }
];

export const GROUP_MASTER_COLOR_MAP = [
    { value: "ASSETS", printValue: "ASSETS", bgColor: "#e0ffe4ff", foregroundColor: "#004f19ff" },
    { value: "LIABILITIES", printValue: "LIABILITIES", bgColor: "#ffd3d3ff", foregroundColor: "#ff0000ff" },
    { value: "INCOME", printValue: "INCOME", bgColor: "#daf5ffff", foregroundColor: "#005ab4ff" },
    { value: "EXPENSES", printValue: "EXPENSES", bgColor: "#fff7e6ff", foregroundColor: "#ff8f17ff" },
];

export const WHITE_LIST_TABLES = [
    { table_name: "sub_account_master", print_name: "Sub Account Master" },
    { table_name: "company_flat_owners", print_name: "Member Register" },
    { table_name: "amenity_master", print_name: "Amenities" },
    { table_name: "member_family_details", print_name: "Member Family Details" },
    { table_name: "society_stock", print_name: "Society Stock" },
    { table_name: "booking_master", print_name: "Hall Bookings" },
];

export const CATEGORY_STYLES = [
    { value: "general", printValue: "General", bgColor: "#ff0000", foregroundColor: "#ffffff" },
    { value: "accounts", printValue: "Accounts", bgColor: "#00a6ffff", foregroundColor: "#ffffff" },
    // { value: "security", printValue: "Security", bgColor: "bg-green-600", foregroundColor: "text-white" },
    // { value: "noise", printValue: "Noise", bgColor: "bg-yellow-600", foregroundColor: "text-white" },
    // { value: "cleanliness", printValue: "Cleanliness", bgColor: "bg-purple-600", foregroundColor: "text-white" },
    // { value: "electrical", printValue: "Electrical", bgColor: "bg-pink-600", foregroundColor: "text-white" },
    // { value: "plumbing", printValue: "Plumbing", bgColor: "bg-indigo-600", foregroundColor: "text-white" },
    { value: "other", printValue: "Other", bgColor: "#078a00ff", foregroundColor: "#ffffff" }
];

export const REPORT_ISSUE_CATEGORIES = [
    { value: "general", printValue: "General", bgColor: "#ff0000", foregroundColor: "#ffffff" },
    { value: "accounts", printValue: "Accounts", bgColor: "#00a6ffff", foregroundColor: "#ffffff" },
    { value: "other", printValue: "Other", bgColor: "#078a00ff", foregroundColor: "#ffffff" }
];

export const SETUP_ROUTES = [
    {
        name: "Society Details",
        path: "/society-details",
        icon: Building,
        permission: "setup.society-details.read",
        category: ["billings"],
    },
    {
        name: "Maintenance Setup",
        path: "/maintenance-setup",
        icon: SquarePercent,
        permission: "setup.maintenance.read",
        category: ["billings"],
    },
    {
        name: "Billing Heads",
        path: "/billing-setup",
        icon: ReceiptText,
        permission: "setup.billing-head.read",
        category: ["billings"],
    },
    {
        name: "Parking Charges",
        path: "/parking-setup",
        icon: CircleParking,
        permission: "setup.parking-charges.read",
        category: ["billings"],
    },
    {
        name: "Flat Area Register",
        path: "/flat-area-register",
        icon: LayoutDashboard,
        permission: "setup.flat-area.read",
        category: ["billings", "general"],
    },
    {
        name: "Accounting Setup",
        path: "/accounting-setup",
        icon: Cog,
        permission: "setup.accounting-setup.read",
        category: ["accounts"],
    },
    {
        name: "Bill Posting",
        path: "/bill-posting",
        icon: FileInput,
        permission: "setup.bill-posting.read",
        category: ["accounts"],
    },
    {
        name: "Account Master Linkage",
        path: "/am-linkage",
        icon: FolderSymlink,
        permission: "setup.am-linkage.read",
        category: ["accounts"],
    },
    {
        name: "Booking Purpose",
        path: "/booking-purpose",
        icon: CalendarCheck,
        permission: "setup.booking-purpose.read",
        category: ["amenities"],
    },
    {
        name: "Document Types",
        path: "/doc-types",
        icon: FileArchiveIcon,
        permission: "setup.document-type.read",
        category: ["helpdesk"],
    },
    {
        name: "Vendor Register",
        path: "/vendor-register",
        icon: Truck,
        permission: "setup.vendor.read",
        category: ["helpdesk", "gatekeeper"],
    },
];

export const PAGE_CONFIG: PageConfig[] = [
    { path: "/dashboard", pageId: "1", module: "dashboard", requiredPermission: "READ_DASHBOARD" },
    { path: "/help-desk", pageId: "2", module: "helpdesk", requiredPermission: "READ_HELPDESK" },
    { path: "/accounts", pageId: "3", module: "accounts", requiredPermission: "READ_ACCOUNTS" },
    { path: "/meetings", pageId: "4", module: "announcements", requiredPermission: "READ_MEETINGS" },
    { path: "/billings", pageId: "5", module: "billing", requiredPermission: "READ_BILLING" },
    { path: "/hall-bookings", pageId: "6", module: "hall-booking", requiredPermission: "READ_HALL_BOOKING" },
    { path: "/reports", pageId: "7", module: "reports", requiredPermission: "READ_REPORTS" },
    { path: "/registers", pageId: "8", module: "registers", requiredPermission: "READ_REGISTERS" },
    { path: "/setup-registers", pageId: "9", module: "setup-registers", requiredPermission: "READ_SETUP_REGISTERS" },
    { path: "/admin-tools", pageId: "38", module: "admin", requiredPermission: "READ_ADMIN_TOOLS" },
    { path: "/forum", pageId: "43", module: "forum", requiredPermission: "READ_FORUM" },
    { path: "/integrations", pageId: "44", module: "integrations", requiredPermission: "READ_INTEGRATIONS" },
    { path: "/amenities", pageId: "48", module: "amenities", requiredPermission: "READ_AMENITIES" },

    // 2 = REQUESTS
    { path: "/help-desk/req-doc", pageId: "10", module: "helpdesk", },
    { path: "/help-desk/member-complaints", pageId: "11", module: "helpdesk", },

    // 3 = ACCOUNTS
    { path: "/accounts/bank-cash-entries", pageId: "12", module: "accounts", },
    { path: "/accounts/bank-cash-entries/add", pageId: "12", module: "accounts", subModule: "add" },
    { path: "/accounts/bank-cash-entries/edit", pageId: "12", module: "accounts", subModule: "edit" },

    { path: "/accounts/journal-voucher", pageId: "13", module: "accounts", },
    { path: "/accounts/journal-voucher/add", pageId: "13", module: "accounts", subModule: "add" },
    { path: "/accounts/journal-voucher/edit", pageId: "13", module: "accounts", subModule: "edit" },

    { path: "/accounts/debit-credit-note", pageId: "14", module: "accounts", },
    { path: "/accounts/debit-credit-note/add", pageId: "14", module: "accounts", subModule: "add" },
    { path: "/accounts/debit-credit-note/edit", pageId: "14", module: "accounts", subModule: "edit" },

    { path: "/accounts/ledger", pageId: "15", module: "accounts", subModule: "reports" },
    { path: "/accounts/trial-balance", pageId: "16", module: "accounts", subModule: "reports" },
    { path: "/accounts/balance-sheet", pageId: "17", module: "accounts", subModule: "reports" },
    { path: "/accounts/pnl-statement", pageId: "18", module: "accounts", subModule: "reports" },
    { path: "/accounts/account-master", pageId: "32", module: "accounts", subModule: "setup" },
    { path: "/accounts/sub-account-master", pageId: "33", module: "accounts", subModule: "setup" },
    { path: "/accounts/book-master", pageId: "34", module: "accounts", subModule: "setup" },
    { path: "/accounts/group-master", pageId: "35", module: "accounts", subModule: "setup" },
    { path: "/accounts/bank-reco", pageId: "46", module: "accounts", subModule: "posting" },
    { path: "/accounts/sub-ledger-trial-balance", pageId: "52", module: "accounts", subModule: "reports" },
    { path: "/accounts/fa-posting", pageId: "53", module: "accounts", subModule: "posting" },
    { path: "/accounts/contra-entry", pageId: "54", module: "accounts", subModule: "posting" },

    // 4 = MEETINGS
    { path: "/meetings/notice-board", pageId: "23", module: "announcements", },
    { path: "/meetings/minutes-board", pageId: "24", module: "announcements", },

    // 5 = BILLINGS
    { path: "/billing/create-bills", pageId: "19", module: "billing", },
    { path: "/billing/view-bills", pageId: "20", module: "billing", },
    { path: "/billing/regenerate-bills", pageId: "21", module: "billing", },
    { path: "/billing/maintenance-setup", pageId: "22", module: "billing", },
    { path: "/billing/quaterly-collection", pageId: "47", module: "billing", },
    { path: "/billing/society-expenses", pageId: "51", module: "billing", },
    { path: "/billing/member-payments", pageId: "55", module: "billing", },

    // 6 = HALL BOOKINGS
    { path: "/hall-bookings/booking-requests", pageId: "25", module: "hall-booking", },
    { path: "/hall-bookings/past-bookings", pageId: "26", module: "hall-booking", },
    { path: "/hall-bookings/halls", pageId: "27", module: "hall-booking", },
    { path: "/hall-bookings/upcoming-bookings", pageId: "42", module: "hall-booking", },

    // 8 = REGISTERS
    { path: "/registers/member-register", pageId: "28", module: "registers", },
    { path: "/registers/lein-register", pageId: "29", module: "registers", },
    { path: "/registers/nominee-register", pageId: "30", module: "registers", },
    { path: "/registers/rental-register", pageId: "31", module: "registers", },
    { path: "/registers/important-contacts", pageId: "49", module: "registers", },
    { path: "/registers/family-details", pageId: "50", module: "registers", },

    // 9 = SETUP REGISTERS
    // { path: "/setup-registers/flat-area-register", pageId: "36", module: "setup-registers", },
    // { path: "/setup-registers/parking-register", pageId: "37", module: "setup-registers", },
    // { path: "/setup-registers/billing-setup", pageId: "41", module: "setup-registers", },
    // { path: "/setup-registers/booking-purpose", pageId: "58", module: "setup-registers", },
    // { path: "/setup-registers/vendor-register", pageId: "61", module: "setup-registers", },

    // 48 = AMENITIES
    { path: "/amenities/amenities-list", pageId: "56", module: "amenities", },
    { path: "/amenities/amenities-booking", pageId: "57", module: "amenities", },

    // 38 = ADMIN TOOLS
    { path: "/admin-tools/user-roles", pageId: "39", module: "admin", },
    { path: "/admin-tools/role-access", pageId: "40", module: "admin", },
    { path: "/admin-tools/login-credentials", pageId: "59", module: "admin", },

    // 44 = INTEGRATIONS
    { path: "/integrations/whatsapp-templates", pageId: "45", module: "integrations", },
];

export const SAMPLE_THEMES = [
    {
        "themeName": "Royal Blue (Default SaaS)",
        "description": "Professional, highly trusted corporate blue.",
        "colors": {
            "BG_COLOR": "#0f172a",
            "TEXT_COLOR": "#f8fafc",
            "PRIMARY_COLOR": "#2563eb",
            "theme_background": "#f8fafc",
            "theme_foreground": "#020617",
            "theme_card": "#ffffff",
            "theme_card-foreground": "#020617",
            "theme_popover": "#ffffff",
            "theme_popover-foreground": "#020617",
            "theme_primary": "#2563eb",
            "theme_primary-foreground": "#ffffff",
            "theme_secondary": "#f1f5f9",
            "theme_secondary-foreground": "#010816",
            "theme_muted": "#f1f5f9",
            "theme_muted-foreground": "#64748b",
            "theme_accent": "#eff6ff",
            "theme_accent-foreground": "#010816",
            "theme_destructive": "#dc2626",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#16a34a",
            "theme_border": "#e2e8f0",
            "theme_input": "#e2e8f0",
            "theme_ring": "#94a3b8",
            "theme_sidebar": "#1e293b",
            "theme_sidebar-foreground": "#f8fafc",
            "theme_sidebar-primary": "#2563eb",
            "theme_sidebar-border": "#e2e8f0"
        }
    },
    {
        "themeName": "Forest Green",
        "description": "Calming, eco-friendly, and growth-oriented.",
        "colors": {
            "BG_COLOR": "#14532d",
            "TEXT_COLOR": "#f0fdf4",
            "PRIMARY_COLOR": "#16a34a",
            "theme_background": "#fbfdfc",
            "theme_foreground": "#052e16",
            "theme_card": "#ffffff",
            "theme_card-foreground": "#052e16",
            "theme_popover": "#ffffff",
            "theme_popover-foreground": "#052e16",
            "theme_primary": "#16a34a",
            "theme_primary-foreground": "#ffffff",
            "theme_secondary": "#f0fdf4",
            "theme_secondary-foreground": "#166534",
            "theme_muted": "#f0fdf4",
            "theme_muted-foreground": "#15803d",
            "theme_accent": "#dcfce7",
            "theme_accent-foreground": "#166534",
            "theme_destructive": "#ef4444",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#15803d",
            "theme_border": "#dcfce7",
            "theme_input": "#dcfce7",
            "theme_ring": "#16a34a",
            "theme_sidebar": "#166534",
            "theme_sidebar-foreground": "#f0fdf4",
            "theme_sidebar-primary": "#16a34a",
            "theme_sidebar-border": "#dcfce7"
        }
    },
    {
        "themeName": "Deep Indigo",
        "description": "Modern, sleek, and high-tech.",
        "colors": {
            "BG_COLOR": "#312e81",
            "TEXT_COLOR": "#e0e7ff",
            "PRIMARY_COLOR": "#4f46e5",
            "theme_background": "#f8fafc",
            "theme_foreground": "#1e1b4b",
            "theme_card": "#ffffff",
            "theme_card-foreground": "#1e1b4b",
            "theme_popover": "#ffffff",
            "theme_popover-foreground": "#1e1b4b",
            "theme_primary": "#4f46e5",
            "theme_primary-foreground": "#ffffff",
            "theme_secondary": "#e0e7ff",
            "theme_secondary-foreground": "#3730a3",
            "theme_muted": "#e0e7ff",
            "theme_muted-foreground": "#6366f1",
            "theme_accent": "#e0e7ff",
            "theme_accent-foreground": "#3730a3",
            "theme_destructive": "#f43f5e",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#10b981",
            "theme_border": "#e0e7ff",
            "theme_input": "#e0e7ff",
            "theme_ring": "#4f46e5",
            "theme_sidebar": "#3730a3",
            "theme_sidebar-foreground": "#e0e7ff",
            "theme_sidebar-primary": "#4f46e5",
            "theme_sidebar-border": "#e0e7ff"
        }
    },
    {
        "themeName": "Sunset Ochre",
        "description": "Warm, energetic, and welcoming yellow-orange.",
        "colors": {
            "BG_COLOR": "#78350f",
            "TEXT_COLOR": "#fffbeb",
            "PRIMARY_COLOR": "#d97706",
            "theme_background": "#fffdfa",
            "theme_foreground": "#451a03",
            "theme_card": "#ffffff",
            "theme_card-foreground": "#451a03",
            "theme_popover": "#ffffff",
            "theme_popover-foreground": "#451a03",
            "theme_primary": "#d97706",
            "theme_primary-foreground": "#ffffff",
            "theme_secondary": "#fee2e2",
            "theme_secondary-foreground": "#991b1b",
            "theme_muted": "#fef3c7",
            "theme_muted-foreground": "#b45309",
            "theme_accent": "#fef3c7",
            "theme_accent-foreground": "#451a03",
            "theme_destructive": "#dc2626",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#059669",
            "theme_border": "#fef3c7",
            "theme_input": "#fef3c7",
            "theme_ring": "#d97706",
            "theme_sidebar": "#92400e",
            "theme_sidebar-foreground": "#fffbeb",
            "theme_sidebar-primary": "#d97706",
            "theme_sidebar-border": "#fef3c7"
        }
    },
    {
        "themeName": "Coral Peach",
        "description": "Vibrant, bold, and modern reddish-pink.",
        "colors": {
            "BG_COLOR": "#881337",
            "TEXT_COLOR": "#fff1f2",
            "PRIMARY_COLOR": "#e11d48",
            "theme_background": "#fffcfc",
            "theme_foreground": "#4c0519",
            "theme_card": "#ffffff",
            "theme_card-foreground": "#4c0519",
            "theme_popover": "#ffffff",
            "theme_popover-foreground": "#4c0519",
            "theme_primary": "#e11d48",
            "theme_primary-foreground": "#ffffff",
            "theme_secondary": "#ffe4e6",
            "theme_secondary-foreground": "#9f1239",
            "theme_muted": "#ffe4e6",
            "theme_muted-foreground": "#fb7185",
            "theme_accent": "#ffe4e6",
            "theme_accent-foreground": "#4c0519",
            "theme_destructive": "#be123c",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#16a34a",
            "theme_border": "#ffe4e6",
            "theme_input": "#ffe4e6",
            "theme_ring": "#e11d48",
            "theme_sidebar": "#9f1239",
            "theme_sidebar-foreground": "#fff1f2",
            "theme_sidebar-primary": "#e11d48",
            "theme_sidebar-border": "#ffe4e6"
        }
    },
    {
        "themeName": "Monochrome Slate",
        "description": "Ultra-minimalist black, white, and gray.",
        "colors": {
            "BG_COLOR": "#09090b",
            "TEXT_COLOR": "#fafafa",
            "PRIMARY_COLOR": "#18181b",
            "theme_background": "#fafafa",
            "theme_foreground": "#09090b",
            "theme_card": "#ffffff",
            "theme_card-foreground": "#09090b",
            "theme_popover": "#ffffff",
            "theme_popover-foreground": "#09090b",
            "theme_primary": "#09090b",
            "theme_primary-foreground": "#ffffff",
            "theme_secondary": "#f4f4f5",
            "theme_secondary-foreground": "#18181b",
            "theme_muted": "#f4f4f5",
            "theme_muted-foreground": "#71717a",
            "theme_accent": "#f4f4f5",
            "theme_accent-foreground": "#09090b",
            "theme_destructive": "#ef4444",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#16a34a",
            "theme_border": "#e4e4e7",
            "theme_input": "#e4e4e7",
            "theme_ring": "#18181b",
            "theme_sidebar": "#18181b",
            "theme_sidebar-foreground": "#fafafa",
            "theme_sidebar-primary": "#09090b",
            "theme_sidebar-border": "#e4e4e7"
        }
    }
];

export const DARK_SAMPLE_THEMES = [
    {
        "themeName": "Midnight Neon",
        "description": "True dark mode with vibrant indigo accents.",
        "colors": {
            "BG_COLOR": "#020617",
            "TEXT_COLOR": "#f8fafc",
            "PRIMARY_COLOR": "#6366f1",
            "theme_background": "#020617",
            "theme_foreground": "#f8fafc",
            "theme_card": "#0f172a",
            "theme_card-foreground": "#f8fafc",
            "theme_popover": "#0f172a",
            "theme_popover-foreground": "#f8fafc",
            "theme_primary": "#6366f1",
            "theme_primary-foreground": "#ffffff",
            "theme_secondary": "#1e293b",
            "theme_secondary-foreground": "#f8fafc",
            "theme_muted": "#1e293b",
            "theme_muted-foreground": "#94a3b8",
            "theme_accent": "#1e293b",
            "theme_accent-foreground": "#f8fafc",
            "theme_destructive": "#ef4444",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#22c55e",
            "theme_border": "#1e293b",
            "theme_input": "#1e293b",
            "theme_ring": "#334155",
            "theme_sidebar": "#0f172a",
            "theme_sidebar-foreground": "#f8fafc",
            "theme_sidebar-primary": "#6366f1",
            "theme_sidebar-border": "#1e293b"
        }
    },
    {
        "themeName": "Deep Forest",
        "description": "Organic dark greens and emeralds.",
        "colors": {
            "BG_COLOR": "#052e16",
            "TEXT_COLOR": "#f0fdf4",
            "PRIMARY_COLOR": "#22c55e",
            "theme_background": "#052e16",
            "theme_foreground": "#f0fdf4",
            "theme_card": "#064e3b",
            "theme_card-foreground": "#f0fdf4",
            "theme_popover": "#064e3b",
            "theme_popover-foreground": "#f0fdf4",
            "theme_primary": "#22c55e",
            "theme_primary-foreground": "#ffffff",
            "theme_secondary": "#065f46",
            "theme_secondary-foreground": "#f0fdf4",
            "theme_muted": "#065f46",
            "theme_muted-foreground": "#34d399",
            "theme_accent": "#065f46",
            "theme_accent-foreground": "#f0fdf4",
            "theme_destructive": "#f43f5e",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#10b981",
            "theme_border": "#065f46",
            "theme_input": "#065f46",
            "theme_ring": "#10b981",
            "theme_sidebar": "#064e3b",
            "theme_sidebar-foreground": "#f0fdf4",
            "theme_sidebar-primary": "#22c55e",
            "theme_sidebar-border": "#065f46"
        }
    },
    {
        "themeName": "Obsidian Gold",
        "description": "Luxurious dark slate with amber highlights.",
        "colors": {
            "BG_COLOR": "#0c0a09",
            "TEXT_COLOR": "#fafaf9",
            "PRIMARY_COLOR": "#f59e0b",
            "theme_background": "#0c0a09",
            "theme_foreground": "#fafaf9",
            "theme_card": "#1c1917",
            "theme_card-foreground": "#fafaf9",
            "theme_popover": "#1c1917",
            "theme_popover-foreground": "#fafaf9",
            "theme_primary": "#f59e0b",
            "theme_primary-foreground": "#0c0a09",
            "theme_secondary": "#292524",
            "theme_secondary-foreground": "#fafaf9",
            "theme_muted": "#292524",
            "theme_muted-foreground": "#a8a29e",
            "theme_accent": "#292524",
            "theme_accent-foreground": "#fafaf9",
            "theme_destructive": "#dc2626",
            "theme_destructive-foreground": "#ffffff",
            "theme_success": "#10b981",
            "theme_border": "#292524",
            "theme_input": "#292524",
            "theme_ring": "#f59e0b",
            "theme_sidebar": "#1c1917",
            "theme_sidebar-foreground": "#fafaf9",
            "theme_sidebar-primary": "#f59e0b",
            "theme_sidebar-border": "#292524"
        }
    }
];