# HRMS Frontend Application

This directory contains the client-side Single Page Application (SPA) for the Human Resource Management System. It is built using **React 19**, **Vite 6**, **TypeScript**, and **Tailwind CSS v4**, configured as an offline-first **Progressive Web App (PWA)**.

---

## 🛠️ Tech Stack & Key Libraries

*   **UI Components:** Built on top of **Radix UI** primitives and customized via **shadcn/ui** configurations (`components.json`).
*   **Styling:** Designed with **Tailwind CSS v4** utilizing modern design principles (gradients, dark mode variables, micro-animations, custom themes via `StyleProvider`).
*   **State Management:** Powered by **Zustand** for lightweight, granular, reactive stores, combined with secure, encrypted persistent storage.
*   **Rich Text Engine:** Deep integration of **Tiptap Editor** with multiple custom extensions:
    *   Table layouts (`@tiptap/extension-table`, header, row, cells)
    *   Image resizing (`tiptap-extension-resize-image`)
    *   Search and replace (`@sereneinserenade/tiptap-search-and-replace`)
    *   Character limits, horizontal rules, links, bullet lists, blockquotes, YouTube embeds, and color styling.
*   **Data Visualization:** Custom chart dashboards using **Recharts** and **D3** analytics engines.
*   **Interactive Forms:** Orchestrated by **React Hook Form** with **Zod** schema validations.
*   **PWA Assets & Manifests:** Managed by `vite-plugin-pwa` generating assets, custom prompts for service worker updates (`PwaUpdatePrompt`), and caching controls.

---

## 📂 Directory Map (`/src`)

```
src/
├── components/           # Reusable UI widgets and layout wrappers
│   ├── ProtectiveRoutes/ # Route access controllers (Admin, Public, Onboard)
│   ├── loading/          # SplashScreen and global loading screens
│   ├── ui/               # Radix/shadcn primitive components (dialog, tabs, inputs, table)
│   ├── StyleProvider.tsx # Provider administering dynamic colors and theme styling
│   └── theme-provider.tsx# Light/Dark appearance mode controller
├── contexts/             # Global React context definitions
├── data/                 # Static data sets, configuration defaults, lists
├── hooks/                # Custom React hooks (PWA prompts, event listeners)
├── lib/                  # Fundamental application engines
│   ├── api.ts            # Network client (Axios configuration + encryption interceptors)
│   ├── encryption.ts     # Client-side AES-256-CBC implementation
│   ├── storage.ts        # Storage managers wrapping secure local storage
│   ├── constants.tsx     # Application-wide static settings and links
│   └── utils.ts          # Tailwind merge utilities, date formatters, export wrappers
├── pages/                # Functional modules and screen page groups
│   ├── admin/            # Role masters, permissions forms, changelogs, error logs
│   ├── onboard/          # Onboarding forms, dashboard, register tables
│   ├── billing/          # Payment details and service plan details
│   ├── settings/         # App settings, account settings, appearance
│   └── dashboard/        # Employee profiles, stock registers, reports
└── routes/               # Central router and module sub-routes
```

---

## 🗺️ Application Routing Matrix

All client routes are organized inside [`src/routes/router.tsx`](file:///Users/dhruv/Desktop/hrms/frontend/src/routes/router.tsx) and grouped by target access conditions:

| Route Path | Layout / Wrapper | Target Page / Component | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `PublicRoutes` | `HomePage` | Public marketing/informational portal |
| `/support` | `PublicRoutes` | `SupportPage` | User support request form |
| `/changelog` | `PublicRoutes` | `ChangelogPage` | Public view of recent fixes/updates |
| `/login` | `PublicRoutesForSignIn` | `LoginPage` | Authentication portal (Google OAuth & standard credentials) |
| `/reset-password` | `PublicRoutesForSignIn` | `ForgotPassword` | Password recovery/reset request form |
| `/onboard` | `OnboardRouter` | `OnboardPage` | Initial onboarding workspace entry |
| `/onboard/dashboard`| `OnboardingRoutesLayout`| `OnboardDashboardPage` | Setup interface for new organization onboard |
| `/dashboard` | `AdminProtectedRoutes` | `DashboardPage` | Executive and admin summary panels |
| `/dashboard/profile`| `AdminProtectedRoutes` | `ProfilePage` | User dashboard profile configuration |
| `/dashboard/society-profile` | `AdminProtectedRoutes` | `SocietyProfilePage` | Corporate/Housing Society profile settings |
| `/dashboard/billing-plans` | `AdminProtectedRoutes` | `BillingPage` | Management of current plans and active billing |
| `/dashboard/reports` | `AdminProtectedRoutes` | `Reports` | Main report templates dashboard |
| `/dashboard/reports/execute` | `AdminProtectedRoutes` | `ExecuteReport` | Report filter generation, data display and print layout |
| `/dashboard/admin-tools/user-roles` | `AdminProtectedRoutes` | `UserRolePage` | User roles configuration |
| `/dashboard/admin-tools/user-roles/permissions` | `AdminProtectedRoutes` | `RolePermissionsPage` | Dynamic grid map for assigning rules |
| `/dashboard/registers/login-credentials` | `AdminProtectedRoutes` | `LoginCredentials` | Credential mapping dashboard |
| `/dashboard/admin-tools/change-logs` | `AdminProtectedRoutes` | `ChangeLogsPage` | Add/edit interface for versions and updates |
| `/dashboard/admin-tools/error-logs` | `AdminProtectedRoutes` | `ErrorLogs` | Log viewer for tracking errors caught by the server |
| `/dashboard/admin-tools/menu-structure` | `AdminProtectedRoutes` | `MenuStructurePage` | Visual control dashboard for navigation menu |
| `/dashboard/settings` | `SettingsLayout` | `AppearanceSettingsPage` | Layout context for settings, default to appearance |
| `/dashboard/setup-registers/doc-types` | `SetupRegisterLayout` | `DocTypePage` | Document types lists and uploads configuration |
| `/dashboard/registers/stock-register` | `AdminProtectedRoutes` | `StockRegister` | Registry managing inventory and company stock |

---

## 🔒 Crypto, Storage & Axios Interceptors

### 1. Request/Response Encryption
Axios instances configured in [`src/lib/api.ts`](file:///Users/dhruv/Desktop/hrms/frontend/src/lib/api.ts) intercept every request before transmission.
*   **Outbound Interception:** If communicating with a protected platform client, the request interceptor serializes `req.body`, runs `encrypt()` from [`src/lib/encryption.ts`](file:///Users/dhruv/Desktop/hrms/frontend/src/lib/encryption.ts), outputs the hex container, sets the `x-encrypted: "true"` header, and replaces the request body with `{"data": "<iv>:<ciphertext>"}`.
*   **Inbound Interception:** When responses from the API arrive with the `x-encrypted: "true"` header, the client interceptor extracts the encrypted body data, decrypts it using the local key, and parses the plain text JSON, returning the final decoded payload to the component caller.

### 2. Secure Persistent Storage
To prevent plain text tokens and session leaks on local devices:
*   We use `react-secure-storage` configured in [`src/lib/storage.ts`](file:///Users/dhruv/Desktop/hrms/frontend/src/lib/storage.ts).
*   Storage items are signed and hashed locally using configuration keys (`VITE_SECURE_LOCAL_STORAGE_HASH_KEY` and prefix `VITE_SECURE_LOCAL_STORAGE_PREFIX`).
*   State-saving operations in Zustand stores are automatically routed through these secure getters/setters.

---

## 📱 PWA & Offline Support

*   **Service Worker:** Handled via [`src/sw.ts`](file:///Users/dhruv/Desktop/hrms/frontend/src/sw.ts) utilizing Google's Workbox library.
*   **Asset Cache:** Caches routing assets, fonts, stylesheets, and images locally for smooth navigation during offline states.
*   **Offline Queue:** Managed by [`src/lib/offline-queue.ts`](file:///Users/dhruv/Desktop/hrms/frontend/src/lib/offline-queue.ts) and [`src/lib/offline-store.ts`](file:///Users/dhruv/Desktop/hrms/frontend/src/lib/offline-store.ts). Network requests made offline are stored securely and synchronized when network connectivity is restored.

---

## ⚙️ Development & Environment Setup

Copy `.env` file from options, or create a `.env` in the `/frontend` directory:

```env
# Encryption keys (Must match backend)
VITE_JWT_SECRET="your_jwt_signing_secret_here"
VITE_ENCRYPTION_SECRET_KEY="32_character_aes_secret_key_here"

# API Route parameters
VITE_BACKEND_URL="http://localhost:5056/api"
VITE_PRODUCTION_BACKEND_URL="https://yourdomain-api.com/api"
VITE_WHATSAPP_BACKEND_URL="http://localhost:5056/api"

# Google Auth Redirect configurations
VITE_AUTH_URL_GOOGLE="http://localhost:5056/api/auth/google"
VITE_PRODUCTION_AUTH_URL_GOOGLE="https://yourdomain-api.com/api/auth/google"

# Storage configurations
VITE_SECURE_LOCAL_STORAGE_HASH_KEY="secure_hash_string"
VITE_SECURE_LOCAL_STORAGE_PREFIX="app_storage_prefix"
```

### CLI Command List

```bash
# Install package dependencies
npm install

# Start local hot-reload dev server (runs on http://localhost:5173)
npm run dev

# Compile and compile-check TypeScript files, and bundle files via Vite
npm run build

# Run ESLint validation on all TypeScript files
npm run lint

# Generate minimum standard icons for PWA application manifest
npm run assets

# Locally preview the built production bundle
npm run preview
```